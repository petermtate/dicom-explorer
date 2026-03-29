import { explicitElementToString, parseDicom, type DataSet, type Element } from "dicom-parser";

import { getSopClassName } from "@/lib/sopClassDictionary";
import { getTransferSyntaxName } from "@/lib/transferSyntaxDictionary";
import type { DicomAttributeNode, ParsedDicomDocument, ValueRange } from "@/types/dicom";
import { getTagInfo } from "@/lib/tagDictionary";

const BINARY_VRS = new Set(["OB", "OD", "OF", "OL", "OV", "OW", "UN"]);
const TEXT_PREVIEW_LIMIT = 256;
const VALUE_LIST_LIMIT = 20;
const IMPLICIT_VR_LITTLE_ENDIAN_UID = "1.2.840.10008.1.2";

function isBinaryVr(vr?: string): boolean {
  if (!vr) {
    return false;
  }

  return vr
    .split(/\s+or\s+/i)
    .map((part) => part.trim())
    .some((part) => BINARY_VRS.has(part));
}

function isFileMetaTag(tag: string): boolean {
  return tag.toLowerCase().startsWith("x0002");
}

function getRawElementValue(dataSet: DataSet, element: Element): string | undefined {
  return explicitElementToString(dataSet, element) ?? dataSet.string(element.tag) ?? undefined;
}

function getRawElementValues(dataSet: DataSet, element: Element): string[] {
  const raw = getRawElementValue(dataSet, element);
  return raw ? raw.split("\\") : [];
}

function formatElementValues(dataSet: DataSet, element: Element, vr?: string): { vm: number; values: string[] } {
  const effectiveVr = vr ?? element.vr ?? "";

  if (element.length === 0) {
    return { vm: 0, values: [] };
  }

  if (isBinaryVr(effectiveVr)) {
    return { vm: 1, values: ["<binary omitted>"] };
  }

  const rawParts = getRawElementValues(dataSet, element);
  if (rawParts.length === 0) {
    return { vm: 1, values: ["<unavailable>"] };
  }

  const values = rawParts.slice(0, VALUE_LIST_LIMIT).map((part) => {
    if (part.length > TEXT_PREVIEW_LIMIT) {
      return `${part.slice(0, TEXT_PREVIEW_LIMIT)}... (truncated)`;
    }
    return part;
  });

  return {
    vm: rawParts.length,
    values
  };
}

function tagImpliesSopClass(tagLabel: string): boolean {
  return /SOP Class UID/i.test(tagLabel);
}

function tagImpliesTransferSyntax(tagLabel: string): boolean {
  return /Transfer Syntax UID/i.test(tagLabel);
}

function getValueInterpretation(
  tagLabel: string,
  vr: string | undefined,
  rawValues: string[]
): string | undefined {
  if (vr !== "UI" || rawValues.length === 0) {
    return undefined;
  }

  const firstValue = rawValues[0];
  if (tagImpliesTransferSyntax(tagLabel)) {
    const transferSyntaxName = getTransferSyntaxName(firstValue);
    return transferSyntaxName ?? "Unknown Transfer Syntax";
  }

  const sopClassName = getSopClassName(firstValue);
  if (sopClassName) {
    return sopClassName;
  }

  if (tagImpliesSopClass(tagLabel)) {
    return "Unknown SOP Class";
  }

  return undefined;
}

function getElementHeaderLength(element: Element, vr: string | undefined, isImplicitTransferSyntax: boolean): number {
  if (isImplicitTransferSyntax && !isFileMetaTag(element.tag)) {
    return 8;
  }

  if (["OB", "OD", "OF", "OL", "OV", "OW", "SQ", "UN", "UT"].includes(vr ?? "")) {
    return 12;
  }

  return 8;
}

function getValueRanges(element: Element, vr: string | undefined, isImplicitTransferSyntax: boolean): ValueRange[] {
  if (element.dataOffset < 0) {
    return [];
  }

  const ranges: ValueRange[] = [];
  const headerLength = getElementHeaderLength(element, vr, isImplicitTransferSyntax);
  const headerStart = element.dataOffset - headerLength;
  const hasExplicitVr = !isImplicitTransferSyntax || isFileMetaTag(element.tag);

  if (headerStart >= 0) {
    const tagEnd = headerStart + 3;
    if (tagEnd < element.dataOffset) {
      ranges.push({
        start: headerStart,
        end: tagEnd,
        kind: "tag"
      });
    }

    if (hasExplicitVr) {
      const vrStart = headerStart + 4;
      const vrEnd = vrStart + 1;
      if (vrEnd < element.dataOffset) {
        ranges.push({
          start: vrStart,
          end: vrEnd,
          kind: "vr"
        });
      }
    }

    const lengthFieldBytes = headerLength === 8 ? 2 : 4;
    const lengthStart = element.dataOffset - lengthFieldBytes;
    if (lengthStart >= 0) {
      ranges.push({
        start: lengthStart,
        end: element.dataOffset - 1,
        kind: "length"
      });
    }
  }

  if (element.length > 0) {
    ranges.push({
      start: element.dataOffset,
      end: element.dataOffset + Math.max(element.length - 1, 0),
      kind: "value"
    });
  }

  return ranges;
}

function buildNodeTree(
  dataSet: DataSet,
  indexById: Map<string, DicomAttributeNode>,
  parentId: string,
  isImplicitTransferSyntax: boolean
): DicomAttributeNode[] {
  return Object.entries(dataSet.elements)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([tag, element], orderIndex) => {
      const id = parentId ? `${parentId}.${tag}.${orderIndex}` : `${tag}.${orderIndex}`;
      const tagInfo = getTagInfo(tag);
      const parsedVr = element.vr;
      const vrSource =
        parsedVr && (!isImplicitTransferSyntax || isFileMetaTag(tag))
          ? "parsed"
          : tagInfo.vr
            ? "dictionary"
            : "unknown";
      const vr = vrSource === "dictionary" ? tagInfo.vr : parsedVr;
      const rawValues = getRawElementValues(dataSet, element);
      const { vm, values } = formatElementValues(dataSet, element, vr);
      const valueInterpretation = getValueInterpretation(tagInfo.tagLabel, vr, rawValues);

      let children: DicomAttributeNode[] = [];
      if (Array.isArray(element.items) && element.items.length > 0) {
        children = element.items.flatMap((item, itemIndex) => {
          if (!item.dataSet) {
            return [];
          }

          return buildNodeTree(item.dataSet, indexById, `${id}.item${itemIndex}`, isImplicitTransferSyntax);
        });
      }

      const node: DicomAttributeNode = {
        id,
        tag,
        tagLabel: tagInfo.tagLabel,
        vr,
        vrSource,
        valueInterpretation,
        vm,
        values,
        valueRanges: getValueRanges(element, vr, isImplicitTransferSyntax),
        children
      };

      indexById.set(node.id, node);
      return node;
    });
}

export async function parseDicomFile(file: File): Promise<ParsedDicomDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = parseDicom(byteArray, {
    vrCallback: (tag) => getTagInfo(tag).parserVr
  });
  const transferSyntaxUid = dataSet.string("x00020010");
  const isImplicitTransferSyntax = transferSyntaxUid === IMPLICIT_VR_LITTLE_ENDIAN_UID;
  const indexById = new Map<string, DicomAttributeNode>();
  const rootNodes = buildNodeTree(dataSet, indexById, "", isImplicitTransferSyntax);

  return {
    fileName: file.name,
    byteArray,
    rootNodes,
    indexById
  };
}

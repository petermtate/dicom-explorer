import { explicitElementToString, parseDicom, type DataSet, type Element } from "dicom-parser";

import { getSopClassName } from "@/lib/sopClassDictionary";
import type { DicomAttributeNode, ParsedDicomDocument, ValueRange } from "@/types/dicom";
import { getTagInfo } from "@/lib/tagDictionary";

const BINARY_VRS = new Set(["OB", "OD", "OF", "OL", "OV", "OW", "UN"]);
const LONG_EXPLICIT_LENGTH_VRS = new Set(["OB", "OD", "OF", "OL", "OV", "OW", "SQ", "UC", "UR", "UT", "UN"]);
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

function getValueInterpretation(
  tagLabel: string,
  vr: string | undefined,
  rawValues: string[]
): string | undefined {
  if (vr !== "UI" || rawValues.length === 0) {
    return undefined;
  }

  const firstValue = rawValues[0];
  const sopClassName = getSopClassName(firstValue);
  if (sopClassName) {
    return sopClassName;
  }

  if (tagImpliesSopClass(tagLabel)) {
    return "Unknown SOP Class";
  }

  return undefined;
}

function getValueRanges(element: Element, vr: string | undefined, usesImplicitVr: boolean): ValueRange[] {
  if (element.dataOffset < 0) {
    return [];
  }

  const normalizedVr = vr?.trim().toUpperCase();
  const usesLongExplicitLength = !usesImplicitVr && normalizedVr ? LONG_EXPLICIT_LENGTH_VRS.has(normalizedVr) : false;

  const headerLength = usesImplicitVr ? 8 : usesLongExplicitLength ? 12 : 8;
  const lengthFieldStart = element.dataOffset - (usesImplicitVr ? 4 : usesLongExplicitLength ? 4 : 2);
  const lengthFieldSize = usesImplicitVr || usesLongExplicitLength ? 4 : 2;
  const tagStart = element.dataOffset - headerLength;
  const ranges: ValueRange[] = [];

  if (tagStart >= 0) {
    ranges.push({
      start: tagStart,
      end: tagStart + 3,
      kind: "tag"
    });
  }

  if (lengthFieldStart >= 0) {
    ranges.push({
      start: lengthFieldStart,
      end: lengthFieldStart + lengthFieldSize - 1,
      kind: "length"
    });
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
      const usesImplicitVr = isImplicitTransferSyntax && !isFileMetaTag(tag);
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
        valueRanges: getValueRanges(element, vr, usesImplicitVr),
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

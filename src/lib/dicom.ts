import { explicitElementToString, parseDicom, type DataSet, type Element } from "dicom-parser";

import { getSopClassName } from "@/lib/sopClassDictionary";
import { getTransferSyntaxName } from "@/lib/transferSyntaxDictionary";
import type { DicomAttributeNode, ParsedDicomDocument, ValueRange } from "@/types/dicom";
import { getTagInfo } from "@/lib/tagDictionary";
import { decodeDicomTextValue } from "@/lib/decodeDicomText";

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

function getElementValueBytes(byteArray: Uint8Array, element: Element): Uint8Array {
  if (typeof element.dataOffset !== "number" || typeof element.length !== "number" || element.length <= 0) {
    return new Uint8Array(0);
  }

  const start = Math.max(element.dataOffset, 0);
  const end = Math.min(start + element.length, byteArray.length);
  if (start >= end) {
    return new Uint8Array(0);
  }

  return byteArray.subarray(start, end);
}

function getRawElementValue(
  dataSet: DataSet,
  byteArray: Uint8Array,
  element: Element,
  vr: string | undefined,
  specificCharacterSet: string | undefined
): string | undefined {
  const decoded = decodeDicomTextValue(specificCharacterSet, getElementValueBytes(byteArray, element), vr);
  if (decoded !== undefined) {
    return decoded;
  }

  return explicitElementToString(dataSet, element) ?? dataSet.string(element.tag) ?? undefined;
}

function getRawElementValues(
  dataSet: DataSet,
  byteArray: Uint8Array,
  element: Element,
  vr: string | undefined,
  specificCharacterSet: string | undefined
): string[] {
  const raw = getRawElementValue(dataSet, byteArray, element, vr, specificCharacterSet);
  return raw ? raw.split("\\") : [];
}

function formatElementValues(
  dataSet: DataSet,
  byteArray: Uint8Array,
  element: Element,
  vr: string | undefined,
  specificCharacterSet: string | undefined
): { vm: number; values: string[] } {
  const effectiveVr = vr ?? element.vr ?? "";

  if (element.length === 0) {
    return { vm: 0, values: [] };
  }

  if (isBinaryVr(effectiveVr)) {
    return { vm: 1, values: ["<binary omitted>"] };
  }

  const rawParts = getRawElementValues(dataSet, byteArray, element, vr, specificCharacterSet);
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

const REGION_SPATIAL_FORMAT_INTERPRETATIONS: Record<string, string> = {
  "0": "None or not applicable",
  "1": "2D (tissue or flow)",
  "2": "M-Mode (tissue or flow)",
  "3": "Spectral (CW or PW Doppler)",
  "4": "Wave form (physiological traces, Doppler traces,…)",
  "5": "Graphics"
};

function getRegionSpatialFormatInterpretation(tag: string, rawValues: string[]): string | undefined {
  if (tag.toLowerCase() !== "x00186012" || rawValues.length === 0) {
    return undefined;
  }

  const firstValue = rawValues[0].trim();
  return REGION_SPATIAL_FORMAT_INTERPRETATIONS[firstValue];
}

function getValueInterpretation(
  tag: string,
  tagLabel: string,
  vr: string | undefined,
  rawValues: string[]
): string | undefined {
  const regionSpatialFormatInterpretation = getRegionSpatialFormatInterpretation(tag, rawValues);
  if (regionSpatialFormatInterpretation) {
    return regionSpatialFormatInterpretation;
  }

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
  byteArray: Uint8Array,
  indexById: Map<string, DicomAttributeNode>,
  parentId: string,
  isImplicitTransferSyntax: boolean,
  specificCharacterSet: string | undefined
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
      const rawValues = getRawElementValues(dataSet, byteArray, element, vr, specificCharacterSet);
      const { vm, values } = formatElementValues(dataSet, byteArray, element, vr, specificCharacterSet);
      const valueInterpretation = getValueInterpretation(tag, tagInfo.tagLabel, vr, rawValues);

      let children: DicomAttributeNode[] = [];
      if (Array.isArray(element.items) && element.items.length > 0) {
        children = element.items.flatMap((item, itemIndex) => {
          if (!item.dataSet) {
            return [];
          }

          return buildNodeTree(item.dataSet, byteArray, indexById, `${id}.item${itemIndex}`, isImplicitTransferSyntax, specificCharacterSet);
        });
      }

      const node: DicomAttributeNode = {
        id,
        tag,
        tagLabel: tagInfo.tagLabel,
        vr,
        vrSource,
        valueInterpretation,
        valueLength: typeof element.length === "number" ? element.length : undefined,
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
  const specificCharacterSet = dataSet.string("x00080005");
  const isImplicitTransferSyntax = transferSyntaxUid === IMPLICIT_VR_LITTLE_ENDIAN_UID;
  const indexById = new Map<string, DicomAttributeNode>();
  const rootNodes = buildNodeTree(dataSet, byteArray, indexById, "", isImplicitTransferSyntax, specificCharacterSet);

  return {
    fileName: file.name,
    byteArray,
    rootNodes,
    indexById
  };
}

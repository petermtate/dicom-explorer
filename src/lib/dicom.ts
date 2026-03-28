import { explicitElementToString, parseDicom, type DataSet, type Element } from "dicom-parser";

import type { DicomAttributeNode, ParsedDicomDocument, ValueRange } from "@/types/dicom";
import { getTagLabel } from "@/lib/tagDictionary";

const BINARY_VRS = new Set(["OB", "OD", "OF", "OL", "OV", "OW", "UN"]);
const TEXT_PREVIEW_LIMIT = 256;
const VALUE_LIST_LIMIT = 20;

function formatElementValues(dataSet: DataSet, element: Element): { vm: number; values: string[] } {
  const vr = element.vr ?? "";

  if (element.length === 0) {
    return { vm: 0, values: [] };
  }

  if (BINARY_VRS.has(vr)) {
    return { vm: 1, values: ["<binary omitted>"] };
  }

  const raw = explicitElementToString(dataSet, element) ?? dataSet.string(element.tag);
  if (!raw) {
    return { vm: 1, values: ["<unavailable>"] };
  }

  const parts = raw.split("\\").slice(0, VALUE_LIST_LIMIT);
  const values = parts.map((part) => {
    if (part.length > TEXT_PREVIEW_LIMIT) {
      return `${part.slice(0, TEXT_PREVIEW_LIMIT)}... (truncated)`;
    }
    return part;
  });

  return {
    vm: raw.length > 0 ? raw.split("\\").length : 0,
    values
  };
}

function getValueRanges(element: Element): ValueRange[] {
  if (element.length <= 0 || element.dataOffset < 0) {
    return [];
  }

  return [
    {
      start: element.dataOffset,
      end: element.dataOffset + Math.max(element.length - 1, 0),
      kind: "value"
    }
  ];
}

function buildNodeTree(
  dataSet: DataSet,
  indexById: Map<string, DicomAttributeNode>,
  parentId: string
): DicomAttributeNode[] {
  return Object.entries(dataSet.elements)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([tag, element], orderIndex) => {
      const id = parentId ? `${parentId}.${tag}.${orderIndex}` : `${tag}.${orderIndex}`;
      const { vm, values } = formatElementValues(dataSet, element);

      let children: DicomAttributeNode[] = [];
      if (Array.isArray(element.items) && element.items.length > 0) {
        children = element.items.flatMap((item, itemIndex) => {
          if (!item.dataSet) {
            return [];
          }

          return buildNodeTree(item.dataSet, indexById, `${id}.item${itemIndex}`);
        });
      }

      const node: DicomAttributeNode = {
        id,
        tag,
        tagLabel: getTagLabel(tag),
        vr: element.vr,
        vm,
        values,
        valueRanges: getValueRanges(element),
        children
      };

      indexById.set(node.id, node);
      return node;
    });
}

export async function parseDicomFile(file: File): Promise<ParsedDicomDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);
  const dataSet = parseDicom(byteArray);
  const indexById = new Map<string, DicomAttributeNode>();
  const rootNodes = buildNodeTree(dataSet, indexById, "");

  return {
    fileName: file.name,
    byteArray,
    rootNodes,
    indexById
  };
}

import type { ParsedDicomDocument } from "@/types/dicom";

export function findNodeIdByOffset(document: ParsedDicomDocument, offset: number): string | null {
  let bestNodeId: string | null = null;
  let bestSpan = Number.POSITIVE_INFINITY;
  let bestKindScore = Number.POSITIVE_INFINITY;
  const kindScores: Record<string, number> = {
    value: 0,
    tag: 1,
    length: 2
  };

  for (const node of document.indexById.values()) {
    for (const range of node.valueRanges) {
      if (offset < range.start || offset > range.end) {
        continue;
      }

      const span = range.end - range.start;
      const kindScore = kindScores[range.kind] ?? Number.POSITIVE_INFINITY;

      if (span < bestSpan || (span === bestSpan && kindScore < bestKindScore)) {
        bestNodeId = node.id;
        bestSpan = span;
        bestKindScore = kindScore;
      }
    }
  }

  return bestNodeId;
}

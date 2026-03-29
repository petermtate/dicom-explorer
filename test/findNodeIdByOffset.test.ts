import { describe, expect, it } from "vitest";

import { findNodeIdByOffset } from "@/lib/findNodeIdByOffset";
import type { DicomAttributeNode, ParsedDicomDocument } from "@/types/dicom";

function createNode(overrides: Partial<DicomAttributeNode>): DicomAttributeNode {
  return {
    id: "node",
    tag: "x00100010",
    tagLabel: "Patient Name",
    vr: "PN",
    vrSource: "parsed",
    vm: 1,
    values: ["DOE^JOHN"],
    valueRanges: [],
    children: [],
    ...overrides
  };
}

function createDocument(nodes: DicomAttributeNode[]): ParsedDicomDocument {
  return {
    fileName: "sample.dcm",
    byteArray: new Uint8Array(64),
    rootNodes: nodes,
    indexById: new Map(nodes.map((node) => [node.id, node]))
  };
}

describe("findNodeIdByOffset", () => {
  it("returns null when no node range contains the offset", () => {
    const node = createNode({
      id: "a",
      valueRanges: [{ start: 10, end: 20, kind: "value" }]
    });

    const document = createDocument([node]);

    expect(findNodeIdByOffset(document, 5)).toBeNull();
  });

  it("returns the node with the smallest matching range", () => {
    const parent = createNode({
      id: "parent",
      valueRanges: [{ start: 8, end: 30, kind: "value" }]
    });
    const child = createNode({
      id: "child",
      valueRanges: [{ start: 12, end: 14, kind: "value" }]
    });

    const document = createDocument([parent, child]);

    expect(findNodeIdByOffset(document, 13)).toBe("child");
  });

  it("prefers a value match over tag/length matches for equal spans", () => {
    const tagNode = createNode({
      id: "tag",
      valueRanges: [{ start: 40, end: 47, kind: "tag" }]
    });
    const lengthNode = createNode({
      id: "length",
      valueRanges: [{ start: 40, end: 47, kind: "length" }]
    });
    const valueNode = createNode({
      id: "value",
      valueRanges: [{ start: 40, end: 47, kind: "value" }]
    });

    const document = createDocument([tagNode, lengthNode, valueNode]);

    expect(findNodeIdByOffset(document, 42)).toBe("value");
  });
});

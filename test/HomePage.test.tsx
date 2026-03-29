import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ParsedDicomDocument } from "@/types/dicom";

const { parseDicomFile, hexViewerSpy } = vi.hoisted(() => ({
  parseDicomFile: vi.fn(),
  hexViewerSpy: vi.fn()
}));

vi.mock("@/lib/dicom", () => ({
  parseDicomFile
}));

vi.mock("@/components/FileDropZone", () => ({
  default: ({ onFileSelected }: { onFileSelected: (file: File) => void }) => (
    <button type="button" onClick={() => onFileSelected(new File(["fixture"], "sample.dcm"))}>
      Upload fixture
    </button>
  )
}));

vi.mock("@/components/AttributeTree", () => ({
  default: () => <div>Attribute tree</div>
}));

vi.mock("@/components/AttributeDetailsPanel", () => ({
  default: () => <div>Attribute details</div>
}));

vi.mock("@/components/HexViewer", () => ({
  default: ({ highlights }: { highlights: { kind: string }[] }) => {
    hexViewerSpy(highlights);
    return <div>Hex highlights: {highlights.map((highlight) => highlight.kind).join(",")}</div>;
  }
}));

import HomePage from "@/app/page";

describe("HomePage", () => {
  beforeEach(() => {
    parseDicomFile.mockReset();
    hexViewerSpy.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("passes tag, length, and value ranges to the hex viewer for the selected node", async () => {
    const document: ParsedDicomDocument = {
      fileName: "sample.dcm",
      byteArray: new Uint8Array([0, 1, 2, 3]),
      rootNodes: [
        {
          id: "node-1",
          tag: "x00100010",
          tagLabel: "Patient's Name",
          vr: "PN",
          vrSource: "parsed",
          vm: 1,
          values: ["DOE^JOHN"],
          valueRanges: [
            { start: 0, end: 3, kind: "tag" },
            { start: 4, end: 5, kind: "vr" },
            { start: 6, end: 7, kind: "length" },
            { start: 8, end: 15, kind: "value" }
          ],
          children: []
        }
      ],
      indexById: new Map()
    };
    document.indexById.set("node-1", document.rootNodes[0]);
    parseDicomFile.mockResolvedValue(document);

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "Upload fixture" }));

    await waitFor(() => {
      expect(parseDicomFile).toHaveBeenCalled();
      expect(screen.getByText("Hex highlights: tag,vr,length,value")).toBeInTheDocument();
    });

    expect(hexViewerSpy).toHaveBeenLastCalledWith([
      { start: 0, end: 3, kind: "tag" },
      { start: 4, end: 5, kind: "vr" },
      { start: 6, end: 7, kind: "length" },
      { start: 8, end: 15, kind: "value" }
    ]);
  });
});

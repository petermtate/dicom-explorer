import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import AttributeDetailsPanel from "@/components/AttributeDetailsPanel";
import type { DicomAttributeNode, ParsedDicomDocument } from "@/types/dicom";

function createDocument(nodes: DicomAttributeNode[]): ParsedDicomDocument {
  return {
    fileName: "sample.dcm",
    byteArray: new Uint8Array(),
    rootNodes: nodes,
    indexById: new Map(nodes.map((node) => [node.id, node]))
  };
}

function createNode(id: string, tag: string, tagLabel: string, values: string[], valueInterpretation?: string): DicomAttributeNode {
  return {
    id,
    tag,
    tagLabel,
    vr: "LO",
    vrSource: "parsed",
    valueInterpretation,
    valueLength: values.join("\\").length,
    vm: values.length,
    values,
    valueRanges: [],
    children: []
  };
}

describe("AttributeDetailsPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a file summary when no node is selected", () => {
    const document = createDocument([
      createNode("patient-name", "x00100010", "Patient's Name", ["DOE^JOHN"]),
      createNode("modality", "x00080060", "Modality", ["CT"]),
      createNode("sop-class", "x00080016", "SOP Class UID", ["1.2.3"], "CT Image Storage"),
      createNode("transfer-syntax", "x00020010", "Transfer Syntax UID", ["1.2.4"], "Explicit VR Little Endian"),
      createNode("character-set", "x00080005", "Specific Character Set", ["ISO_IR 100"])
    ]);

    render(<AttributeDetailsPanel document={document} node={null} />);

    expect(screen.getByRole("region", { name: "File summary" })).toBeInTheDocument();
    expect(screen.getByText("DOE^JOHN")).toBeInTheDocument();
    expect(screen.getByText("CT")).toBeInTheDocument();
    expect(screen.getByText("1.2.3 (CT Image Storage)")).toBeInTheDocument();
    expect(screen.getByText("1.2.4 (Explicit VR Little Endian)")).toBeInTheDocument();
    expect(screen.getByText("ISO_IR 100")).toBeInTheDocument();
  });

  it("does not render summary attributes with missing or empty values", () => {
    const document = createDocument([
      createNode("patient-name", "x00100010", "Patient's Name", ["DOE^JOHN"]),
      createNode("modality", "x00080060", "Modality", []),
      createNode("character-set", "x00080005", "Specific Character Set", ["<unavailable>"])
    ]);

    render(<AttributeDetailsPanel document={document} node={null} />);

    expect(screen.getByText("Patient's Name")).toBeInTheDocument();
    expect(screen.queryByText("Modality")).not.toBeInTheDocument();
    expect(screen.queryByText("Specific Character Set")).not.toBeInTheDocument();
    expect(screen.queryByText(/not available/i)).not.toBeInTheDocument();
  });

  it("renders a placeholder before a file is loaded", () => {
    render(<AttributeDetailsPanel document={null} node={null} />);
    expect(screen.getByText(/load a dicom file/i)).toBeInTheDocument();
  });

  it("renders selected node details", () => {
    render(
      <AttributeDetailsPanel
        document={null}
        node={{
          id: "x00100010.0",
          tag: "x00100010",
          tagLabel: "Patient Name",
          vr: "PN",
          vrSource: "parsed",
          valueInterpretation: undefined,
          valueLength: 8,
          vm: 1,
          values: ["DOE^JOHN"],
          valueRanges: [{ start: 200, end: 207, kind: "value" }],
          children: []
        }}
      />
    );

    expect(screen.getByText("Patient Name")).toBeInTheDocument();
    expect(screen.getByText("DOE^JOHN")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("(0010,0010)")).toBeInTheDocument();
  });

  it("labels dictionary-derived VR values as inferred", () => {
    render(
      <AttributeDetailsPanel
        document={null}
        node={{
          id: "x7fe00010.0",
          tag: "x7fe00010",
          tagLabel: "Pixel Data",
          vr: "OB or OW",
          vrSource: "dictionary",
          valueInterpretation: undefined,
          valueLength: 512,
          vm: 1,
          values: ["<binary omitted>"],
          valueRanges: [{ start: 512, end: 1023, kind: "value" }],
          children: []
        }}
      />
    );

    expect(screen.getByText("OB or OW (inferred from dictionary)")).toBeInTheDocument();
  });

  it("renders value interpretation when present", () => {
    render(
      <AttributeDetailsPanel
        document={null}
        node={{
          id: "x00080016.0",
          tag: "x00080016",
          tagLabel: "SOP Class UID",
          vr: "UI",
          vrSource: "parsed",
          valueInterpretation: "Ultrasound Multi-frame Image Storage",
          valueLength: 28,
          vm: 1,
          values: ["1.2.840.10008.5.1.4.1.1.3.1"],
          valueRanges: [{ start: 128, end: 155, kind: "value" }],
          children: []
        }}
      />
    );

    expect(screen.getByText("Value Interpretation")).toBeInTheDocument();
    expect(screen.getByText("Ultrasound Multi-frame Image Storage")).toBeInTheDocument();
  });

  it("renders unknown when value length is unavailable", () => {
    render(
      <AttributeDetailsPanel
        document={null}
        node={{
          id: "x00080020.0",
          tag: "x00080020",
          tagLabel: "Study Date",
          vr: "DA",
          vrSource: "parsed",
          valueInterpretation: undefined,
          vm: 1,
          values: ["20260101"],
          valueRanges: [{ start: 300, end: 307, kind: "value" }],
          children: []
        }}
      />
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("renders undefined for SQ attributes with undefined length", () => {
    render(
      <AttributeDetailsPanel
        document={null}
        node={{
          id: "x00082112.0",
          tag: "x00082112",
          tagLabel: "Source Image Sequence",
          vr: "SQ",
          vrSource: "parsed",
          valueInterpretation: undefined,
          valueLength: 0xffffffff,
          vm: 0,
          values: [],
          valueRanges: [],
          children: []
        }}
      />
    );

    expect(screen.getByText("Undefined")).toBeInTheDocument();
  });
});

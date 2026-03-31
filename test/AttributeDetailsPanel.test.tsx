import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AttributeDetailsPanel from "@/components/AttributeDetailsPanel";

describe("AttributeDetailsPanel", () => {
  it("renders placeholder when no node is selected", () => {
    render(<AttributeDetailsPanel node={null} />);
    expect(screen.getByText(/select an attribute/i)).toBeInTheDocument();
  });

  it("renders selected node details", () => {
    render(
      <AttributeDetailsPanel
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

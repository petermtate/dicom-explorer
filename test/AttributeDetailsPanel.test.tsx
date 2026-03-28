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
  });
});

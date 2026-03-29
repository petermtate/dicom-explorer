import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HexViewer from "@/components/HexViewer";

describe("HexViewer", () => {
  it("shows empty state when no bytes are provided", () => {
    render(<HexViewer bytes={null} highlightRanges={[]} />);
    expect(screen.getByText(/no bytes/i)).toBeInTheDocument();
  });

  it("highlights tag, length, and value ranges with distinct classes", () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const { container } = render(
      <HexViewer
        bytes={bytes}
        highlightRanges={[
          { start: 0, end: 1, kind: "tag" },
          { start: 2, end: 3, kind: "length" },
          { start: 4, end: 6, kind: "value" }
        ]}
      />
    );

    expect(container.querySelectorAll(".hex-byte.is-tag-highlighted")).toHaveLength(2);
    expect(container.querySelectorAll(".hex-byte.is-length-highlighted")).toHaveLength(2);
    expect(container.querySelectorAll(".hex-byte.is-value-highlighted")).toHaveLength(3);
    expect(screen.getByText("00")).toBeInTheDocument();
  });

  it("starts the window two rows before the highlighted byte when possible", () => {
    const bytes = new Uint8Array(5000).map((_, index) => index % 256);

    render(<HexViewer bytes={bytes} highlightRanges={[{ start: 320, end: 324, kind: "value" }]} />);

    expect(screen.getByText(/Showing bytes 288 to 4383 of 5000/i)).toBeInTheDocument();
    expect(screen.getByText("00000120")).toBeInTheDocument();
  });

  it("falls back to the beginning when highlight is near the top", () => {
    const bytes = new Uint8Array(5000).map((_, index) => index % 256);

    render(<HexViewer bytes={bytes} highlightRanges={[{ start: 20, end: 24, kind: "value" }]} />);

    expect(screen.getByText(/Showing bytes 0 to 4095 of 5000/i)).toBeInTheDocument();
  });

});

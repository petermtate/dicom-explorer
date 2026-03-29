import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import HexViewer from "@/components/HexViewer";

describe("HexViewer", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows empty state when no bytes are provided", () => {
    render(<HexViewer bytes={null} highlights={[]} />);
    expect(screen.getByText(/no bytes/i)).toBeInTheDocument();
  });

  it("highlights tag and length ranges with distinct classes", () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const { container } = render(
      <HexViewer
        bytes={bytes}
        highlights={[
          { start: 2, end: 4, kind: "tag" },
          { start: 7, end: 8, kind: "length" }
        ]}
      />
    );

    const highlightedTag = container.querySelectorAll(".hex-byte.is-highlighted-tag");
    const highlightedLength = container.querySelectorAll(".hex-byte.is-highlighted-length");
    expect(highlightedTag).toHaveLength(3);
    expect(highlightedLength).toHaveLength(2);
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("starts the window two rows before the highlighted byte when possible", () => {
    const bytes = new Uint8Array(5000).map((_, index) => index % 256);

    render(<HexViewer bytes={bytes} highlights={[{ start: 320, end: 324, kind: "tag" }]} />);

    expect(screen.getByText(/Showing bytes 288 to 4383 of 5000/i)).toBeInTheDocument();
    expect(screen.getByText("00000120")).toBeInTheDocument();
  });

  it("falls back to the beginning when highlight is near the top", () => {
    const bytes = new Uint8Array(5000).map((_, index) => index % 256);

    render(<HexViewer bytes={bytes} highlights={[{ start: 20, end: 24, kind: "tag" }]} />);

    expect(screen.getByText(/Showing bytes 0 to 4095 of 5000/i)).toBeInTheDocument();
  });

  it("calls onByteClick with the clicked byte offset", () => {
    const onByteClick = vi.fn();
    const bytes = new Uint8Array([0, 1, 2, 3]);

    render(<HexViewer bytes={bytes} highlights={[]} onByteClick={onByteClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Byte 2" }));

    expect(onByteClick).toHaveBeenCalledWith(2);
  });

});

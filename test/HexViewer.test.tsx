import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import HexViewer from "@/components/HexViewer";

describe("HexViewer", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows empty state when no bytes are provided", () => {
    render(<HexViewer bytes={null} highlight={null} />);
    expect(screen.getByText(/no bytes/i)).toBeInTheDocument();
  });

  it("highlights selected byte range", () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const { container } = render(<HexViewer bytes={bytes} highlight={{ start: 2, end: 4 }} />);

    const highlighted = container.querySelectorAll(".hex-byte.is-highlighted");
    expect(highlighted).toHaveLength(3);
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("starts the window two rows before the highlighted byte when possible", () => {
    const bytes = new Uint8Array(5000).map((_, index) => index % 256);

    render(<HexViewer bytes={bytes} highlight={{ start: 320, end: 324 }} />);

    expect(screen.getByText(/Showing bytes 288 to 4383 of 5000/i)).toBeInTheDocument();
    expect(screen.getByText("00000120")).toBeInTheDocument();
  });

  it("falls back to the beginning when highlight is near the top", () => {
    const bytes = new Uint8Array(5000).map((_, index) => index % 256);

    render(<HexViewer bytes={bytes} highlight={{ start: 20, end: 24 }} />);

    expect(screen.getByText(/Showing bytes 0 to 4095 of 5000/i)).toBeInTheDocument();
  });

  it("calls onByteClick with the clicked byte offset", () => {
    const onByteClick = vi.fn();
    const bytes = new Uint8Array([0, 1, 2, 3]);

    render(<HexViewer bytes={bytes} highlight={null} onByteClick={onByteClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Byte 2" }));

    expect(onByteClick).toHaveBeenCalledWith(2);
  });

});

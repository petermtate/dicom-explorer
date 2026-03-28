import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HexViewer from "@/components/HexViewer";

describe("HexViewer", () => {
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
});

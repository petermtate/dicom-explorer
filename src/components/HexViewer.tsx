"use client";

import React from "react";
import { useMemo } from "react";

import type { ValueRange } from "@/types/dicom";

type Props = {
  bytes: Uint8Array | null;
  highlights: ValueRange[];
  onByteClick?: (offset: number) => void;
};

const BYTES_PER_ROW = 16;
const WINDOW_BYTES = 4096;

function toHex(value: number, width = 2): string {
  return value.toString(16).toUpperCase().padStart(width, "0");
}

export default function HexViewer({ bytes, highlights, onByteClick }: Props) {
  const primaryHighlight = highlights[0] ?? null;
  const { viewStart, viewEnd } = useMemo(() => {
    if (!bytes || bytes.length === 0) {
      return { viewStart: 0, viewEnd: 0 };
    }

    if (!primaryHighlight) {
      return { viewStart: 0, viewEnd: Math.min(bytes.length, WINDOW_BYTES) };
    }

    const highlightStartRow = Math.floor(primaryHighlight.start / BYTES_PER_ROW);
    const preferredStartRow = Math.max(highlightStartRow - 2, 0);
    let start = preferredStartRow * BYTES_PER_ROW;
    let end = Math.min(start + WINDOW_BYTES, bytes.length);

    if (end - start < WINDOW_BYTES) {
      start = Math.max(end - WINDOW_BYTES, 0);
    }

    return { viewStart: start, viewEnd: end };
  }, [bytes, primaryHighlight]);

  if (!bytes || bytes.length === 0) {
    return <p className="placeholder">No bytes to display.</p>;
  }

  const rows: number[] = [];
  for (let offset = viewStart; offset < viewEnd; offset += BYTES_PER_ROW) {
    rows.push(offset);
  }

  return (
    <div className="hex-container">
      <p className="hex-caption">
        Showing bytes {viewStart} to {Math.max(viewEnd - 1, 0)} of {bytes.length}
      </p>
      <div className="hex-grid">
        {rows.map((rowOffset) => {
          const row = Array.from(bytes.slice(rowOffset, Math.min(rowOffset + BYTES_PER_ROW, viewEnd)));

          return (
            <div className="hex-row" key={`row-${rowOffset}`}>
              <span className="hex-offset">{toHex(rowOffset, 8)}</span>
              <div className="hex-values">
                {row.map((value, index) => {
                  const absolute = rowOffset + index;
                  const matchingHighlight = highlights.find(
                    (highlight) => absolute >= highlight.start && absolute <= highlight.end
                  );
                  const highlightClass = matchingHighlight
                    ? matchingHighlight.kind === "tag"
                      ? "is-highlighted-tag"
                      : matchingHighlight.kind === "vr"
                        ? "is-highlighted-vr"
                      : matchingHighlight.kind === "length"
                        ? "is-highlighted-length"
                        : "is-highlighted"
                    : "";

                  return (
                    <button
                      type="button"
                      className={`hex-byte ${highlightClass}`}
                      key={`byte-${absolute}`}
                      onClick={() => onByteClick?.(absolute)}
                      aria-label={`Byte ${absolute}`}
                    >
                      {toHex(value)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

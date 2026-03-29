"use client";

import React from "react";
import { useMemo } from "react";

import type { ValueRange } from "@/types/dicom";

type Props = {
  bytes: Uint8Array | null;
  highlightRanges?: ValueRange[];
  highlightRange?: ValueRange | null;
};

const BYTES_PER_ROW = 16;
const WINDOW_BYTES = 4096;
const KIND_ORDER: Record<ValueRange["kind"], number> = {
  tag: 0,
  length: 1,
  value: 2
};

function toHex(value: number, width = 2): string {
  return value.toString(16).toUpperCase().padStart(width, "0");
}

export default function HexViewer({ bytes, highlightRanges = [], highlightRange = null }: Props) {
  const normalizedRanges = useMemo(() => {
    const mergedRanges = highlightRanges.length > 0 ? highlightRanges : highlightRange ? [highlightRange] : [];

    return [...mergedRanges].sort((left, right) => {
      if (left.start !== right.start) {
        return left.start - right.start;
      }

      if (left.end !== right.end) {
        return left.end - right.end;
      }

      return KIND_ORDER[left.kind] - KIND_ORDER[right.kind];
    });
  }, [highlightRange, highlightRanges]);

  const firstHighlight = normalizedRanges[0] ?? null;

  const { viewStart, viewEnd } = useMemo(() => {
    if (!bytes || bytes.length === 0) {
      return { viewStart: 0, viewEnd: 0 };
    }

    if (!firstHighlight) {
      return { viewStart: 0, viewEnd: Math.min(bytes.length, WINDOW_BYTES) };
    }

    const highlightStartRow = Math.floor(firstHighlight.start / BYTES_PER_ROW);
    const preferredStartRow = Math.max(highlightStartRow - 2, 0);
    let start = preferredStartRow * BYTES_PER_ROW;
    let end = Math.min(start + WINDOW_BYTES, bytes.length);

    if (end - start < WINDOW_BYTES) {
      start = Math.max(end - WINDOW_BYTES, 0);
    }

    return { viewStart: start, viewEnd: end };
  }, [bytes, firstHighlight]);

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
                  const matchingRange = normalizedRanges.find(
                    (range) => absolute >= range.start && absolute <= range.end
                  );
                  const highlightClass = matchingRange ? `is-${matchingRange.kind}-highlighted` : "";

                  return (
                    <span className={`hex-byte ${highlightClass}`.trim()} key={`byte-${absolute}`}>
                      {toHex(value)}
                    </span>
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

import { describe, expect, it } from "vitest";

import { formatDicomTag } from "@/lib/formatDicomTag";

describe("formatDicomTag", () => {
  it("formats dicom-parser style tags with parentheses and a comma", () => {
    expect(formatDicomTag("x00080016")).toBe("(0008,0016)");
  });

  it("normalizes mixed-case tags", () => {
    expect(formatDicomTag("X00100010")).toBe("(0010,0010)");
  });

  it("falls back to uppercase when the tag is not eight hex digits", () => {
    expect(formatDicomTag("not-a-tag")).toBe("NOT-A-TAG");
  });
});

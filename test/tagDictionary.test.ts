import { describe, expect, it } from "vitest";

import { getTagLabel } from "@/lib/tagDictionary";

describe("getTagLabel", () => {
  it("returns known tag labels", () => {
    expect(getTagLabel("x00100010")).toBe("Patient Name");
  });

  it("returns unknown fallback", () => {
    expect(getTagLabel("x12340001")).toBe("Unknown (1234,0001)");
  });
});

import { describe, expect, it } from "vitest";

import { getSopClassName } from "@/lib/sopClassDictionary";

describe("getSopClassName", () => {
  it("returns known SOP class names", () => {
    expect(getSopClassName("1.2.840.10008.5.1.4.1.1.3.1")).toBe("Ultrasound Multi-frame Image Storage");
  });

  it("returns undefined for unknown SOP classes", () => {
    expect(getSopClassName("9.9.9")).toBeUndefined();
  });
});

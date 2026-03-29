import { describe, expect, it } from "vitest";

import { getTransferSyntaxName } from "@/lib/transferSyntaxDictionary";

describe("getTransferSyntaxName", () => {
  it("returns a name for known transfer syntax UIDs", () => {
    expect(getTransferSyntaxName("1.2.840.10008.1.2")).toBe("Implicit VR Little Endian");
    expect(getTransferSyntaxName("1.2.840.10008.1.2.1")).toBe("Explicit VR Little Endian");
  });

  it("returns undefined for unknown transfer syntax UIDs", () => {
    expect(getTransferSyntaxName("9.9.9")).toBeUndefined();
  });
});

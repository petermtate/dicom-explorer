import { describe, expect, it } from "vitest";

import { getTagInfo, getTagLabel } from "@/lib/tagDictionary";

describe("getTagLabel", () => {
  it("returns known tag labels", () => {
    expect(getTagLabel("x00100010")).toBe("Patient's Name");
  });

  it("returns VR metadata for known public tags", () => {
    expect(getTagInfo("x00100010")).toMatchObject({
      tagLabel: "Patient's Name",
      vr: "PN",
      parserVr: "PN",
      isPrivate: false
    });
  });

  it("normalizes dictionary VRs for parser callbacks", () => {
    expect(getTagInfo("x7fe00010")).toMatchObject({
      tagLabel: "Pixel Data",
      vr: "OB or OW",
      parserVr: "OB"
    });
  });

  it("identifies private tags", () => {
    expect(getTagInfo("x00110010")).toMatchObject({
      isPrivate: true
    });
  });

  it("returns unknown fallback", () => {
    expect(getTagLabel("x12340001")).toBe("Unknown (1234,0001)");
  });

  it("returns file meta information labels for group 0002 tags", () => {
    expect(getTagLabel("x00020010")).toBe("Transfer Syntax UID");
    expect(getTagLabel("x00020012")).toBe("Implementation Class UID");
  });

  it("returns VR metadata for file meta information tags", () => {
    expect(getTagInfo("x00020010")).toMatchObject({
      tagLabel: "Transfer Syntax UID",
      vr: "UI",
      parserVr: "UI",
      isPrivate: false
    });
  });
});

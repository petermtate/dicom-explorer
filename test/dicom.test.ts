import { beforeEach, describe, expect, it, vi } from "vitest";

const { explicitElementToString, parseDicom } = vi.hoisted(() => ({
  explicitElementToString: vi.fn(),
  parseDicom: vi.fn()
}));

vi.mock("dicom-parser", () => ({
  explicitElementToString,
  parseDicom
}));

import { parseDicomFile } from "@/lib/dicom";

describe("parseDicomFile", () => {
  beforeEach(() => {
    explicitElementToString.mockReset();
    parseDicom.mockReset();
  });

  it("marks VRs from implicit transfer syntax as dictionary-derived", async () => {
    const patientNameElement = {
      tag: "x00100010",
      vr: "PN",
      length: 8,
      dataOffset: 128
    };
    const dataSet = {
      elements: {
        x00100010: patientNameElement
      },
      string: vi.fn((tag: string) => {
        if (tag === "x00020010") {
          return "1.2.840.10008.1.2";
        }
        return undefined;
      })
    };

    parseDicom.mockImplementation((byteArray: Uint8Array, options?: { vrCallback?: (tag: string) => string | undefined }) => {
      expect(byteArray).toBeInstanceOf(Uint8Array);
      expect(options?.vrCallback?.("x00100010")).toBe("PN");
      expect(options?.vrCallback?.("x7fe00010")).toBe("OB");
      return dataSet;
    });
    explicitElementToString.mockReturnValue("DOE^JOHN");

    const file = {
      name: "implicit.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00100010",
      tagLabel: "Patient's Name",
      vr: "PN",
      vrSource: "dictionary",
      vm: 1,
      values: ["DOE^JOHN"]
    });
  });

  it("preserves parsed VRs for explicit transfer syntax", async () => {
    const dataSet = {
      elements: {
        x00080016: {
          tag: "x00080016",
          vr: "UI",
          length: 25,
          dataOffset: 256
        }
      },
      string: vi.fn((tag: string) => {
        if (tag === "x00020010") {
          return "1.2.840.10008.1.2.1";
        }
        return undefined;
      })
    };

    parseDicom.mockReturnValue(dataSet);
    explicitElementToString.mockReturnValue("1.2.840.10008.5.1.4.1.1.2");

    const file = {
      name: "explicit.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([4, 5, 6]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00080016",
      tagLabel: "SOP Class UID",
      vr: "UI",
      vrSource: "parsed",
      valueInterpretation: "CT Image Storage"
    });
  });

  it("marks unknown SOP class UIDs on SOP class tags", async () => {
    const dataSet = {
      elements: {
        x00080016: {
          tag: "x00080016",
          vr: "UI",
          length: 25,
          dataOffset: 64
        }
      },
      string: vi.fn((tag: string) => {
        if (tag === "x00020010") {
          return "1.2.840.10008.1.2.1";
        }
        return undefined;
      })
    };

    parseDicom.mockReturnValue(dataSet);
    explicitElementToString.mockReturnValue("9.9.9");

    const file = {
      name: "unknown-sop.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([7, 8, 9]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00080016",
      valueInterpretation: "Unknown SOP Class"
    });
  });

  it("does not interpret unrelated unknown UI values", async () => {
    const dataSet = {
      elements: {
        x00081155: {
          tag: "x00081155",
          vr: "UI",
          length: 10,
          dataOffset: 88
        }
      },
      string: vi.fn((tag: string) => {
        if (tag === "x00020010") {
          return "1.2.840.10008.1.2.1";
        }
        return undefined;
      })
    };

    parseDicom.mockReturnValue(dataSet);
    explicitElementToString.mockReturnValue("9.9.9");

    const file = {
      name: "unrelated-ui.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([10, 11, 12]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0].valueInterpretation).toBeUndefined();
  });

  it("uses only the first UI value for interpretation", async () => {
    const dataSet = {
      elements: {
        x00080016: {
          tag: "x00080016",
          vr: "UI",
          length: 50,
          dataOffset: 128
        }
      },
      string: vi.fn((tag: string) => {
        if (tag === "x00020010") {
          return "1.2.840.10008.1.2.1";
        }
        return undefined;
      })
    };

    parseDicom.mockReturnValue(dataSet);
    explicitElementToString.mockReturnValue("1.2.840.10008.5.1.4.1.1.3.1\\9.9.9");

    const file = {
      name: "multi-ui.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([13, 14, 15]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      vm: 2,
      valueInterpretation: "Ultrasound Multi-frame Image Storage"
    });
  });
});

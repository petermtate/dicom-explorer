import { beforeEach, describe, expect, it, vi } from "vitest";

const { explicitElementToString, parseDicom } = vi.hoisted(() => ({
  explicitElementToString: vi.fn(),
  parseDicom: vi.fn()
}));
const { convertBytes } = vi.hoisted(() => ({
  convertBytes: vi.fn()
}));

vi.mock("dicom-parser", () => ({
  explicitElementToString,
  parseDicom
}));
vi.mock("dicom-character-set", () => ({
  convertBytes
}));

import { parseDicomFile } from "@/lib/dicom";

describe("parseDicomFile", () => {
  beforeEach(() => {
    explicitElementToString.mockReset();
    parseDicom.mockReset();
    convertBytes.mockReset();
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
    convertBytes.mockReturnValue(undefined);

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
      valueLength: 8,
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
    convertBytes.mockReturnValue(undefined);

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
      valueLength: 25,
      valueInterpretation: "CT Image Storage"
    });
    expect(parsed.rootNodes[0].valueRanges).toEqual([
      { start: 248, end: 251, kind: "tag" },
      { start: 252, end: 253, kind: "vr" },
      { start: 254, end: 255, kind: "length" },
      { start: 256, end: 280, kind: "value" }
    ]);
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
    convertBytes.mockReturnValue(undefined);

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


  it("interprets transfer syntax UIDs", async () => {
    const dataSet = {
      elements: {
        x00020010: {
          tag: "x00020010",
          vr: "UI",
          length: 19,
          dataOffset: 72
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
    explicitElementToString.mockReturnValue("1.2.840.10008.1.2.1");
    convertBytes.mockReturnValue(undefined);

    const file = {
      name: "transfer-syntax.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([16, 17, 18]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00020010",
      tagLabel: "Transfer Syntax UID",
      valueInterpretation: "Explicit VR Little Endian"
    });
  });

  it("marks unknown transfer syntax UIDs", async () => {
    const dataSet = {
      elements: {
        x00020010: {
          tag: "x00020010",
          vr: "UI",
          length: 5,
          dataOffset: 72
        }
      },
      string: vi.fn((tag: string) => {
        if (tag === "x00020010") {
          return "9.9.9";
        }
        return undefined;
      })
    };

    parseDicom.mockReturnValue(dataSet);
    explicitElementToString.mockReturnValue("9.9.9");
    convertBytes.mockReturnValue(undefined);

    const file = {
      name: "unknown-transfer-syntax.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([19, 20, 21]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00020010",
      valueInterpretation: "Unknown Transfer Syntax"
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
    convertBytes.mockReturnValue(undefined);

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
    convertBytes.mockReturnValue(undefined);

    const file = {
      name: "multi-ui.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([13, 14, 15]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      valueLength: 50,
      vm: 2,
      valueInterpretation: "Ultrasound Multi-frame Image Storage"
    });
  });

  it.each([
    { code: "0", interpretation: "None or not applicable" },
    { code: "1", interpretation: "2D (tissue or flow)" },
    { code: "2", interpretation: "M-Mode (tissue or flow)" },
    { code: "3", interpretation: "Spectral (CW or PW Doppler)" },
    { code: "4", interpretation: "Wave form (physiological traces, Doppler traces,…)" },
    { code: "5", interpretation: "Graphics" }
  ])("interprets region spatial format code $code", async ({ code, interpretation }) => {
    const dataSet = {
      elements: {
        x00186012: {
          tag: "x00186012",
          vr: "US",
          length: 2,
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
    explicitElementToString.mockReturnValue(code);
    convertBytes.mockReturnValue(undefined);

    const file = {
      name: `region-spatial-format-${code}.dcm`,
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([31, 32, 33]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00186012",
      valueInterpretation: interpretation
    });
  });

  it("does not interpret unknown region spatial format codes", async () => {
    const dataSet = {
      elements: {
        x00186012: {
          tag: "x00186012",
          vr: "US",
          length: 2,
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
    explicitElementToString.mockReturnValue("42");
    convertBytes.mockReturnValue(undefined);

    const file = {
      name: "region-spatial-format-unknown.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([34, 35, 36]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00186012"
    });
    expect(parsed.rootNodes[0].valueInterpretation).toBeUndefined();
  });

  it("keeps undefined sequence lengths as parsed", async () => {
    const dataSet = {
      elements: {
        x00082112: {
          tag: "x00082112",
          vr: "SQ",
          length: 0xffffffff,
          dataOffset: 200,
          items: []
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
    explicitElementToString.mockReturnValue(undefined);
    convertBytes.mockReturnValue(undefined);

    const file = {
      name: "undefined-sequence-length.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([22, 23, 24]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00082112",
      vr: "SQ",
      valueLength: 0xffffffff
    });
  });

  it("decodes text values using Specific Character Set for supported VRs", async () => {
    const dataSet = {
      elements: {
        x00080005: {
          tag: "x00080005",
          vr: "CS",
          length: 10,
          dataOffset: 8
        },
        x00100010: {
          tag: "x00100010",
          vr: "PN",
          length: 8,
          dataOffset: 16
        }
      },
      string: vi.fn((tag: string) => {
        if (tag === "x00020010") {
          return "1.2.840.10008.1.2.1";
        }
        if (tag === "x00080005") {
          return "ISO_IR 100";
        }
        return undefined;
      })
    };

    parseDicom.mockReturnValue(dataSet);
    explicitElementToString.mockReturnValue("fallback");
    convertBytes.mockImplementation((specificCharacterSet: string | undefined, _valueBytes: Uint8Array, options?: { vr?: string }) => {
      if (options?.vr === "PN") {
        expect(specificCharacterSet).toBe("ISO_IR 100");
        return "Müller^Jörg";
      }
      return undefined;
    });

    const file = {
      name: "international-name.dcm",
      arrayBuffer: vi
        .fn()
        .mockResolvedValue(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 73, 83, 79, 95, 73, 82, 32, 49, 65, 66, 67, 68, 69, 70, 71, 72]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes.find((node) => node.tag === "x00100010")).toMatchObject({
      values: ["Müller^Jörg"]
    });
    expect(explicitElementToString).toHaveBeenCalled();
  });

  it("falls back gracefully when charset decoding fails", async () => {
    const dataSet = {
      elements: {
        x00100020: {
          tag: "x00100020",
          vr: "LO",
          length: 6,
          dataOffset: 12
        }
      },
      string: vi.fn((tag: string) => {
        if (tag === "x00020010") {
          return "1.2.840.10008.1.2.1";
        }
        if (tag === "x00080005") {
          return "ISO 2022 IR 149";
        }
        return undefined;
      })
    };

    parseDicom.mockReturnValue(dataSet);
    explicitElementToString.mockReturnValue("FALLBACK");
    convertBytes.mockImplementation(() => {
      throw new Error("unsupported charset");
    });

    const file = {
      name: "unsupported-charset.dcm",
      arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 65, 66, 67, 68, 69, 70]).buffer)
    } as unknown as File;
    const parsed = await parseDicomFile(file);

    expect(parsed.rootNodes[0]).toMatchObject({
      tag: "x00100020",
      values: ["FALLBACK"]
    });
  });
});

import { convertBytes } from "dicom-character-set";

const TEXT_VRS_WITH_EXTENDED_CHARSET = new Set(["LO", "LT", "PN", "SH", "ST", "UC", "UT"]);

export function decodeDicomTextValue(
  specificCharacterSet: string | undefined,
  valueBytes: Uint8Array,
  vr?: string
): string | undefined {
  if (!vr || !TEXT_VRS_WITH_EXTENDED_CHARSET.has(vr) || valueBytes.length === 0) {
    return undefined;
  }

  try {
    return convertBytes(specificCharacterSet, valueBytes, { vr }).replace(/\0+$/g, "");
  } catch {
    return undefined;
  }
}

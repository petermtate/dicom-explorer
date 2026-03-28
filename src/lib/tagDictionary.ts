const TAG_DICTIONARY: Record<string, string> = {
  x00020000: "File Meta Information Group Length",
  x00020001: "File Meta Information Version",
  x00020002: "Media Storage SOP Class UID",
  x00020003: "Media Storage SOP Instance UID",
  x00020010: "Transfer Syntax UID",
  x00080008: "Image Type",
  x00080016: "SOP Class UID",
  x00080018: "SOP Instance UID",
  x00080020: "Study Date",
  x00080030: "Study Time",
  x00080060: "Modality",
  x00100010: "Patient Name",
  x00100020: "Patient ID",
  x00100030: "Patient Birth Date",
  x00100040: "Patient Sex",
  x0020000d: "Study Instance UID",
  x0020000e: "Series Instance UID",
  x00200013: "Instance Number",
  x00280002: "Samples per Pixel",
  x00280004: "Photometric Interpretation",
  x00280010: "Rows",
  x00280011: "Columns",
  x00280100: "Bits Allocated",
  x00280101: "Bits Stored",
  x00280102: "High Bit",
  x00280103: "Pixel Representation",
  x7fe00010: "Pixel Data"
};

export function getTagLabel(tag: string): string {
  const key = tag.toLowerCase();
  const fromDict = TAG_DICTIONARY[key];
  if (fromDict) {
    return fromDict;
  }

  if (key.length === 9 && key.startsWith("x")) {
    const group = key.slice(1, 5).toUpperCase();
    const element = key.slice(5, 9).toUpperCase();
    return `Unknown (${group},${element})`;
  }

  return `Unknown (${tag})`;
}

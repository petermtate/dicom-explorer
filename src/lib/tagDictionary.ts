import { get_element } from "@iwharris/dicom-data-dictionary";

export type DicomTagInfo = {
  tagLabel: string;
  vr?: string;
  parserVr?: string;
  isPrivate: boolean;
};

const fileMetaTagDictionary: Record<string, { name: string; vr: string }> = {
  "00020000": { name: "File Meta Information Group Length", vr: "UL" },
  "00020001": { name: "File Meta Information Version", vr: "OB" },
  "00020002": { name: "Media Storage SOP Class UID", vr: "UI" },
  "00020003": { name: "Media Storage SOP Instance UID", vr: "UI" },
  "00020010": { name: "Transfer Syntax UID", vr: "UI" },
  "00020012": { name: "Implementation Class UID", vr: "UI" },
  "00020013": { name: "Implementation Version Name", vr: "SH" },
  "00020016": { name: "Source Application Entity Title", vr: "AE" },
  "00020017": { name: "Sending Application Entity Title", vr: "AE" },
  "00020018": { name: "Receiving Application Entity Title", vr: "AE" },
  "00020026": { name: "Source Presentation Address", vr: "UR" },
  "00020027": { name: "Sending Presentation Address", vr: "UR" },
  "00020028": { name: "Receiving Presentation Address", vr: "UR" },
  "00020031": { name: "RTV Meta Information Version", vr: "OB" },
  "00020032": { name: "RTV Communication SOP Class UID", vr: "UI" },
  "00020033": { name: "RTV Communication SOP Instance UID", vr: "UI" },
  "00020035": { name: "RTV Source Identifier", vr: "OB" },
  "00020036": { name: "RTV Flow Identifier", vr: "OB" },
  "00020037": { name: "RTV Flow RTP Sampling Rate", vr: "UL" },
  "00020038": { name: "RTV Flow Actual Frame Duration", vr: "FD" },
  "00020100": { name: "Private Information Creator UID", vr: "UI" },
  "00020102": { name: "Private Information", vr: "OB" }
};

function decodeHtmlEntity(entity: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"'
  };

  if (entity.startsWith("#x") || entity.startsWith("#X")) {
    const codePoint = Number.parseInt(entity.slice(2), 16);
    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  if (entity.startsWith("#")) {
    const codePoint = Number.parseInt(entity.slice(1), 10);
    return Number.isNaN(codePoint) ? `&${entity};` : String.fromCodePoint(codePoint);
  }

  return named[entity] ?? `&${entity};`;
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&([^;]+);/g, (_, entity: string) => decodeHtmlEntity(entity));
}

function formatUnknownTag(tag: string): string {
  const key = tag.toLowerCase();

  if (key.length === 9 && key.startsWith("x")) {
    const group = key.slice(1, 5).toUpperCase();
    const element = key.slice(5, 9).toUpperCase();
    return `Unknown (${group},${element})`;
  }

  return `Unknown (${tag})`;
}

function normalizeDictionaryLookupKey(tag: string): string {
  const key = tag.toLowerCase();
  if (/^x[0-9a-f]{8}$/.test(key)) {
    return key.slice(1).toUpperCase();
  }

  return tag;
}

function isPrivateTag(tag: string): boolean {
  const key = tag.toLowerCase();
  if (!/^x[0-9a-f]{8}$/.test(key)) {
    return false;
  }

  const group = Number.parseInt(key.slice(1, 5), 16);
  return group % 2 === 1;
}

function normalizeParserVr(vr?: string): string | undefined {
  if (!vr) {
    return undefined;
  }

  const match = vr.match(/[A-Z]{2}/);
  return match?.[0];
}

export function getTagInfo(tag: string): DicomTagInfo {
  const dictionaryKey = normalizeDictionaryLookupKey(tag);
  const entry = get_element(dictionaryKey);
  const privateTag = isPrivateTag(tag);
  const fileMetaEntry = fileMetaTagDictionary[dictionaryKey];

  if (!entry && fileMetaEntry) {
    return {
      tagLabel: fileMetaEntry.name,
      vr: fileMetaEntry.vr,
      parserVr: normalizeParserVr(fileMetaEntry.vr),
      isPrivate: privateTag
    };
  }

  if (!entry) {
    return {
      tagLabel: formatUnknownTag(tag),
      isPrivate: privateTag
    };
  }

  return {
    tagLabel: decodeHtmlEntities(entry.name),
    vr: entry.vr,
    parserVr: normalizeParserVr(entry.vr),
    isPrivate: privateTag
  };
}

export function getTagLabel(tag: string): string {
  return getTagInfo(tag).tagLabel;
}

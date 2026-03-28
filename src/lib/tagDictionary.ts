import { get_element } from "@iwharris/dicom-data-dictionary";

export type DicomTagInfo = {
  tagLabel: string;
  vr?: string;
  parserVr?: string;
  isPrivate: boolean;
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
  const entry = get_element(normalizeDictionaryLookupKey(tag));
  const privateTag = isPrivateTag(tag);

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

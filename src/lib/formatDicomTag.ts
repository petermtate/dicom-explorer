export function formatDicomTag(tag: string): string {
  const normalized = tag.replace(/^x/i, "").toUpperCase();

  if (!/^[0-9A-F]{8}$/.test(normalized)) {
    return tag.toUpperCase();
  }

  return `(${normalized.slice(0, 4)},${normalized.slice(4)})`;
}

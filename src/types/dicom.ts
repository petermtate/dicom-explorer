export type ValueRange = {
  start: number;
  end: number;
  kind: "value" | "header";
};

export type DicomAttributeNode = {
  id: string;
  tag: string;
  tagLabel: string;
  vr?: string;
  vm: number;
  values: string[];
  valueRanges: ValueRange[];
  children: DicomAttributeNode[];
};

export type ParsedDicomDocument = {
  fileName: string;
  byteArray: Uint8Array;
  rootNodes: DicomAttributeNode[];
  indexById: Map<string, DicomAttributeNode>;
};

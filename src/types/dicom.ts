export type ValueRange = {
  start: number;
  end: number;
  kind: "tag" | "vr" | "length" | "value";
};

export type DicomAttributeNode = {
  id: string;
  tag: string;
  tagLabel: string;
  vr?: string;
  vrSource: "parsed" | "dictionary" | "unknown";
  valueInterpretation?: string;
  valueLength?: number;
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

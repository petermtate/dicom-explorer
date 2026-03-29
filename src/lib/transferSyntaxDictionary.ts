const TRANSFER_SYNTAX_DICTIONARY: Record<string, string> = {
  "1.2.840.10008.1.2": "Implicit VR Little Endian",
  "1.2.840.10008.1.2.1": "Explicit VR Little Endian",
  "1.2.840.10008.1.2.1.99": "Deflated Explicit VR Little Endian",
  "1.2.840.10008.1.2.2": "Explicit VR Big Endian (Retired)",
  "1.2.840.10008.1.2.4.50": "JPEG Baseline (Process 1)",
  "1.2.840.10008.1.2.4.57": "JPEG Lossless, Nonhierarchical (Process 14)",
  "1.2.840.10008.1.2.4.70": "JPEG Lossless, Nonhierarchical, First-Order Prediction (Process 14 [Selection Value 1])",
  "1.2.840.10008.1.2.4.80": "JPEG-LS Lossless Image Compression",
  "1.2.840.10008.1.2.4.81": "JPEG-LS Lossy (Near-Lossless) Image Compression",
  "1.2.840.10008.1.2.4.90": "JPEG 2000 Image Compression (Lossless Only)",
  "1.2.840.10008.1.2.4.91": "JPEG 2000 Image Compression",
  "1.2.840.10008.1.2.5": "RLE Lossless",
  "1.2.840.10008.1.2.4.100": "MPEG2 Main Profile / Main Level",
  "1.2.840.10008.1.2.4.102": "MPEG-4 AVC/H.264 High Profile / Level 4.1",
  "1.2.840.10008.1.2.4.103": "MPEG-4 AVC/H.264 BD-compatible High Profile / Level 4.1",
  "1.2.840.10008.1.2.4.201": "HTJ2K Lossless",
  "1.2.840.10008.1.2.4.202": "HTJ2K Lossless RPCL",
  "1.2.840.10008.1.2.4.203": "HTJ2K"
};

export function getTransferSyntaxName(uid: string): string | undefined {
  return TRANSFER_SYNTAX_DICTIONARY[uid];
}

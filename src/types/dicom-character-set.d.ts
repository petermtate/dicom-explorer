declare module "dicom-character-set" {
  export function convertBytes(
    specificCharacterSet: string | undefined,
    valueBytes: Uint8Array,
    options?: { vr?: string }
  ): string;
}

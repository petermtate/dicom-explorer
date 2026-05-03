const ENCODING_BY_SPECIFIC_CHARACTER_SET = {
  "ISO_IR 6": "ascii",
  "ISO_IR 100": "latin1",
  "ISO_IR 192": "utf-8"
};

function toTextDecoderLabel(specificCharacterSet) {
  if (!specificCharacterSet) {
    return "ascii";
  }

  const firstValue = specificCharacterSet.split("\\")[0].trim();
  return ENCODING_BY_SPECIFIC_CHARACTER_SET[firstValue] ?? "ascii";
}

function convertBytes(specificCharacterSet, valueBytes) {
  return new TextDecoder(toTextDecoderLabel(specificCharacterSet), { fatal: false }).decode(valueBytes);
}

module.exports = {
  convertBytes
};

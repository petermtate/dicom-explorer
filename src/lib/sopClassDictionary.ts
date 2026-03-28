const SOP_CLASS_DICTIONARY: Record<string, string> = {
  "1.2.840.10008.5.1.4.1.1.1": "Computed Radiography Image Storage",
  "1.2.840.10008.5.1.4.1.1.1.1": "Digital X-Ray Image Storage - For Presentation",
  "1.2.840.10008.5.1.4.1.1.1.1.1": "Digital X-Ray Image Storage - For Processing",
  "1.2.840.10008.5.1.4.1.1.2": "CT Image Storage",
  "1.2.840.10008.5.1.4.1.1.2.1": "Enhanced CT Image Storage",
  "1.2.840.10008.5.1.4.1.1.3": "Ultrasound Multi-frame Image Storage (Retired)",
  "1.2.840.10008.5.1.4.1.1.3.1": "Ultrasound Multi-frame Image Storage",
  "1.2.840.10008.5.1.4.1.1.4": "MR Image Storage",
  "1.2.840.10008.5.1.4.1.1.4.1": "Enhanced MR Image Storage",
  "1.2.840.10008.5.1.4.1.1.6.1": "Ultrasound Image Storage",
  "1.2.840.10008.5.1.4.1.1.7": "Secondary Capture Image Storage",
  "1.2.840.10008.5.1.4.1.1.12.1": "X-Ray Angiographic Image Storage",
  "1.2.840.10008.5.1.4.1.1.12.2": "X-Ray Radiofluoroscopic Image Storage",
  "1.2.840.10008.5.1.4.1.1.20": "Nuclear Medicine Image Storage",
  "1.2.840.10008.5.1.4.1.1.66": "Raw Data Storage",
  "1.2.840.10008.5.1.4.1.1.66.4": "Segmentation Storage",
  "1.2.840.10008.5.1.4.1.1.77.1.4": "Photoacoustic Image Storage",
  "1.2.840.10008.5.1.4.1.1.88.11": "Basic Text SR Storage",
  "1.2.840.10008.5.1.4.1.1.88.22": "Enhanced SR Storage",
  "1.2.840.10008.5.1.4.1.1.88.33": "Comprehensive SR Storage",
  "1.2.840.10008.5.1.4.1.1.128": "Positron Emission Tomography Image Storage",
  "1.2.840.10008.5.1.4.1.1.130": "Enhanced PET Image Storage",
  "1.2.840.10008.5.1.4.1.1.481.1": "RT Image Storage",
  "1.2.840.10008.5.1.4.1.1.481.2": "RT Dose Storage",
  "1.2.840.10008.5.1.4.1.1.481.3": "RT Structure Set Storage",
  "1.2.840.10008.5.1.4.1.1.481.5": "RT Plan Storage",
  "1.2.840.10008.5.1.4.1.1.481.23": "Enhanced RT Image Storage",
  "1.2.840.10008.5.1.4.1.1.481.24": "Enhanced Continuous RT Image Storage"
};

export function getSopClassName(uid: string): string | undefined {
  return SOP_CLASS_DICTIONARY[uid];
}

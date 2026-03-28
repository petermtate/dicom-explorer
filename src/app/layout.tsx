import type { Metadata } from "next";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DICOM Explorer",
  description: "Inspect DICOM attributes and raw bytes"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

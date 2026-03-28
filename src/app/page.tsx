"use client";

import { useMemo, useState } from "react";

import AttributeDetailsPanel from "@/components/AttributeDetailsPanel";
import AttributeTree from "@/components/AttributeTree";
import FileDropZone from "@/components/FileDropZone";
import HexViewer from "@/components/HexViewer";
import { parseDicomFile } from "@/lib/dicom";
import type { ParsedDicomDocument } from "@/types/dicom";

type LoadState = "idle" | "loading" | "loaded" | "error";

export default function HomePage() {
  const [document, setDocument] = useState<ParsedDicomDocument | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    if (!document || !selectedNodeId) {
      return null;
    }

    return document.indexById.get(selectedNodeId) ?? null;
  }, [document, selectedNodeId]);

  const onFileSelected = async (file: File) => {
    setLoadState("loading");
    setErrorMessage(null);

    try {
      const parsed = await parseDicomFile(file);
      setDocument(parsed);
      setSelectedNodeId(parsed.rootNodes[0]?.id ?? null);
      setLoadState("loaded");
    } catch {
      setDocument(null);
      setSelectedNodeId(null);
      setLoadState("error");
      setErrorMessage("Unable to parse this file as DICOM.");
    }
  };

  const highlightedRange = selectedNode?.valueRanges[0] ?? null;

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>DICOM Explorer</h1>
        <FileDropZone onFileSelected={onFileSelected} disabled={loadState === "loading"} />
        {document && <p className="file-name">Loaded file: {document.fileName}</p>}
        {loadState === "loading" && <p>Parsing DICOM file...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </header>

      <section className="workspace">
        <aside className="panel tree-panel">
          <h2>Attributes</h2>
          <AttributeTree
            nodes={document?.rootNodes ?? []}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </aside>

        <div className="right-column">
          <section className="panel details-panel">
            <h2>Attribute Details</h2>
            <AttributeDetailsPanel node={selectedNode} />
          </section>

          <section className="panel hex-panel">
            <h2>Hex Viewer</h2>
            <HexViewer bytes={document?.byteArray ?? null} highlight={highlightedRange} />
          </section>
        </div>
      </section>
    </main>
  );
}

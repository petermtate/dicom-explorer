import React from "react";

import { formatDicomTag } from "@/lib/formatDicomTag";
import type { DicomAttributeNode, ParsedDicomDocument } from "@/types/dicom";

type Props = {
  document: ParsedDicomDocument | null;
  node: DicomAttributeNode | null;
};

type SummaryAttribute = {
  label: string;
  tags: string[];
  includeInterpretation?: boolean;
};

const SUMMARY_ATTRIBUTES: SummaryAttribute[] = [
  { label: "Patient's Name", tags: ["x00100010"] },
  { label: "Modality", tags: ["x00080060"] },
  {
    label: "SOP Class UID",
    tags: ["x00080016", "x00020002"],
    includeInterpretation: true
  },
  {
    label: "Transfer Syntax UID",
    tags: ["x00020010"],
    includeInterpretation: true
  },
  { label: "Specific Character Set", tags: ["x00080005"] }
];

function getSummaryValue(node: DicomAttributeNode, includeInterpretation = false): string | null {
  const values = node.values
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && value !== "<unavailable>");

  if (values.length === 0) {
    return null;
  }

  const value = values.join(", ");
  return includeInterpretation && node.valueInterpretation
    ? `${value} (${node.valueInterpretation})`
    : value;
}

function FileSummary({ document }: { document: ParsedDicomDocument }) {
  const rows = SUMMARY_ATTRIBUTES.flatMap(({ label, tags, includeInterpretation }) => {
    const value = tags
      .map((tag) => Array.from(document.indexById.values()).find((candidate) => candidate.tag.toLowerCase() === tag))
      .map((node) => node ? getSummaryValue(node, includeInterpretation) : null)
      .find((candidate) => candidate !== null);

    return value ? [{ label, value }] : [];
  });

  return (
    <div className="details-grid" role="region" aria-label="File summary">
      {rows.map(({ label, value }) => (
        <div key={label}>
          <h3>{label}</h3>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
}

function getValueLengthDisplay(node: DicomAttributeNode): string {
  if (typeof node.valueLength !== "number" || Number.isNaN(node.valueLength)) {
    return "Unknown";
  }

  if (node.vr === "SQ" && node.valueLength === 0xffffffff) {
    return "Undefined";
  }

  return String(node.valueLength);
}

export default function AttributeDetailsPanel({ document, node }: Props) {
  if (!node) {
    return document
      ? <FileSummary document={document} />
      : <p className="placeholder">Load a DICOM file to inspect details.</p>;
  }

  return (
    <div className="details-grid">
      <div>
        <h3>Tag</h3>
        <p>{formatDicomTag(node.tag)}</p>
      </div>
      <div>
        <h3>Name</h3>
        <p>{node.tagLabel}</p>
      </div>
      <div>
        <h3>VR</h3>
        <p>
          {node.vr ?? "Unknown"}
          {node.vrSource === "dictionary" ? " (inferred from dictionary)" : ""}
        </p>
      </div>
      <div>
        <h3>Values (VM)</h3>
        <p>{node.vm}</p>
      </div>
      <div>
        <h3>Value Length</h3>
        <p>{getValueLengthDisplay(node)}</p>
      </div>
      {node.valueInterpretation && (
        <div>
          <h3>Value Interpretation</h3>
          <p>{node.valueInterpretation}</p>
        </div>
      )}
      <div className="details-values">
        <h3>Value Preview</h3>
        {node.values.length > 0 ? (
          <ul>
            {node.values.map((value, index) => (
              <li key={`${node.id}-value-${index}`}>{value}</li>
            ))}
          </ul>
        ) : (
          <p>No values.</p>
        )}
      </div>
    </div>
  );
}

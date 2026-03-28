import React from "react";

import { formatDicomTag } from "@/lib/formatDicomTag";
import type { DicomAttributeNode } from "@/types/dicom";

type Props = {
  node: DicomAttributeNode | null;
};

export default function AttributeDetailsPanel({ node }: Props) {
  if (!node) {
    return <p className="placeholder">Select an attribute to inspect details.</p>;
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
        <p>{node.vr ?? "Unknown"}</p>
      </div>
      <div>
        <h3>Values (VM)</h3>
        <p>{node.vm}</p>
      </div>
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

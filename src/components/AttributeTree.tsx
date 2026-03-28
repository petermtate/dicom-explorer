"use client";

import { useEffect, useMemo, useState } from "react";

import type { DicomAttributeNode } from "@/types/dicom";

type Props = {
  nodes: DicomAttributeNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
};

type TreeRowProps = {
  node: DicomAttributeNode;
  level: number;
  expanded: Set<string>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onToggle: (nodeId: string) => void;
};

function TreeRow({ node, level, expanded, selectedNodeId, onSelectNode, onToggle }: TreeRowProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <li>
      <div className={`tree-row ${selectedNodeId === node.id ? "is-selected" : ""}`} style={{ paddingLeft: `${level * 12 + 8}px` }}>
        <button
          className="toggle"
          type="button"
          onClick={() => hasChildren && onToggle(node.id)}
          aria-label={hasChildren ? "Toggle child nodes" : "No children"}
        >
          {hasChildren ? (isExpanded ? "-" : "+") : ""}
        </button>
        <button type="button" className="node-label" onClick={() => onSelectNode(node.id)}>
          <span className="tag">{node.tag.toUpperCase()}</span>
          <span>{node.tagLabel}</span>
        </button>
      </div>
      {hasChildren && isExpanded && (
        <ul className="tree-list">
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function gatherExpandableNodeIds(nodes: DicomAttributeNode[], out: Set<string>) {
  for (const node of nodes) {
    if (node.children.length > 0) {
      out.add(node.id);
      gatherExpandableNodeIds(node.children, out);
    }
  }
}

export default function AttributeTree({ nodes, selectedNodeId, onSelectNode }: Props) {
  const defaultExpanded = useMemo(() => {
    const out = new Set<string>();
    gatherExpandableNodeIds(nodes, out);
    return out;
  }, [nodes]);

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const onToggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (nodes.length === 0) {
    return <p className="placeholder">Load a DICOM file to view attributes.</p>;
  }

  return (
    <ul className="tree-list">
      {nodes.map((node) => (
        <TreeRow
          key={node.id}
          node={node}
          level={0}
          expanded={expanded}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}

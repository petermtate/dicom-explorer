"use client";

import { useRef, useState, type DragEvent } from "react";

type Props = {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
};

export default function FileDropZone({ onFileSelected, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const takeFirstFile = (files: FileList | null) => {
    const file = files?.item(0);
    if (file && !disabled) {
      onFileSelected(file);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    takeFirstFile(event.dataTransfer.files);
  };

  return (
    <div
      className={`drop-zone ${dragActive ? "is-drag-active" : ""} ${disabled ? "is-disabled" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) {
          setDragActive(true);
        }
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
      }}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (disabled) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="visually-hidden"
        accept=".dcm,application/dicom"
        disabled={disabled}
        onChange={(event) => takeFirstFile(event.target.files)}
      />
      <p>Drop a DICOM file here or click to choose a file.</p>
    </div>
  );
}

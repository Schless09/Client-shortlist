"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

type PdfDropzoneProps = {
  value: File | null;
  onChange: (file: File | null) => void;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const v = bytes / 1024 ** i;
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function PdfDropzone({ value, onChange }: PdfDropzoneProps) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles?.[0] ?? null;
      onChange(file);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer select-none rounded-2xl border border-dashed p-5 shadow-sm transition",
        "bg-white hover:bg-zinc-50",
        [
          // Dark mode: light “work surface” inside dark cards (soft, not pure white).
          "dark:bg-gradient-to-b dark:from-zinc-50 dark:to-white",
          "dark:hover:from-white dark:hover:to-zinc-50",
          "dark:shadow-none",
        ].join(" "),
        isDragActive &&
          "border-zinc-900/40 ring-2 ring-zinc-950/10 dark:border-zinc-900/35 dark:ring-zinc-950/12",
        isDragReject && "border-red-500/60 ring-2 ring-red-500/10",
        !isDragActive && !isDragReject && "border-zinc-900/15 dark:border-zinc-900/18",
      )}
      aria-label="Upload PDF"
    >
      <input {...getInputProps()} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-900">
            {value ? "PDF selected" : "Drag & drop a PDF here"}
          </div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-600">
            {value ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="truncate">{value.name}</span>
                <span className="text-zinc-400 dark:text-zinc-400">•</span>
                <span>{formatBytes(value.size)}</span>
              </div>
            ) : (
              <span>or click to browse (PDF only)</span>
            )}
          </div>
        </div>

        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(null);
            }}
            className={cn(
              "shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-50",
              "dark:bg-white dark:text-zinc-900 dark:ring-zinc-900/12 dark:hover:bg-zinc-50",
            )}
          >
            Clear
          </button>
        ) : (
          <div className="shrink-0 rounded-xl bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-900 dark:text-white dark:ring-1 dark:ring-inset dark:ring-zinc-900/10">
            Upload
          </div>
        )}
      </div>

      {isDragReject ? (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400">
          Please upload a PDF file.
        </div>
      ) : null}
    </div>
  );
}


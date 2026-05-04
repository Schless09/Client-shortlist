"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type PdfIframePreviewProps = {
  file: File | null;
  emptyClassName?: string;
};

/** PDF preview: blob URL + native `iframe` only (no PDF.js / react-pdf). */
export function PdfIframePreview({ file, emptyClassName }: PdfIframePreviewProps) {
  const pdfUrl = React.useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  React.useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  return (
    <div className="h-[70vh] w-full">
      {pdfUrl ? (
        <iframe title="Uploaded PDF preview" src={pdfUrl} className="h-full w-full" />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center p-8 text-sm text-zinc-600 dark:text-zinc-600",
            emptyClassName,
          )}
        >
          No PDF selected.
        </div>
      )}
    </div>
  );
}

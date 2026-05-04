import CSSMatrix from "dommatrix";

/**
 * pdf2json ships a Node build of PDF.js matrix code that expects `globalThis.DOMMatrix`
 * (available in modern browsers). Some Node / serverless runtimes omit it, which surfaces
 * as "DOMMatrix is not defined" during PDF text extraction — not from the iframe preview.
 */
const g = globalThis as typeof globalThis & { DOMMatrix?: unknown };

if (typeof g.DOMMatrix === "undefined") {
  g.DOMMatrix = CSSMatrix as never;
}

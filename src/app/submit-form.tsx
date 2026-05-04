"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { jsPDF } from "jspdf";

import { PdfDropzone } from "@/components/PdfDropzone";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { generateClientBrief } from "./actions";

type ActionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; brief: string }
  | { status: "error"; message: string };

export default function HomeForm() {
  const [pdf, setPdf] = React.useState<File | null>(null);
  const [notes, setNotes] = React.useState("");
  const [state, setState] = React.useState<ActionState>({ status: "idle" });
  const [copied, setCopied] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const pdfUrl = React.useMemo(() => (pdf ? URL.createObjectURL(pdf) : null), [pdf]);
  React.useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  function downloadBriefPdf(brief: string) {
    // Simple, readable “exec report” layout: headings, body text, bullets.
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginX = 56;
    const marginTop = 64;
    const marginBottom = 64;
    const contentWidth = pageWidth - marginX * 2;

    let y = marginTop;

    const ensureSpace = (needed: number) => {
      if (y + needed > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
      }
    };

    const write = (text: string, fontSize: number, opts?: { bold?: boolean; indent?: number }) => {
      const indent = opts?.indent ?? 0;
      doc.setFont("times", opts?.bold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      const lineHeight = fontSize * 1.35;
      ensureSpace(lines.length * lineHeight);
      doc.text(lines, marginX + indent, y);
      y += lines.length * lineHeight;
    };

    // Title
    write("Client Brief", 18, { bold: true });
    y += 6;
    doc.setDrawColor(60);
    doc.setLineWidth(0.75);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 18;

    // Parse markdown-ish content (## headings, bullets, paragraphs).
    const rawLines = brief.replace(/\r\n/g, "\n").split("\n");
    for (const raw of rawLines) {
      const line = raw.trimEnd();
      if (!line.trim()) {
        y += 10;
        continue;
      }

      if (line.startsWith("## ")) {
        y += 8;
        write(line.replace(/^##\s+/, ""), 12, { bold: true });
        y += 2;
        continue;
      }

      const bulletMatch = line.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        const bulletText = bulletMatch[1] ?? "";
        write(`• ${bulletText}`, 11, { indent: 12 });
        continue;
      }

      write(line, 11);
    }

    doc.save("client-brief.pdf");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "loading" });
    setCopied(false);
    try {
      if (!pdf) {
        setState({ status: "error", message: "Please upload a PDF first." });
        return;
      }

      const fd = new FormData();
      fd.set("pdf", pdf);
      fd.set("notes", notes);

      const res = await generateClientBrief(fd);
      if (!res.ok) {
        setState({ status: "error", message: res.error });
        return;
      }

      setState({ status: "success", brief: res.brief });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong while generating the brief.";
      setState({ status: "error", message });
    } finally {
      // no-op: state is set explicitly above
    }
  }

  return (
    <div className="space-y-8">
      {/* Top split layout: PDF preview + upload/notes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Left: PDF preview */}
        <Card>
          <CardHeader>
            <CardTitle>PDF Preview</CardTitle>
            <CardDescription>
              {pdf
                ? "Preview of the uploaded candidate PDF."
                : "Upload a PDF to see a preview here."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-hidden rounded-xl bg-gradient-to-b from-zinc-50 to-white ring-1 ring-zinc-900/10 dark:from-zinc-50 dark:to-white dark:ring-zinc-900/10">
              {pdfUrl ? (
                <iframe
                  title="Uploaded PDF preview"
                  src={`${pdfUrl}#view=FitH&toolbar=0&navpanes=0`}
                  className="h-[70vh] w-full"
                />
              ) : (
                <div className="flex h-[70vh] w-full items-center justify-center p-8 text-sm text-zinc-600 dark:text-zinc-600">
                  No PDF selected.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload + notes</CardTitle>
            <CardDescription>
              Drag a PDF into the box, add internal recruiter notes, then submit.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form
              onSubmit={(e) => {
                // Clear any previous result/error before starting a new run.
                if (state.status !== "loading") setState({ status: "idle" });
                setCopied(false);
                void onSubmit(e);
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label className="mb-2 block">Candidate PDF</Label>
                <PdfDropzone value={pdf} onChange={setPdf} />
                <input type="hidden" name="pdf" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internal-notes" className="mb-2 block">
                  Internal Recruiter Notes
                </Label>
                <Textarea
                  id="internal-notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key highlights, concerns, compensation notes, availability, motivation…"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="submit"
                  disabled={state.status === "loading" || !pdf}
                  className="w-full sm:w-auto"
                >
                  {state.status === "loading" ? "Generating brief…" : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Full-width status + brief */}
      <section aria-live="polite" className="mt-10 space-y-6">
        {state.status === "loading" ? (
          <Card className="border border-zinc-900/10 dark:border-white/10">
            <CardHeader>
              <CardTitle>Generating…</CardTitle>
              <CardDescription>
                Extracting text from the PDF and drafting a client-ready brief.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-[#080c28]">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-zinc-900/60 dark:bg-zinc-200" />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {state.status === "error" ? (
          <Card className="border border-red-500/15 ring-red-500/10">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-red-700/80 dark:text-red-300/80">
                {state.message}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {state.status === "success" ? (
          <Card className="border border-zinc-900/10 p-0 dark:border-white/10">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Client Brief</CardTitle>
                  <CardDescription className="mt-2 mb-4 block text-zinc-600 dark:text-zinc-600">
                    Generated from the resume + your notes.
                  </CardDescription>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(state.brief);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1500);
                      } catch {
                        setState({
                          status: "error",
                          message:
                            "Couldn’t copy to clipboard. Your browser may be blocking clipboard access.",
                        });
                      }
                    }}
                  >
                    {copied ? "Copied" : "Copy to Clipboard"}
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    disabled={downloading}
                    onClick={async () => {
                      try {
                        setDownloading(true);
                        downloadBriefPdf(state.brief);
                      } catch (e) {
                        const message = e instanceof Error ? e.message : "Couldn’t generate the PDF.";
                        setState({ status: "error", message });
                      } finally {
                        setDownloading(false);
                      }
                    }}
                  >
                    {downloading ? "Preparing PDF…" : "Download as PDF"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-gradient-to-b from-zinc-50 to-white p-8 ring-1 ring-zinc-900/10 dark:from-zinc-50 dark:to-white dark:ring-zinc-900/10 sm:p-10">
                <div className="prose prose-zinc max-w-none text-[15px] leading-7 text-zinc-900 prose-headings:tracking-tight prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1.5 prose-ul:pl-5 prose-ol:pl-5 dark:prose-headings:text-zinc-950 dark:prose-p:text-zinc-800 dark:prose-li:text-zinc-800 dark:prose-strong:text-zinc-950">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children, ...props }) => (
                        <h2
                          {...props}
                          className="mt-10 scroll-mt-20 border-b border-zinc-200 pb-2 text-lg font-semibold tracking-tight text-zinc-900 dark:border-zinc-200 dark:text-zinc-950"
                        >
                          {children}
                        </h2>
                      ),
                    }}
                  >
                    {state.brief}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}


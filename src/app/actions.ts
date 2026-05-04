"use server";

import "@/lib/pdf-server-globals";

import OpenAI from "openai";
import PDFParser from "pdf2json";

const SYSTEM_PROMPT =
  "You are a top-tier recruitment consultant writing sharp, client-ready candidate briefs. Be concise, commercial, and insightful. Avoid generic language.";

const REQUIRED_STRUCTURE = `## Elevator Pitch
(2 sentences max, compelling summary)

## Technical Match
(bullet points showing alignment to role)

## Recruiter’s Edge
(insights from notes, motivations, risks, preferences)

## Key Highlights
(bullets: experience, tools, industries, achievements)`;

type BriefResult =
  | { ok: true; brief: string; extractedChars: number }
  | { ok: false; error: string };

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }
  return new OpenAI({ apiKey });
}

async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  const pdfParser = new PDFParser(null, true);

  const text = await new Promise<string>((resolve, reject) => {
    const onDataError = (err: unknown) => {
      cleanup();
      reject(err instanceof Error ? err : new Error("Failed to parse PDF."));
    };

    const onDataReady = () => {
      try {
        cleanup();
        resolve(String(pdfParser.getRawTextContent() ?? "").trim());
      } catch (e) {
        cleanup();
        reject(e instanceof Error ? e : new Error("Failed to read PDF text."));
      }
    };

    const cleanup = () => {
      pdfParser.removeListener("pdfParser_dataError", onDataError);
      pdfParser.removeListener("pdfParser_dataReady", onDataReady);
      try {
        pdfParser.destroy();
      } catch {
        // ignore
      }
    };

    pdfParser.on("pdfParser_dataError", onDataError);
    pdfParser.on("pdfParser_dataReady", onDataReady);
    pdfParser.parseBuffer(pdfBuffer, 0);
  });

  return text;
}

export async function generateClientBrief(formData: FormData): Promise<BriefResult> {
  try {
    const pdf = formData.get("pdf");
    const notes = String(formData.get("notes") ?? "").trim();

    if (!(pdf instanceof File)) {
      return { ok: false, error: "Please upload a PDF file." };
    }

    if (!pdf.type.includes("pdf") && !pdf.name.toLowerCase().endsWith(".pdf")) {
      return { ok: false, error: "Only PDF files are supported." };
    }

    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());
    const resumeText = await extractPdfText(pdfBuffer);

    if (!resumeText) {
      return { ok: false, error: "Couldn’t extract text from the PDF." };
    }

    const combinedInput = [
      "RESUME (extracted text):",
      resumeText,
      "",
      "INTERNAL RECRUITER NOTES:",
      notes || "(none provided)",
    ].join("\n");

    const openai = getOpenAIClient();
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `Write a structured Client Brief using EXACTLY this structure:\n\n${REQUIRED_STRUCTURE}\n\n` +
            `Rules:\n` +
            `- Keep it concise and specific.\n` +
            `- Use bullet points where requested.\n` +
            `- Do not add extra headings.\n` +
            `- Do not include markdown code fences.\n\n` +
            `Input:\n${combinedInput}`,
        },
      ],
    });

    const brief = completion.choices?.[0]?.message?.content?.trim() ?? "";
    if (!brief) return { ok: false, error: "OpenAI returned an empty response." };

    return { ok: true, brief, extractedChars: resumeText.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error.";
    return { ok: false, error: message };
  }
}


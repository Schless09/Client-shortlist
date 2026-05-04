import Image from "next/image";

import HomeForm from "./submit-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-gradient-to-br dark:from-[#040716] dark:via-[#0b0a2a] dark:to-[#050818] dark:text-zinc-100">
      <header className="flex w-full items-center border-b border-zinc-900/10 bg-[#070c26] px-8 py-4 dark:border-white/10 dark:bg-[#070c26] sm:px-10">
        <Image
          src="/recruitcha-logo.png"
          alt="Recruitcha"
          width={1000}
          height={300}
          priority
          sizes="(max-width: 640px) 180px, 220px"
          className="h-8 w-auto object-contain shrink-0 sm:h-10"
        />
      </header>

      <div className="mx-auto max-w-5xl px-8 py-10 sm:px-10 sm:py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Submit a candidate PDF</h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Upload a PDF and add internal notes for your hiring team.
          </p>
        </div>

        <HomeForm />

        <footer className="mt-10 text-xs text-zinc-500 dark:text-zinc-500">
          PDFs stay in your browser for now (no server upload yet).
        </footer>
      </div>
    </div>
  );
}

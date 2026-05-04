"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm ring-1 ring-inset transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 dark:focus-visible:ring-white/20",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-zinc-900 text-white ring-zinc-900/10 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
        variant === "secondary" &&
          "bg-white text-zinc-900 ring-zinc-900/10 hover:bg-zinc-50 dark:bg-gradient-to-b dark:from-[#070c26] dark:via-[#060a1f] dark:to-[#050818] dark:text-zinc-50 dark:ring-[#6d7cff]/14 dark:hover:from-[#08102c] dark:hover:via-[#070b22] dark:hover:to-[#050818]",
        className,
      )}
      {...props}
    />
  );
}


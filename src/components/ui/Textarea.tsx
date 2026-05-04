import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-xl bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-900/10",
        "placeholder:text-zinc-400",
        "focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-zinc-950/20",
        [
          // Dark mode: light “work surface” inside dark cards (soft, not pure white).
          "dark:bg-gradient-to-b dark:from-zinc-50 dark:to-white",
          "dark:text-zinc-900 dark:ring-zinc-900/10",
          "dark:placeholder:text-zinc-500",
          "dark:shadow-none",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}


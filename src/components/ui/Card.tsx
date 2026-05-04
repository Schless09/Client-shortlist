import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        [
          // Light mode: keep crisp and minimal.
          "rounded-3xl bg-white shadow-sm ring-1 ring-zinc-900/10",
          // Dark mode: deep navy (very dark) with a subtle blue/purple undertone (not neutral grey).
          "dark:bg-gradient-to-b dark:from-[#070c26] dark:via-[#060a1f] dark:to-[#050818]",
          "dark:shadow-none",
          "dark:ring-1 dark:ring-inset dark:ring-[#6d7cff]/14",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-1 text-sm text-zinc-600 dark:text-zinc-300",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}


"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (e.g. insecure context), nothing to do
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={`shrink-0 cursor-pointer rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
        copied
          ? "border-zest bg-zest text-deep"
          : "border-line bg-white/5 text-ink-soft hover:border-glow hover:text-glow"
      } ${className}`}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";

export type ConnectTab = {
  id: string;
  label: string;
  /** Short instruction line shown above the snippet */
  hint: string;
  /** The snippet itself (command or JSON) */
  snippet: string;
  /** What the copy button copies (defaults to snippet) */
  copyText?: string;
  /** Optional action button, e.g. the Cursor install deep link */
  action?: { label: string; href: string };
};

export function ConnectTabs({ tabs }: { tabs: ConnectTab[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div role="tablist" aria-label="MCP clients" className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tab.id}
            onClick={() => setActive(t.id)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors ${
              t.id === tab.id
                ? "bg-butter text-ink"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-4">
        <p className="text-sm text-white/70">{tab.hint}</p>
        <div className="mt-3 flex items-start gap-2">
          <pre className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-white/90">
            {tab.snippet}
          </pre>
          <CopyButton text={tab.copyText ?? tab.snippet} />
        </div>
        {tab.action ? (
          <a
            href={tab.action.href}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-deep"
          >
            {tab.action.label}
            <span aria-hidden>→</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

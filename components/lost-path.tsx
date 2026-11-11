"use client";

import { usePathname } from "next/navigation";

const MAX = 48;

/** The path that was asked for, on the 404 screen. Long ones are cut short (full path in the tooltip). */
export function LostPath() {
  const path = usePathname();
  return <span title={path}>{path.length > MAX ? `${path.slice(0, MAX - 1)}…` : path}</span>;
}

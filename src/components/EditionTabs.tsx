"use client";

import { EDITIONS, type EditionKey } from "@/lib/editions";

/** V2 · V1 switch shown at the top of each section. */
export default function EditionTabs({
  value,
  onChange,
  theme = "light",
}: {
  value: EditionKey;
  onChange: (e: EditionKey) => void;
  theme?: "light" | "dark";
}) {
  const dark = theme === "dark";
  return (
    <div
      role="tablist"
      aria-label="Edición"
      className={`inline-flex rounded-full p-1 ${dark ? "bg-white/10" : "bg-gray-100"}`}
    >
      {EDITIONS.map((e) => {
        const active = e.key === value;
        return (
          <button
            key={e.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(e.key)}
            className={`min-h-9 px-4 rounded-full text-xs font-mono uppercase tracking-wide transition-colors ${
              active
                ? "bg-monad-primary text-white"
                : dark
                  ? "text-white/60 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {e.label}{" "}
            <span className="opacity-70 normal-case">· {e.date.replace(/ de 2026$/, "")}</span>
          </button>
        );
      })}
    </div>
  );
}

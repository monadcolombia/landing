"use client";

import { useState } from "react";
import { localPhotoFor } from "@/lib/team-photos";

// Monad palette pairs. Each person gets a stable one picked from their name.
const GRADIENTS: [string, string][] = [
  ["#6E54FF", "#85E6FF"],
  ["#FF8EE4", "#6E54FF"],
  ["#FFAE45", "#FF8EE4"],
  ["#85E6FF", "#6E54FF"],
  ["#6E54FF", "#FF8EE4"],
  ["#200052", "#6E54FF"],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function gradientFor(name: string): string {
  const [a, b] = GRADIENTS[hash(name.trim().toLowerCase()) % GRADIENTS.length];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

type Props = {
  id: string;
  name: string;
  sizeClass: string;
  ringClass: string;
};

/**
 * Shows the photo from /api/avatar/[id]. While it loads, or when there is none,
 * the person gets a gradient circle with their initials instead of a grey blank.
 */
export default function MemberAvatar({ id, name, sizeClass, ringClass }: Props) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");

  return (
    <div
      className={`relative ${sizeClass} rounded-full mb-3 ring-1 ${ringClass} overflow-hidden shrink-0`}
      style={{ background: gradientFor(name) }}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center font-heading font-bold text-white drop-shadow-sm transition-opacity duration-300 ${
          status === "loaded" ? "opacity-0" : "opacity-100"
        }`}
      >
        {initials(name)}
      </span>
      {status !== "failed" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={localPhotoFor(name) ?? `/api/avatar/${id}`}
          alt={name}
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("failed")}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

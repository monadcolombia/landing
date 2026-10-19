// Monad Blitz Medellín editions. The newest one comes first and is the default tab.

export type EditionKey = "v1" | "v2";

export type EditionInfo = {
  key: EditionKey;
  label: string;
  date: string;
  blitzSlug: string;
};

export const EDITIONS: EditionInfo[] = [
  { key: "v2", label: "V2", date: "17 de octubre de 2026", blitzSlug: "monad-blitz-medellin-v2" },
  { key: "v1", label: "V1", date: "6 de junio de 2026", blitzSlug: "monad-blitz-medellin" },
];

export const DEFAULT_EDITION: EditionKey = "v2";

export function parseEdition(v: unknown, fallback: EditionKey = DEFAULT_EDITION): EditionKey {
  return v === "v1" || v === "v2" ? v : fallback;
}

export function editionInfo(key: EditionKey): EditionInfo {
  return EDITIONS.find((e) => e.key === key) ?? EDITIONS[0];
}

/** Numeric id of an x.com / twitter.com status link, or null. */
export function tweetIdFromUrl(url: string): string | null {
  const m = url.match(/(?:x|twitter)\.com\/[^/]+\/status(?:es)?\/(\d+)/i);
  return m ? m[1] : null;
}

// Projects submitted to Monad Blitz Medellín V2 (Oct 17, 2026), read from the public
// blitz.devnads.com API when the page is built (refreshed hourly with the page).
// Winners follow the jury's final decision, not the Blitz platform. Emails are never shown.

import { BLITZ_BASE_URL, type BlitzProject } from "@/lib/blitz-import";

export type BlitzProjectCard = {
  id: string;
  name: string;
  team: string[];
  category: string | null;
  description: string;
  repos: string[];
  demo: string | null;
  video: string | null;
  tweet: string | null;
  image: string | null;
  place: 1 | 2 | 3 | null;
};

const EVENT_SLUG = "monad-blitz-medellin-v2";

/** Final jury decision, in the order they are announced. */
export const MEDELLIN_V2_WINNERS: { name: string; place: 1 | 2 | 3 }[] = [
  { name: "NatiChain", place: 1 },
  { name: "PACT", place: 1 },
  { name: "República en Llamas", place: 2 },
  { name: "pokemonad", place: 2 },
  { name: "Lloverá", place: 3 },
];

type PublicProject = BlitzProject & {
  team_members?: string | null;
  tweet_url?: string | null;
  category?: string | null;
  image_url?: string | null;
};

const key = (s: string) => s.trim().toLowerCase();

function cleanUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const u = v.trim();
  if (!/^https?:\/\//i.test(u)) return null;
  if (/127\.0\.0\.1|localhost/i.test(u)) return null;
  return u;
}

export function toCard(p: PublicProject): BlitzProjectCard | null {
  const name = p.title?.trim();
  if (!name) return null;
  const winners = new Map(MEDELLIN_V2_WINNERS.map((w) => [key(w.name), w.place]));

  const repos = (p.github_url || "")
    .split(/\s+-\s+/)
    .map(cleanUrl)
    .filter((u): u is string => !!u);
  let demo = cleanUrl(p.demo_url);
  let video: string | null = null;
  if (demo && /github\.com/i.test(demo)) demo = null;
  if (demo && /youtu\.?be/i.test(demo)) {
    video = demo;
    demo = null;
  }
  const tweet = cleanUrl(p.tweet_url)?.split("?")[0] ?? null;
  const team = (p.team_members || "")
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m && !m.includes("@"));

  return {
    id: p.id,
    name,
    team,
    category: p.category?.trim() || null,
    description: (p.description || "").replace(/\s+/g, " ").trim(),
    repos,
    demo,
    video,
    tweet,
    image: cleanUrl(p.image_url),
    place: winners.get(key(name)) ?? null,
  };
}

/** Winners first (in announced order), then everyone else alphabetically. */
export function sortCards(cards: BlitzProjectCard[]): BlitzProjectCard[] {
  const order = MEDELLIN_V2_WINNERS.map((w) => key(w.name));
  const rank = (c: BlitzProjectCard) => {
    const i = order.indexOf(key(c.name));
    return i === -1 ? order.length : i;
  };
  return [...cards].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "es"));
}

export async function getMedellinV2Projects(): Promise<BlitzProjectCard[]> {
  try {
    const res = await fetch(`${BLITZ_BASE_URL}/api/events/${EVENT_SLUG}/projects`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { projects?: PublicProject[] };
    const cards = (data.projects || []).map(toCard).filter((c): c is BlitzProjectCard => !!c);
    return sortCards(cards);
  } catch {
    return [];
  }
}

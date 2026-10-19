// Pulls submitted projects from the official Blitz platform (blitz.devnads.com)
// so admins do not have to type them in by hand. The endpoint is public.

export const BLITZ_EVENT_SLUG = process.env.BLITZ_EVENT_SLUG || "monad-blitz-medellin-v2";
export const BLITZ_BASE_URL = "https://blitz.devnads.com";

export type BlitzProject = {
  id: string;
  title?: string | null;
  description?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  tweet_url?: string | null;
  image_url?: string | null;
  category?: string | null;
  winner_placement?: number | null;
  members?: { name?: string | null; role?: string | null }[] | null;
};

export type ImportedProject = {
  name: string;
  team: string | null;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  contractAddress: string | null;
  tweetUrl: string | null;
  imageUrl: string | null;
  category: string | null;
  place: number | null;
};

const ADDRESS = /0x[a-fA-F0-9]{40}/;

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

function httpUrl(v: unknown): string | null {
  const u = clean(v, 500);
  return u && /^https?:\/\//i.test(u) ? u : null;
}

/** Maps one Blitz submission to our judging project. Uses member names only, never emails. */
export function mapBlitzProject(p: BlitzProject): ImportedProject | null {
  const name = clean(p.title, 200);
  if (!name) return null;
  const members = (p.members || [])
    .map((m) => clean(m?.name, 80))
    .filter((n): n is string => !!n && !n.includes("@"));
  const description = clean(p.description, 2000);
  const contract = description?.match(ADDRESS)?.[0] ?? null;
  return {
    name,
    team: members.length ? members.join(", ").slice(0, 500) : null,
    description,
    repoUrl: clean(p.github_url, 500),
    demoUrl: clean(p.demo_url, 500),
    contractAddress: contract,
    tweetUrl: httpUrl(p.tweet_url)?.split("?")[0] ?? null,
    imageUrl: httpUrl(p.image_url),
    category: clean(p.category, 100),
    place: [1, 2, 3].includes(Number(p.winner_placement)) ? Number(p.winner_placement) : null,
  };
}

export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export async function fetchBlitzProjects(slug = BLITZ_EVENT_SLUG): Promise<BlitzProject[]> {
  const res = await fetch(`${BLITZ_BASE_URL}/api/events/${encodeURIComponent(slug)}/projects`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Blitz respondió ${res.status}`);
  const data = (await res.json()) as { projects?: BlitzProject[] };
  return Array.isArray(data.projects) ? data.projects : [];
}

// Public view of the Blitz projects stored in our judging tables. Winners are
// marked by admins in /admin/jurado. Participant emails are never shown.

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

export type ProjectRow = {
  id: string;
  name: string;
  team: string | null;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  tweetUrl: string | null;
  imageUrl: string | null;
  category: string | null;
  place: number | null;
};

function cleanUrl(v: string | null | undefined): string | null {
  if (!v) return null;
  let u = v.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) {
    if (!/^[\w-]+(\.[\w-]+)+(\/|$)/.test(u)) return null;
    u = `https://${u}`;
  }
  if (/127\.0\.0\.1|localhost/i.test(u)) return null;
  return u;
}

export function toCard(p: ProjectRow): BlitzProjectCard {
  const repos = (p.repoUrl || "")
    .split(/\s+-\s+/)
    .map(cleanUrl)
    .filter((u): u is string => !!u);
  let demo = cleanUrl(p.demoUrl);
  let video: string | null = null;
  if (demo && /github\.com/i.test(demo)) demo = null;
  if (demo && /youtu\.?be/i.test(demo)) {
    video = demo;
    demo = null;
  }
  const team = (p.team || "")
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m && !m.includes("@"));
  const place = p.place === 1 || p.place === 2 || p.place === 3 ? p.place : null;

  return {
    id: p.id,
    name: p.name.trim(),
    team,
    category: p.category?.trim() || null,
    description: (p.description || "").replace(/\s+/g, " ").trim(),
    repos,
    demo,
    video,
    tweet: cleanUrl(p.tweetUrl)?.split("?")[0] ?? null,
    image: cleanUrl(p.imageUrl),
    place,
  };
}

/** Winners first (1st, 2nd, 3rd), then everyone else, alphabetically within each group. */
export function sortCards(cards: BlitzProjectCard[]): BlitzProjectCard[] {
  return [...cards].sort(
    (a, b) => (a.place ?? 9) - (b.place ?? 9) || a.name.localeCompare(b.name, "es")
  );
}

// Photos we took ourselves, for people with no usable photo online.
// Keyed by name without accents, lowercase. Matches when every word here appears in the
// person's registered name, so "Yulissa Restrepo" covers "Yulissa Restrepo Arango".
const PHOTOS: Record<string, string> = {
  "alejandro cifuentes": "/images/team/alejandro-cifuentes.jpg",
  "yulissa restrepo": "/images/team/yulissa-restrepo.jpg",
  "andres felipe torres": "/images/team/andres-felipe-torres.jpg",
};

function normalize(name: string): string[] {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/\s+/).filter(Boolean);
}

export function localPhotoFor(fullName: string): string | null {
  const words = new Set(normalize(fullName));
  for (const [key, src] of Object.entries(PHOTOS)) {
    if (normalize(key).every((w) => words.has(w))) return src;
  }
  return null;
}

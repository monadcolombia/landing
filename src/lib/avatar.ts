import crypto from "crypto";

// Finds a profile photo for a team member from the handles they gave when applying.
// Runs on the server so handles and emails never reach the browser.

export type AvatarImage = { body: ArrayBuffer; contentType: string };

/** image: the photo, or null. transient: a source timed out or errored, so "no photo" is not final. */
export type AvatarResult = { image: AvatarImage | null; transient: boolean };

export type AvatarSources = {
  twitter?: string | null;
  instagram?: string | null;
  telegram?: string | null;
  email?: string | null;
};

const TIMEOUT_MS = 12000;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

export function cleanHandle(raw: string | null | undefined, hosts: string[]): string | null {
  if (!raw) return null;
  let h = raw.trim();
  for (const host of hosts) {
    h = h.replace(new RegExp(`^(https?://)?(www\\.)?${host.replace(".", "\\.")}/`, "i"), "");
  }
  h = h.replace(/^@/, "").split(/[/?#]/)[0].trim();
  // Letters, digits, "_" and "." only, and it must start with a letter, digit or "_".
  return /^[A-Za-z0-9_][A-Za-z0-9._]{1,39}$/.test(h) ? h : null;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response | null> {
  try {
    return await fetch(url, {
      ...init,
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": UA, ...(init.headers || {}) },
    });
  } catch {
    return null;
  }
}

// Set when any lookup fails for a reason other than a clean "not found".
type Flags = { transient: boolean };

async function fetchImage(url: string, flags: Flags): Promise<AvatarImage | null> {
  const res = await fetchWithTimeout(url);
  if (!res) {
    flags.transient = true;
    return null;
  }
  if (res.status >= 500 || res.status === 429) flags.transient = true;
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) return null;
  const body = await res.arrayBuffer();
  // Tiny responses are tracking pixels or blank placeholders, not photos.
  if (body.byteLength < 800) return null;
  return { body, contentType };
}

async function ogImage(pageUrl: string, flags: Flags, reject?: RegExp): Promise<string | null> {
  const res = await fetchWithTimeout(pageUrl, { headers: { Accept: "text/html" } });
  if (!res) {
    flags.transient = true;
    return null;
  }
  if (!res.ok) return null;
  const html = await res.text();
  const match = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
  if (!match) return null;
  const url = match[1].replace(/&amp;/g, "&");
  if (reject && reject.test(url)) return null;
  return url;
}

export async function findAvatar(sources: AvatarSources): Promise<AvatarResult> {
  const flags: Flags = { transient: false };
  const found = (image: AvatarImage): AvatarResult => ({ image, transient: false });
  const x = cleanHandle(sources.twitter, ["x.com", "twitter.com"]);
  if (x) {
    const img = await fetchImage(`https://unavatar.io/x/${x}?fallback=false`, flags);
    if (img) return found(img);
  }

  const ig = cleanHandle(sources.instagram, ["instagram.com"]);
  if (ig) {
    const url = await ogImage(
      `https://www.instagram.com/${ig}/`,
      flags,
      /static\.cdninstagram|\/rsrc\./
    );
    const img = url ? await fetchImage(url, flags) : null;
    if (img) return found(img);
  }

  const tg = cleanHandle(sources.telegram, ["t.me", "telegram.me"]);
  if (tg) {
    // Accounts without a public photo return the generic Telegram logo.
    const url = await ogImage(`https://t.me/${tg}`, flags, /telegram\.org\/img\//);
    const img = url ? await fetchImage(url, flags) : null;
    if (img) return found(img);
  }

  if (sources.email) {
    const hash = crypto
      .createHash("sha256")
      .update(sources.email.trim().toLowerCase())
      .digest("hex");
    const img = await fetchImage(`https://gravatar.com/avatar/${hash}?d=404&s=200`, flags);
    if (img) return found(img);
  }

  return { image: null, transient: flags.transient };
}

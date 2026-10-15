import { prisma } from "@/lib/db";
import { findAvatar, type AvatarImage } from "@/lib/avatar";

export const runtime = "nodejs";

// Photos rarely change, and the upstream sources rate limit, so keep results in memory.
const HIT_TTL_MS = 12 * 60 * 60 * 1000;
const MISS_TTL_MS = 60 * 60 * 1000;
// A lookup that timed out is retried soon instead of hiding the photo for an hour.
const TRANSIENT_TTL_MS = 2 * 60 * 1000;
const cache = new Map<string, { image: AvatarImage | null; expires: number }>();

function notFound() {
  return new Response(null, { status: 404, headers: { "Cache-Control": "public, max-age=3600" } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return notFound();

  const now = Date.now();
  let entry = cache.get(id);
  if (!entry || entry.expires < now) {
    // Only people who show up on the public team list get a photo lookup.
    const app = await prisma.application.findFirst({
      where: { id, status: "approved", confirmed: true },
      select: { twitter: true, instagram: true, telegram: true, email: true },
    });
    if (!app) return notFound();
    const { image, transient } = await findAvatar(app);
    const ttl = image ? HIT_TTL_MS : transient ? TRANSIENT_TTL_MS : MISS_TTL_MS;
    entry = { image, expires: now + ttl };
    cache.set(id, entry);
  }

  if (!entry.image) return notFound();
  return new Response(entry.image.body, {
    headers: {
      "Content-Type": entry.image.contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseEdition } from "@/lib/editions";
import { cleanText, requireAdmin } from "@/lib/judging-admin";

const MAX_BYTES = 1_500_000;
const TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

export async function GET(request: Request) {
  const denied = await requireAdmin(false);
  if (denied) return denied;
  const edition = parseEdition(new URL(request.url).searchParams.get("edition"));
  const rows = await prisma.galleryPhoto.findMany({
    where: { edition },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, alt: true, width: true, height: true, sortOrder: true },
  });
  return NextResponse.json({ data: rows.map((r) => ({ ...r, src: `/api/gallery/${r.id}` })) });
}

// Body: { edition, alt?, dataUrl, width?, height? } — the admin resizes photos in the browser first.
export async function POST(request: Request) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const b = await request.json().catch(() => ({}));
  const m =
    typeof b.dataUrl === "string" ? b.dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/) : null;
  if (!m || !TYPES.has(m[1])) {
    return NextResponse.json({ error: "Sube una imagen JPG, PNG o WebP" }, { status: 400 });
  }
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen pesa demasiado (máx. 1,5 MB)" }, { status: 400 });
  }
  const edition = parseEdition(b.edition);
  const last = await prisma.galleryPhoto.findFirst({
    where: { edition },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const row = await prisma.galleryPhoto.create({
    data: {
      edition,
      alt: cleanText(b.alt, 200),
      mime: m[1],
      data: bytes,
      width: Number.isInteger(b.width) ? b.width : null,
      height: Number.isInteger(b.height) ? b.height : null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
    select: { id: true },
  });
  return NextResponse.json({ data: { id: row.id, src: `/api/gallery/${row.id}` } });
}

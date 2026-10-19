import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseEdition } from "@/lib/editions";

export const dynamic = "force-dynamic";

// Public gallery photos for one edition. Image bytes are served by /api/gallery/[id].
export async function GET(request: Request) {
  const edition = parseEdition(new URL(request.url).searchParams.get("edition"));
  try {
    const rows = await prisma.galleryPhoto.findMany({
      where: { edition },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, alt: true, width: true, height: true },
    });
    const data = rows.map((r) => ({ ...r, src: `/api/gallery/${r.id}` }));
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ data: [] });
  }
}

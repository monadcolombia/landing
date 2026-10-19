import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseEdition, tweetIdFromUrl } from "@/lib/editions";

export const dynamic = "force-dynamic";

// Public posts (tweets and other links) for one edition, managed in /admin/contenido.
export async function GET(request: Request) {
  const edition = parseEdition(new URL(request.url).searchParams.get("edition"));
  try {
    const rows = await prisma.sitePost.findMany({
      where: { edition },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, url: true, label: true },
    });
    const data = rows.map((r) => ({ ...r, tweetId: tweetIdFromUrl(r.url) }));
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ data: [] });
  }
}

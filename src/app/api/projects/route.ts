import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseEdition } from "@/lib/editions";
import { sortCards, toCard } from "@/lib/blitz-v2-projects";

// Public list of one edition's Blitz projects with the winners marked in the admin.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const edition = parseEdition(new URL(request.url).searchParams.get("edition"));
  try {
    const rows = await prisma.judgingProject.findMany({
      where: { edition },
      select: {
        id: true,
        name: true,
        team: true,
        description: true,
        repoUrl: true,
        demoUrl: true,
        tweetUrl: true,
        imageUrl: true,
        category: true,
        place: true,
      },
    });
    return NextResponse.json(
      { data: sortCards(rows.map(toCard)) },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json({ data: [] });
  }
}

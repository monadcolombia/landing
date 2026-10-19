import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JUDGING_EDITION } from "@/lib/judging";
import { sortCards, toCard } from "@/lib/blitz-v2-projects";

// Public list of this edition's Blitz projects with the winners marked in the admin.
// Cached briefly; marking a winner in the admin revalidates this route.
export const revalidate = 300;

export async function GET() {
  try {
    const rows = await prisma.judgingProject.findMany({
      where: { edition: JUDGING_EDITION },
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
    return NextResponse.json({ data: sortCards(rows.map(toCard)) });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

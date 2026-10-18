import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentJudge } from "@/lib/judge-auth";
import { JUDGING_EDITION } from "@/lib/judging";

// Projects to score plus the signed-in judge's own scores (never other judges' scores).
export async function GET() {
  const judge = await getCurrentJudge();
  if (!judge) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.judgingProject.findMany({
    where: { edition: JUDGING_EDITION },
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      team: true,
      description: true,
      repoUrl: true,
      demoUrl: true,
      contractAddress: true,
      deployed: true,
    },
  });
  const scores = await prisma.judgeScore.findMany({
    where: { judgeEmail: judge.email, projectId: { in: projects.map((p) => p.id) } },
  });
  return NextResponse.json({ projects, scores });
}

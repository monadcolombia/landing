import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JUDGING_EDITION, computeResults } from "@/lib/judging";
import { requireAdmin } from "@/lib/judging-admin";

export async function GET() {
  const denied = await requireAdmin(false);
  if (denied) return denied;

  const [projects, judges, scores] = await Promise.all([
    prisma.judgingProject.findMany({ where: { edition: JUDGING_EDITION } }),
    prisma.judgeProfile.findMany({ where: { edition: JUDGING_EDITION } }),
    prisma.judgeScore.findMany({ where: { project: { edition: JUDGING_EDITION } } }),
  ]);

  const activeEmails = new Set(judges.filter((j) => j.active).map((j) => j.email));
  // Only scores from active judges count.
  const rows = scores.filter((s) => activeEmails.has(s.judgeEmail));

  const results = computeResults(projects, rows);
  const nameByEmail = new Map(judges.map((j) => [j.email, j.name]));
  const detail = rows.map((s) => ({
    projectId: s.projectId,
    judge: nameByEmail.get(s.judgeEmail) ?? s.judgeEmail,
    problem: s.problem,
    blockchain: s.blockchain,
    demo: s.demo,
    creativity: s.creativity,
    technical: s.technical,
    pitch: s.pitch,
    comment: s.comment,
  }));

  const info = Object.fromEntries(
    projects.map((p) => [
      p.id,
      {
        description: p.description,
        repoUrl: p.repoUrl,
        demoUrl: p.demoUrl,
        contractAddress: p.contractAddress,
      },
    ])
  );

  return NextResponse.json({
    results,
    detail,
    info,
    activeJudges: activeEmails.size,
  });
}

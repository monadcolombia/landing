import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentJudge } from "@/lib/judge-auth";
import { CRITERIA, JUDGING_EDITION, isValidScore, type CriterionKey } from "@/lib/judging";

export async function PUT(request: Request) {
  const judge = await getCurrentJudge();
  if (!judge) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const project = projectId
    ? await prisma.judgingProject.findFirst({ where: { id: projectId, edition: JUDGING_EDITION } })
    : null;
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const data: Partial<Record<CriterionKey, number | null>> = {};
  for (const c of CRITERIA) {
    const v = body[c.key];
    if (v === null || v === undefined) {
      data[c.key] = null;
    } else if (isValidScore(v)) {
      data[c.key] = v;
    } else {
      return NextResponse.json({ error: `Invalid score for ${c.key}` }, { status: 400 });
    }
  }
  const comment =
    typeof body.comment === "string" && body.comment.trim()
      ? body.comment.trim().slice(0, 2000)
      : null;

  const saved = await prisma.judgeScore.upsert({
    where: { projectId_judgeEmail: { projectId, judgeEmail: judge.email } },
    create: { projectId, judgeEmail: judge.email, ...data, comment },
    update: { ...data, comment },
  });
  return NextResponse.json({ data: saved });
}

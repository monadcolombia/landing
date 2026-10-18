import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JUDGING_EDITION } from "@/lib/judging";
import { cleanText, requireAdmin } from "@/lib/judging-admin";

export async function GET() {
  const denied = await requireAdmin(false);
  if (denied) return denied;
  const data = await prisma.judgingProject.findMany({
    where: { edition: JUDGING_EDITION },
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data });
}

// Body: { projects: [{ name, team?, description?, repoUrl?, demoUrl?, contractAddress?, deployed? }] }
export async function POST(request: Request) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const list = Array.isArray(body.projects) ? body.projects : [body];
  const rows = list
    .map((p: Record<string, unknown>) => ({
      edition: JUDGING_EDITION,
      name: cleanText(p.name, 200) || "",
      team: cleanText(p.team),
      description: cleanText(p.description, 2000),
      repoUrl: cleanText(p.repoUrl),
      demoUrl: cleanText(p.demoUrl),
      contractAddress: cleanText(p.contractAddress, 120),
      deployed: p.deployed === undefined ? true : Boolean(p.deployed),
    }))
    .filter((p: { name: string }) => p.name);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Missing project name" }, { status: 400 });
  }
  const result = await prisma.judgingProject.createMany({ data: rows });
  return NextResponse.json({ created: result.count });
}

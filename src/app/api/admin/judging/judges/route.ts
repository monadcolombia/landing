import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JUDGING_EDITION, type JudgeAreaKey } from "@/lib/judging";
import { cleanText, requireAdmin } from "@/lib/judging-admin";

const AREAS: JudgeAreaKey[] = ["business", "technical", "creative", "general"];

// Suggest an area from the judge application ("nivel técnico").
function areaFromLevel(level: string | null): JudgeAreaKey {
  if (level === "highly_technical") return "technical";
  if (level === "business_focused") return "business";
  return "general";
}

export async function GET() {
  const denied = await requireAdmin(false);
  if (denied) return denied;
  const data = await prisma.judgeProfile.findMany({
    where: { edition: JUDGING_EDITION },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data });
}

// Body: { email, name, area? } to add one judge, or { importApproved: true } to import
// every approved judge application of this edition that is not a judge yet.
export async function POST(request: Request) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const b = await request.json().catch(() => ({}));

  if (b.importApproved) {
    const apps = await prisma.application.findMany({
      where: { role: "judge", status: "approved", edition: JUDGING_EDITION },
    });
    let created = 0;
    for (const a of apps) {
      const email = a.email.trim().toLowerCase();
      const exists = await prisma.judgeProfile.findUnique({
        where: { email_edition: { email, edition: JUDGING_EDITION } },
      });
      if (exists) continue;
      await prisma.judgeProfile.create({
        data: {
          email,
          name: a.fullName,
          area: areaFromLevel(a.judgeTechnicalLevel),
          edition: JUDGING_EDITION,
        },
      });
      created++;
    }
    return NextResponse.json({ created, found: apps.length });
  }

  const email = cleanText(b.email, 200)?.toLowerCase();
  const name = cleanText(b.name, 200);
  const area: JudgeAreaKey = AREAS.includes(b.area) ? b.area : "general";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name) {
    return NextResponse.json({ error: "Valid email and name required" }, { status: 400 });
  }
  const data = await prisma.judgeProfile.upsert({
    where: { email_edition: { email, edition: JUDGING_EDITION } },
    create: { email, name, area, edition: JUDGING_EDITION },
    update: { name, area, active: true },
  });
  return NextResponse.json({ data });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { JudgeAreaKey } from "@/lib/judging";
import { cleanText, requireAdmin } from "@/lib/judging-admin";

const AREAS: JudgeAreaKey[] = ["business", "technical", "creative", "general"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if ("area" in b) {
    if (!AREAS.includes(b.area))
      return NextResponse.json({ error: "Invalid area" }, { status: 400 });
    data.area = b.area;
  }
  if ("active" in b) data.active = Boolean(b.active);
  if ("name" in b) {
    const name = cleanText(b.name, 200);
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    data.name = name;
  }
  try {
    const updated = await prisma.judgeProfile.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

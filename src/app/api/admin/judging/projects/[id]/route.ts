import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MAX_BONUS } from "@/lib/judging";
import { cleanText, requireAdmin } from "@/lib/judging-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const k of [
    "name",
    "team",
    "description",
    "repoUrl",
    "demoUrl",
    "contractAddress",
    "tweetUrl",
    "imageUrl",
    "category",
  ]) {
    if (k in b) data[k] = cleanText(b[k], k === "description" ? 2000 : 500);
  }
  if ("name" in data && !data.name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  if ("deployed" in b) data.deployed = Boolean(b.deployed);
  if ("place" in b) {
    const n = b.place === null || b.place === "" ? null : Number(b.place);
    if (n !== null && ![1, 2, 3].includes(n)) {
      return NextResponse.json({ error: "Place must be 1, 2, 3 or empty" }, { status: 400 });
    }
    data.place = n;
  }
  if ("bonus" in b) {
    const n = Number(b.bonus);
    if (!Number.isFinite(n) || n < 0 || n > MAX_BONUS) {
      return NextResponse.json({ error: `Bonus must be 0 to ${MAX_BONUS}` }, { status: 400 });
    }
    data.bonus = n;
  }
  try {
    const updated = await prisma.judgingProject.update({ where: { id }, data });
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const { id } = await params;
  try {
    await prisma.judgingProject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

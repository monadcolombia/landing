import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cleanText, requireAdmin } from "@/lib/judging-admin";

// Body: { label?, sortOrder? }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const data: { label?: string | null; sortOrder?: number } = {};
  if ("label" in b) data.label = cleanText(b.label, 120);
  if ("sortOrder" in b && Number.isInteger(b.sortOrder)) data.sortOrder = b.sortOrder;
  try {
    return NextResponse.json({ data: await prisma.sitePost.update({ where: { id }, data }) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const { id } = await params;
  try {
    await prisma.sitePost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

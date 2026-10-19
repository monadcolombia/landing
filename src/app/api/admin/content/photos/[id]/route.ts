import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cleanText, requireAdmin } from "@/lib/judging-admin";

// Body: { alt?, sortOrder? }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const data: { alt?: string | null; sortOrder?: number } = {};
  if ("alt" in b) data.alt = cleanText(b.alt, 200);
  if ("sortOrder" in b && Number.isInteger(b.sortOrder)) data.sortOrder = b.sortOrder;
  try {
    await prisma.galleryPhoto.update({ where: { id }, data, select: { id: true } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const { id } = await params;
  try {
    await prisma.galleryPhoto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

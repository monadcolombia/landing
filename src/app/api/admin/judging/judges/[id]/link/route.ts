import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createJudgeLinkToken, publicOrigin } from "@/lib/judge-auth";
import { requireAdmin } from "@/lib/judging-admin";

// Personal access link (valid 48 h) an admin can send to a judge by chat.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const { id } = await params;
  const judge = await prisma.judgeProfile.findUnique({ where: { id } });
  if (!judge) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const origin = publicOrigin(request);
  const url = `${origin}/api/jurado/access?t=${createJudgeLinkToken(judge.email)}`;
  return NextResponse.json({ url });
}

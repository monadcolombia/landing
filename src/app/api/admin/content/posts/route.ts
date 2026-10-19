import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseEdition } from "@/lib/editions";
import { cleanText, requireAdmin } from "@/lib/judging-admin";

export async function GET(request: Request) {
  const denied = await requireAdmin(false);
  if (denied) return denied;
  const edition = parseEdition(new URL(request.url).searchParams.get("edition"));
  const data = await prisma.sitePost.findMany({
    where: { edition },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ data });
}

// Body: { edition, url, label? }
export async function POST(request: Request) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const b = await request.json().catch(() => ({}));
  const url = cleanText(b.url, 500);
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Pega un link que empiece por https://" }, { status: 400 });
  }
  const edition = parseEdition(b.edition);
  const last = await prisma.sitePost.findFirst({
    where: { edition },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const data = await prisma.sitePost.create({
    data: {
      edition,
      url: url.split("?")[0],
      label: cleanText(b.label, 120),
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  return NextResponse.json({ data });
}

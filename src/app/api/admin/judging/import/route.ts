import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JUDGING_EDITION } from "@/lib/judging";
import { requireAdmin } from "@/lib/judging-admin";
import {
  BLITZ_EVENT_SLUG,
  fetchBlitzProjects,
  mapBlitzProject,
  normalizeName,
} from "@/lib/blitz-import";

// Imports submitted projects from blitz.devnads.com. Safe to run many times:
// projects already here (same name or same repo) are not duplicated, and only
// their empty fields get filled in, so manual edits are kept.
export async function POST() {
  const denied = await requireAdmin(true);
  if (denied) return denied;

  let incoming;
  try {
    incoming = (await fetchBlitzProjects()).map(mapBlitzProject).filter((p) => p !== null);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: `No se pudo leer Blitz: ${msg}` }, { status: 502 });
  }

  const existing = await prisma.judgingProject.findMany({ where: { edition: JUDGING_EDITION } });
  const byName = new Map(existing.map((p) => [normalizeName(p.name), p]));
  const byRepo = new Map(
    existing.filter((p) => p.repoUrl).map((p) => [p.repoUrl!.toLowerCase(), p])
  );

  let created = 0;
  let updated = 0;
  for (const p of incoming) {
    const match =
      byName.get(normalizeName(p.name)) || (p.repoUrl && byRepo.get(p.repoUrl.toLowerCase()));
    if (!match) {
      const row = await prisma.judgingProject.create({ data: { edition: JUDGING_EDITION, ...p } });
      byName.set(normalizeName(row.name), row);
      if (row.repoUrl) byRepo.set(row.repoUrl.toLowerCase(), row);
      created++;
      continue;
    }
    const fill: Record<string, string> = {};
    for (const k of [
      "team",
      "description",
      "repoUrl",
      "demoUrl",
      "contractAddress",
      "tweetUrl",
      "imageUrl",
      "category",
    ] as const) {
      if (!match[k] && p[k]) fill[k] = p[k] as string;
    }
    if (Object.keys(fill).length) {
      await prisma.judgingProject.update({ where: { id: match.id }, data: fill });
      updated++;
    }
  }

  return NextResponse.json({
    event: BLITZ_EVENT_SLUG,
    found: incoming.length,
    created,
    updated,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JUDGING_EDITION } from "@/lib/judging";
import { editionInfo, parseEdition } from "@/lib/editions";
import { requireAdmin } from "@/lib/judging-admin";
import { fetchBlitzProjects, mapBlitzProject, normalizeName } from "@/lib/blitz-import";

// Imports submitted projects from blitz.devnads.com. Safe to run many times:
// projects already here (same name or same repo) are not duplicated, and only
// their empty fields get filled in, so manual edits are kept.
// ?edition=v1 imports the June event; default is the current edition.
export async function POST(request: Request) {
  const denied = await requireAdmin(true);
  if (denied) return denied;
  const edition = parseEdition(new URL(request.url).searchParams.get("edition"), JUDGING_EDITION);
  const slug = editionInfo(edition).blitzSlug;

  // Winners come from Blitz only for past editions. The current edition's winners are
  // decided by our jury and marked in the admin.
  const takeWinners = edition !== JUDGING_EDITION;

  let incoming;
  try {
    incoming = (await fetchBlitzProjects(slug))
      .map(mapBlitzProject)
      .filter((p) => p !== null)
      .map(({ place, ...p }) => ({ ...p, place: takeWinners ? place : null }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: `No se pudo leer Blitz: ${msg}` }, { status: 502 });
  }

  const existing = await prisma.judgingProject.findMany({ where: { edition } });
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
      const row = await prisma.judgingProject.create({ data: { edition, ...p } });
      byName.set(normalizeName(row.name), row);
      if (row.repoUrl) byRepo.set(row.repoUrl.toLowerCase(), row);
      created++;
      continue;
    }
    const fill: Record<string, string | number> = {};
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
    if (!match.place && p.place) fill.place = p.place;
    if (Object.keys(fill).length) {
      await prisma.judgingProject.update({ where: { id: match.id }, data: fill });
      updated++;
    }
  }

  return NextResponse.json({
    event: slug,
    found: incoming.length,
    created,
    updated,
  });
}

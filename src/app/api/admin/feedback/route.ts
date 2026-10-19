import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  ASPECTS,
  BOOTCAMP,
  HEARD_FROM,
  KEEP_BUILDING,
  SURVEY_EDITION,
  summarize,
} from "@/lib/survey";

const label = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.surveyResponse.findMany({
    where: { edition: SURVEY_EDITION },
    orderBy: { createdAt: "desc" },
  });

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const header = [
      "fecha",
      "general",
      "asistencia",
      "como_se_entero",
      "construyo_antes_en_monad",
      "bootcamp",
      ...ASPECTS.map((a) => a.key),
      "que_mejorar",
      "a_quien_resaltan",
      "seguira_construyendo",
      "avisar_proximo",
      "contacto",
    ];
    const lines = rows.map((r) =>
      [
        r.createdAt.toISOString(),
        r.overall,
        r.attendance === "v1" ? "Fue al V1" : "Primer Blitz",
        r.heardFrom.map((h) => label(HEARD_FROM, h)).join("; "),
        r.builtBefore ? "Sí" : "No",
        label(BOOTCAMP, r.bootcamp),
        ...ASPECTS.map((a) => r[a.key]),
        r.improve,
        r.highlights.join("; "),
        label(KEEP_BUILDING, r.keepBuilding),
        r.notifyNext ? "Sí" : "No",
        r.contact,
      ]
        .map(csvCell)
        .join(",")
    );
    return new Response([header.join(","), ...lines].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="feedback-blitz-${SURVEY_EDITION}.csv"`,
      },
    });
  }

  return NextResponse.json({
    summary: summarize(rows),
    comments: rows
      .filter((r) => r.improve)
      .map((r) => ({ createdAt: r.createdAt, overall: r.overall, text: r.improve })),
    contacts: rows
      .filter((r) => r.notifyNext && r.contact)
      .map((r) => ({ createdAt: r.createdAt, contact: r.contact, keepBuilding: r.keepBuilding })),
  });
}

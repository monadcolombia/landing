import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SURVEY_EDITION, surveySchema } from "@/lib/survey";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  // Honeypot: real people never fill this hidden field.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ success: true });
  }
  const parsed = surveySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa las respuestas", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const d = parsed.data;
  await prisma.surveyResponse.create({
    data: {
      edition: SURVEY_EDITION,
      overall: d.overall,
      attendance: d.attendance,
      heardFrom: d.heardFrom,
      builtBefore: d.builtBefore,
      bootcamp: d.bootcamp,
      mentors: d.mentors ?? null,
      venue: d.venue ?? null,
      platform: d.platform ?? null,
      organization: d.organization ?? null,
      improve: d.improve || null,
      keepBuilding: d.keepBuilding,
      notifyNext: d.notifyNext,
      contact: d.notifyNext ? d.contact || null : null,
    },
  });
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendApplicationNotification } from "@/lib/email";
import { mentorSchema, judgeSchema, volunteerSchema } from "@/lib/validations/applications";
import type { Role, City, TechnicalLevel, VolunteerAvailability } from "@prisma/client";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, remaining } = rateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" } }
    );
  }

  try {
    const body = await request.json();

    const schema =
      body.role === "mentor"
        ? mentorSchema
        : body.role === "volunteer"
          ? volunteerSchema
          : judgeSchema;
    const validated = schema.parse(body);

    const isVolunteer = validated.role === "volunteer";

    const data = await prisma.application.create({
      data: {
        role: validated.role as Role,
        fullName: validated.full_name,
        email: validated.email,
        phone: isVolunteer ? null : (validated.phone ?? null),
        linkedin: isVolunteer ? null : validated.linkedin || null,
        twitter: isVolunteer ? null : (validated.twitter ?? null),
        instagram: isVolunteer ? null : (validated.instagram ?? null),
        telegram: isVolunteer ? validated.telegram || null : null,
        whatsapp: isVolunteer ? validated.whatsapp || null : null,
        city: validated.city as City,
        ...(validated.role === "mentor" && {
          mentorPrimarySkills: validated.mentor_primary_skills,
          mentorMonadExperience: validated.mentor_monad_experience,
          mentorMonadExperienceDetails: validated.mentor_monad_experience_details ?? null,
          mentorBlockchainExperience: validated.mentor_blockchain_experience,
          mentorNonTechnicalSkills: validated.mentor_non_technical_skills ?? [],
          mentorPreviousExperience: validated.mentor_previous_experience,
          mentorPreviousDetails: validated.mentor_previous_details ?? null,
          mentorBio: validated.mentor_bio,
          mentorWhy: validated.mentor_why,
          mentorTeamCommitment: validated.mentor_team_commitment,
        }),
        ...(validated.role === "judge" && {
          judgeCurrentRole: validated.judge_current_role,
          judgeYearsBlockchain: validated.judge_years_blockchain,
          judgeYearsTotal: validated.judge_years_total,
          judgeBio: validated.judge_bio,
          judgeTechnicalLevel: validated.judge_technical_level as TechnicalLevel,
          judgeExpertiseAreas: validated.judge_expertise_areas,
          judgeSpecificExperience: validated.judge_specific_experience,
          judgePreviousExperience: validated.judge_previous_experience,
          judgePreviousDetails: validated.judge_previous_details ?? null,
          judgeCriteriaRanking: validated.judge_criteria_ranking,
          judgeConflicts: validated.judge_conflicts,
          judgeOtherConflicts: validated.judge_conflict_details ?? null,
          judgeWhy: validated.judge_why,
        }),
        ...(validated.role === "volunteer" && {
          volunteerAvailability: validated.volunteer_availability as VolunteerAvailability,
          volunteerWhy: validated.volunteer_why,
        }),
      },
    });

    // Fire-and-forget email notification
    sendApplicationNotification({
      ...validated,
      fullName: validated.full_name,
    }).catch((err) => console.error("Email notification failed:", err));

    return NextResponse.json(
      { success: true, data, message: "Application submitted successfully" },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("Application submission error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to submit application" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}

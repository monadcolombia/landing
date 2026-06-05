import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      where: {
        status: "approved",
        confirmed: true,
        role: { in: ["mentor", "judge"] },
      },
      select: {
        id: true,
        role: true,
        fullName: true,
        city: true,
        mentorBio: true,
        mentorPrimarySkills: true,
        judgeBio: true,
        judgeExpertiseAreas: true,
        judgeCurrentRole: true,
        linkedin: true,
        twitter: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: applications });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

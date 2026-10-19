import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseEdition } from "@/lib/editions";

export const dynamic = "force-dynamic";

// Approved team for one edition. V2 shows people who confirmed attendance; V1 happened
// before confirmations existed, so every approved person is shown.
export async function GET(request: Request) {
  const edition = parseEdition(new URL(request.url).searchParams.get("edition"));
  try {
    const applications = await prisma.application.findMany({
      where: {
        status: "approved",
        ...(edition === "v2" ? { confirmed: true } : {}),
        edition,
        role: { in: ["mentor", "judge", "volunteer"] },
      },
      select: {
        id: true,
        role: true,
        fullName: true,
        city: true,
        edition: true,
        mentorBio: true,
        mentorPrimarySkills: true,
        judgeBio: true,
        judgeExpertiseAreas: true,
        judgeCurrentRole: true,
        linkedin: true,
        twitter: true,
      },
      orderBy: [{ edition: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ data: applications });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

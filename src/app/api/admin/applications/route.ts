import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { Role, ApplicationStatus, Edition } from "@prisma/client";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as Role | null;
  const status = searchParams.get("status") as ApplicationStatus | null;
  const confirmedRaw = searchParams.get("confirmed");
  const confirmed = confirmedRaw === "true" ? true : confirmedRaw === "false" ? false : undefined;
  const editionParam = searchParams.get("edition");
  const edition: Edition | undefined =
    editionParam === "v1" || editionParam === "v2" ? editionParam : undefined;

  try {
    const data = await prisma.application.findMany({
      where: {
        ...(role && { role }),
        ...(status && { status }),
        ...(confirmed !== undefined && { confirmed }),
        ...(edition && { edition }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

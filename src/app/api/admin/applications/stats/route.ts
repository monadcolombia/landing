import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [byStatus, byRole, confirmedCount, total] = await Promise.all([
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.application.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.application.count({ where: { status: "approved", confirmed: true } }),
      prisma.application.count(),
    ]);

    const status: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
    for (const s of byStatus) status[s.status] = s._count._all;

    const role: Record<string, number> = { mentor: 0, judge: 0, volunteer: 0 };
    for (const r of byRole) role[r.role] = r._count._all;

    return NextResponse.json({
      total,
      status,
      role,
      confirmed: confirmedCount,
      unconfirmed: status.approved - confirmedCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

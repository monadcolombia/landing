import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendApplicantStatusEmail } from "@/lib/email";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, reviewer_notes } = body;

    const validStatuses = ["approved", "rejected"] as const;
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const data = await prisma.application.update({
      where: { id },
      data: {
        status,
        reviewerNotes: reviewer_notes,
        reviewedAt: new Date(),
      },
    });

    if (existing.status !== status) {
      sendApplicantStatusEmail({
        to: data.email,
        fullName: data.fullName,
        role: data.role,
        status,
      }).catch((err) => console.error("Applicant status email failed:", err));
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

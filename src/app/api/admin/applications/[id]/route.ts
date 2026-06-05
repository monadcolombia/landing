import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated, isAdminWriter } from "@/lib/admin-auth";
import { sendApplicantStatusEmail } from "@/lib/email";

const VALID_STATUSES = ["approved", "rejected"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(s: unknown): s is ValidStatus {
  return typeof s === "string" && (VALID_STATUSES as readonly string[]).includes(s);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdminWriter())) {
    return NextResponse.json({ error: "Forbidden: read-only access" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, confirmed, reviewer_notes } = body;

    if (status !== undefined && !isValidStatus(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }
    if (confirmed !== undefined && typeof confirmed !== "boolean") {
      return NextResponse.json({ error: "Invalid confirmed flag" }, { status: 400 });
    }
    if (status === undefined && confirmed === undefined && reviewer_notes === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const existing = await prisma.application.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updates: {
      status?: ValidStatus;
      confirmed?: boolean;
      reviewerNotes?: string;
      reviewedAt?: Date;
    } = {};
    if (status !== undefined) updates.status = status;
    if (confirmed !== undefined) updates.confirmed = confirmed;
    if (reviewer_notes !== undefined) updates.reviewerNotes = reviewer_notes;
    if (status !== undefined) updates.reviewedAt = new Date();

    const data = await prisma.application.update({ where: { id }, data: updates });

    if (status !== undefined && existing.status !== status) {
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

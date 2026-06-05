import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated, isAdminWriter } from "@/lib/admin-auth";
import { sendApplicantStatusEmail } from "@/lib/email";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdminWriter())) {
    return NextResponse.json({ error: "Forbidden: read-only access" }, { status: 403 });
  }

  const { id } = await params;

  const app = await prisma.application.findUnique({
    where: { id },
    select: { email: true, fullName: true, role: true, status: true },
  });

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (app.status !== "approved" && app.status !== "rejected" && app.status !== "withdrawn") {
    return NextResponse.json(
      { error: "Application status must be approved, rejected or withdrawn to send an email" },
      { status: 400 }
    );
  }

  try {
    await sendApplicantStatusEmail({
      to: app.email,
      fullName: app.fullName,
      role: app.role,
      status: app.status,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend email failed:", error);
    const message = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

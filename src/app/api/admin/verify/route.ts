import { NextResponse } from "next/server";
import { getAdminEmail, isAdminWriter } from "@/lib/admin-auth";

export async function GET() {
  const email = await getAdminEmail();
  if (!email) {
    return NextResponse.json({ authenticated: false, canWrite: false });
  }
  const canWrite = await isAdminWriter();
  return NextResponse.json({ authenticated: true, canWrite, email });
}

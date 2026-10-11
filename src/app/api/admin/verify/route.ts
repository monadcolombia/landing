import { NextResponse } from "next/server";
import { getAdminEmail, getWritableRoles } from "@/lib/admin-auth";

export async function GET() {
  const email = await getAdminEmail();
  if (!email) {
    return NextResponse.json({ authenticated: false, canWrite: false, writableRoles: [] });
  }
  const writableRoles = await getWritableRoles();
  return NextResponse.json({
    authenticated: true,
    canWrite: writableRoles.length > 0,
    writableRoles,
    email,
  });
}

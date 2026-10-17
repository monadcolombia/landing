import { NextResponse } from "next/server";
import { canWriteRole, isAdminAuthenticated } from "@/lib/admin-auth";

/** Returns an error response if the caller is not an admin (or not a full admin when write=true). */
export async function requireAdmin(write: boolean): Promise<NextResponse | null> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (write && !(await canWriteRole("judge"))) {
    return NextResponse.json({ error: "Forbidden: read-only access" }, { status: 403 });
  }
  return null;
}

export function cleanText(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

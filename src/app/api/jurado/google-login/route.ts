import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { findActiveJudge, setJudgeCookie } from "@/lib/judge-auth";
import { setAdminCookie } from "@/lib/admin-auth";

const client = new OAuth2Client();

function isAdminEmail(email: string): boolean {
  return (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email.toLowerCase());
}

export async function POST(request: Request) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Google login not configured" }, { status: 500 });
    }
    const { credential } = await request.json();
    if (!credential || typeof credential !== "string") {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 401 });
    }
    const judge = await findActiveJudge(payload.email);
    if (!judge) {
      // Admins who land on /jurado get an admin session and go to the admin panel.
      if (isAdminEmail(payload.email)) {
        await setAdminCookie(payload.email.toLowerCase());
        return NextResponse.json({ success: true, admin: true });
      }
      return NextResponse.json({ error: "Not a judge" }, { status: 403 });
    }
    await setJudgeCookie(judge.email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 401 });
  }
}

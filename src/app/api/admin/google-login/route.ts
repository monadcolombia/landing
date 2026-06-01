import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { setAdminCookie } from "@/lib/admin-auth";

const client = new OAuth2Client();

function getAllowedEmails(): Set<string> {
  const raw = process.env.ADMIN_ALLOWED_EMAILS || "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
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

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 401 });
    }

    const email = payload.email.toLowerCase();
    const allowed = getAllowedEmails();
    if (!allowed.has(email)) {
      return NextResponse.json({ error: "Email not authorized" }, { status: 403 });
    }

    await setAdminCookie();
    return NextResponse.json({ success: true, email });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 401 });
  }
}

import { NextResponse } from "next/server";
import { findActiveJudge, setJudgeCookie, verifyJudgeLinkToken } from "@/lib/judge-auth";

// One-click access link shared by an admin: /api/jurado/access?t=<token>
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") || "";
  const email = token ? verifyJudgeLinkToken(token) : null;
  const judge = email ? await findActiveJudge(email) : null;
  if (!judge) {
    return NextResponse.redirect(new URL("/jurado?error=link", url));
  }
  await setJudgeCookie(judge.email);
  return NextResponse.redirect(new URL("/jurado", url));
}

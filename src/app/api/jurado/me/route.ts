import { NextResponse } from "next/server";
import { getCurrentJudge } from "@/lib/judge-auth";

export async function GET() {
  const judge = await getCurrentJudge();
  if (!judge) return NextResponse.json({ authenticated: false });
  return NextResponse.json({
    authenticated: true,
    judge: { email: judge.email, name: judge.name, area: judge.area },
  });
}

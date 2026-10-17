import { NextResponse } from "next/server";
import { clearJudgeCookie } from "@/lib/judge-auth";

export async function POST() {
  await clearJudgeCookie();
  return NextResponse.json({ success: true });
}

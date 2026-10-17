import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { JUDGING_EDITION } from "@/lib/judging";

/**
 * Judge sessions. Same HMAC scheme as admin-auth, but with a key derived for the
 * "judge" scope, so a judge token can never be replayed as an admin session.
 */

const COOKIE_NAME = "judge_session";
const COOKIE_MAX_AGE = 60 * 60 * 16;
const LINK_MAX_AGE = 60 * 60 * 48;

type Payload = { email: string; exp: number; scope: string };

function getKey(scope: string): string {
  const secret = process.env.SESSION_SECRET || "";
  if (!secret) throw new Error("SESSION_SECRET not configured");
  return crypto.createHmac("sha256", secret).update(`judge-scope:${scope}`).digest("hex");
}

function sign(body: string, scope: string): string {
  return crypto.createHmac("sha256", getKey(scope)).update(body).digest("hex");
}

function createToken(email: string, scope: string, maxAge: number): string {
  const exp = Math.floor(Date.now() / 1000) + maxAge;
  const body = Buffer.from(JSON.stringify({ email, exp, scope } satisfies Payload)).toString(
    "base64url"
  );
  return `${body}.${sign(body, scope)}`;
}

function verifyToken(token: string, scope: string): Payload | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sigBuf = Buffer.from(token.slice(dot + 1));
  const expBuf = Buffer.from(sign(body, scope));
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    if (typeof parsed.email !== "string" || typeof parsed.exp !== "number") return null;
    if (parsed.scope !== scope) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** One-click access link token that an admin can share with a judge. */
export function createJudgeLinkToken(email: string): string {
  return createToken(email.toLowerCase(), "link", LINK_MAX_AGE);
}

export function verifyJudgeLinkToken(token: string): string | null {
  return verifyToken(token, "link")?.email ?? null;
}

export async function setJudgeCookie(email: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(email.toLowerCase(), "session", COOKIE_MAX_AGE), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearJudgeCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Active judge profile for an email, or null. */
export async function findActiveJudge(email: string) {
  return prisma.judgeProfile.findFirst({
    where: { email: email.toLowerCase(), edition: JUDGING_EDITION, active: true },
  });
}

/** The signed-in judge (re-checked against the DB so deactivation takes effect). */
export async function getCurrentJudge() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token, "session");
  if (!payload) return null;
  return findActiveJudge(payload.email);
}

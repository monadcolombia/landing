import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 8;

type Payload = { email: string; exp: number };

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || "";
  if (!secret) throw new Error("SESSION_SECRET not configured");
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function createToken(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
  const body = Buffer.from(JSON.stringify({ email, exp } satisfies Payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function verifyToken(token: string): Payload | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    if (typeof parsed.email !== "string" || typeof parsed.exp !== "number") return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setAdminCookie(email: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token) !== null;
}

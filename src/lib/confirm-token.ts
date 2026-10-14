import crypto from "crypto";

// Signed links that let an approved applicant confirm attendance without logging in.
// Token = base64url(applicationId.exp) + "." + HMAC. Scoped with a "confirm:" prefix so
// it can never be swapped for an admin session cookie signed with the same secret.

const TTL_SECONDS = 60 * 60 * 24 * 60;

function secret(): string {
  const s = process.env.SESSION_SECRET || "";
  if (!s) throw new Error("SESSION_SECRET not configured");
  return s;
}

function sign(body: string): string {
  return crypto.createHmac("sha256", secret()).update(`confirm:${body}`).digest("hex");
}

export function createConfirmToken(applicationId: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + TTL_SECONDS;
  const body = Buffer.from(`${applicationId}.${exp}`).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyConfirmToken(token: string, now = Date.now()): string | null {
  if (typeof token !== "string") return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(body));
  if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected)) return null;

  const decoded = Buffer.from(body, "base64url").toString("utf8");
  const sep = decoded.lastIndexOf(".");
  if (sep <= 0) return null;
  const id = decoded.slice(0, sep);
  const exp = Number(decoded.slice(sep + 1));
  if (!Number.isFinite(exp) || exp < Math.floor(now / 1000)) return null;
  return id;
}

export function confirmUrl(applicationId: string): string {
  const base = process.env.SITE_URL || "https://monadcolombia.xyz";
  return `${base}/confirmar?t=${createConfirmToken(applicationId)}`;
}

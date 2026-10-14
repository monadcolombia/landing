import crypto from "crypto";

// Signed links that let an approved applicant confirm attendance without logging in.
// Token = base64url(applicationId.exp) + "." + HMAC. Scoped with a "confirm:" prefix so
// it can never be swapped for an admin session cookie signed with the same secret.

// Links stop working at the end of the day before the event (Colombia time, UTC-5),
// so nobody confirms on the morning of the Blitz when the team list is already closed.
const EVENT_DATE_ISO = "2026-10-17";

export function confirmDeadline(eventDateIso = EVENT_DATE_ISO): number {
  const eventStartUtc = Date.parse(`${eventDateIso}T00:00:00-05:00`);
  return Math.floor(eventStartUtc / 1000) - 1;
}

function secret(): string {
  const s = process.env.SESSION_SECRET || "";
  if (!s) throw new Error("SESSION_SECRET not configured");
  return s;
}

function sign(body: string): string {
  return crypto.createHmac("sha256", secret()).update(`confirm:${body}`).digest("hex");
}

export function createConfirmToken(applicationId: string, exp = confirmDeadline()): string {
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

/** Confirmation link, or null once the deadline has passed (a dead link helps no one). */
export function confirmUrl(applicationId: string, now = Date.now()): string | null {
  if (Math.floor(now / 1000) > confirmDeadline()) return null;
  const base = process.env.SITE_URL || "https://monadcolombia.xyz";
  return `${base}/confirmar?t=${createConfirmToken(applicationId)}`;
}

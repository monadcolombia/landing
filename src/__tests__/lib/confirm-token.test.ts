import { beforeEach, describe, expect, it } from "vitest";
import { confirmDeadline, createConfirmToken, verifyConfirmToken } from "@/lib/confirm-token";

describe("confirm token", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "test-secret";
  });

  it("round-trips the application id", () => {
    const token = createConfirmToken("abc-123", Math.floor(Date.now() / 1000) + 3600);
    expect(verifyConfirmToken(token)).toBe("abc-123");
  });

  it("rejects a tampered token", () => {
    const token = createConfirmToken("abc-123", Math.floor(Date.now() / 1000) + 3600);
    const [body, sig] = token.split(".");
    const forged = Buffer.from("other-id.9999999999").toString("base64url");
    expect(verifyConfirmToken(`${forged}.${sig}`)).toBeNull();
    expect(verifyConfirmToken(`${body}.${"0".repeat(sig.length)}`)).toBeNull();
  });

  it("expires at the end of the day before the event, Colombia time", () => {
    const deadline = confirmDeadline("2026-10-17");
    expect(new Date(deadline * 1000).toISOString()).toBe("2026-10-17T04:59:59.000Z");

    const token = createConfirmToken("abc-123", deadline);
    const lastSecond = Date.parse("2026-10-16T23:59:59-05:00");
    const eventStart = Date.parse("2026-10-17T00:00:00-05:00");
    expect(verifyConfirmToken(token, lastSecond)).toBe("abc-123");
    expect(verifyConfirmToken(token, eventStart)).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = createConfirmToken("abc-123", Math.floor(Date.now() / 1000) + 3600);
    process.env.SESSION_SECRET = "different";
    expect(verifyConfirmToken(token)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(verifyConfirmToken("")).toBeNull();
    expect(verifyConfirmToken("nope")).toBeNull();
  });
});

describe("confirmUrl", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "test-secret";
  });

  it("returns a link before the deadline and null after it", async () => {
    const { confirmUrl } = await import("@/lib/confirm-token");
    expect(confirmUrl("abc-123", Date.parse("2026-10-16T12:00:00-05:00"))).toMatch(
      /^https:\/\/monadcolombia\.xyz\/confirmar\?t=/
    );
    expect(confirmUrl("abc-123", Date.parse("2026-10-17T08:00:00-05:00"))).toBeNull();
  });
});

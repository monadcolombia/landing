import { beforeEach, describe, expect, it } from "vitest";
import { createConfirmToken, verifyConfirmToken } from "@/lib/confirm-token";

describe("confirm token", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "test-secret";
  });

  it("round-trips the application id", () => {
    const token = createConfirmToken("abc-123");
    expect(verifyConfirmToken(token)).toBe("abc-123");
  });

  it("rejects a tampered token", () => {
    const token = createConfirmToken("abc-123");
    const [body, sig] = token.split(".");
    const forged = Buffer.from("other-id.9999999999").toString("base64url");
    expect(verifyConfirmToken(`${forged}.${sig}`)).toBeNull();
    expect(verifyConfirmToken(`${body}.${"0".repeat(sig.length)}`)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = createConfirmToken("abc-123", Date.now() - 61 * 24 * 3600 * 1000);
    expect(verifyConfirmToken(token)).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = createConfirmToken("abc-123");
    process.env.SESSION_SECRET = "different";
    expect(verifyConfirmToken(token)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(verifyConfirmToken("")).toBeNull();
    expect(verifyConfirmToken("nope")).toBeNull();
  });
});

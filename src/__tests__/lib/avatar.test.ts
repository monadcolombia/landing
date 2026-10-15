import { describe, expect, it } from "vitest";
import { cleanHandle } from "@/lib/avatar";
import { gradientFor, initials } from "@/components/MemberAvatar";

describe("cleanHandle", () => {
  it("accepts handles, @handles and profile URLs", () => {
    expect(cleanHandle("@gilbertsahumada", ["x.com", "twitter.com"])).toBe("gilbertsahumada");
    expect(cleanHandle("0xVato", ["x.com"])).toBe("0xVato");
    expect(cleanHandle("https://x.com/0xVato/", ["x.com", "twitter.com"])).toBe("0xVato");
    expect(cleanHandle("https://www.instagram.com/javiercruzgong/?hl=es", ["instagram.com"])).toBe(
      "javiercruzgong"
    );
    expect(cleanHandle("t.me/stewar", ["t.me"])).toBe("stewar");
    expect(cleanHandle("https://t.me/stewar", ["t.me"])).toBe("stewar");
  });

  it("rejects empty or unsafe values", () => {
    expect(cleanHandle("", ["x.com"])).toBeNull();
    expect(cleanHandle(null, ["x.com"])).toBeNull();
    expect(cleanHandle("bad handle!", ["x.com"])).toBeNull();
    expect(cleanHandle("../../etc", ["x.com"])).toBeNull();
  });
});

describe("fallback avatar", () => {
  it("uses two initials and a stable gradient per name", () => {
    expect(initials("Maria Clara Avilez Gomez")).toBe("MC");
    expect(initials("Stewar")).toBe("S");
    expect(gradientFor("Stewar")).toBe(gradientFor(" stewar "));
    expect(gradientFor("Stewar")).toMatch(/^linear-gradient/);
  });
});

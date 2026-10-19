import { describe, it, expect } from "vitest";
import { toCard, sortCards, type BlitzProjectCard } from "@/lib/blitz-v2-projects";

const card = (title: string, extra: Record<string, unknown> = {}) =>
  toCard({ id: title, title, ...extra }) as BlitzProjectCard;

describe("toCard", () => {
  it("applies the jury's winners, including ties", () => {
    expect(card("NatiChain").place).toBe(1);
    expect(card("PACT").place).toBe(1);
    expect(card("República en Llamas").place).toBe(2);
    expect(card("pokemonad").place).toBe(2);
    expect(card("Lloverá").place).toBe(3);
    expect(card("Natimon").place).toBeNull();
  });

  it("cleans links and never shows emails", () => {
    const c = card("X", {
      team_members: "Ana, ana@example.com, Luis",
      github_url: "https://github.com/a/one.git - https://github.com/a/two.git",
      demo_url: "http://127.0.0.1:5500",
      tweet_url: "https://x.com/a/status/123?s=20",
    });
    expect(c.team).toEqual(["Ana", "Luis"]);
    expect(c.repos).toEqual(["https://github.com/a/one.git", "https://github.com/a/two.git"]);
    expect(c.demo).toBeNull();
    expect(c.tweet).toBe("https://x.com/a/status/123");
  });

  it("treats YouTube demos as video and GitHub demos as no demo", () => {
    expect(card("A", { demo_url: "https://youtu.be/abc" }).video).toBe("https://youtu.be/abc");
    expect(card("B", { demo_url: "https://github.com/x/y" }).demo).toBeNull();
  });
});

describe("sortCards", () => {
  it("puts winners first in announced order, then the rest alphabetically", () => {
    const names = sortCards(
      ["Zeta", "Lloverá", "pokemonad", "Alfa", "PACT", "República en Llamas", "NatiChain"].map(
        (n) => card(n)
      )
    ).map((c) => c.name);
    expect(names).toEqual([
      "NatiChain",
      "PACT",
      "República en Llamas",
      "pokemonad",
      "Lloverá",
      "Alfa",
      "Zeta",
    ]);
  });
});

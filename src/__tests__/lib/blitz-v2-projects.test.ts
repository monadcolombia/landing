import { describe, it, expect } from "vitest";
import { toCard, sortCards, type ProjectRow } from "@/lib/blitz-v2-projects";

const row = (name: string, extra: Partial<ProjectRow> = {}): ProjectRow => ({
  id: name,
  name,
  team: null,
  description: null,
  repoUrl: null,
  demoUrl: null,
  tweetUrl: null,
  imageUrl: null,
  category: null,
  place: null,
  ...extra,
});

describe("toCard", () => {
  it("keeps only valid winner places", () => {
    expect(toCard(row("A", { place: 1 })).place).toBe(1);
    expect(toCard(row("B", { place: 3 })).place).toBe(3);
    expect(toCard(row("C", { place: 7 })).place).toBeNull();
    expect(toCard(row("D")).place).toBeNull();
  });

  it("cleans links and never shows emails", () => {
    const c = toCard(
      row("X", {
        team: "Ana, ana@example.com, Luis",
        repoUrl: "https://github.com/a/one.git - github.com/a/two",
        demoUrl: "http://127.0.0.1:5500",
        tweetUrl: "https://x.com/a/status/123?s=20",
      })
    );
    expect(c.team).toEqual(["Ana", "Luis"]);
    expect(c.repos).toEqual(["https://github.com/a/one.git", "https://github.com/a/two"]);
    expect(c.demo).toBeNull();
    expect(c.tweet).toBe("https://x.com/a/status/123");
  });

  it("treats YouTube demos as video and GitHub demos as no demo", () => {
    expect(toCard(row("A", { demoUrl: "https://youtu.be/abc" })).video).toBe(
      "https://youtu.be/abc"
    );
    expect(toCard(row("B", { demoUrl: "https://github.com/x/y" })).demo).toBeNull();
  });
});

describe("sortCards", () => {
  it("puts 1st, 2nd and 3rd place first (ties allowed), then the rest", () => {
    const names = sortCards(
      [
        row("Zeta"),
        row("Lloverá", { place: 3 }),
        row("pokemonad", { place: 2 }),
        row("Alfa"),
        row("PACT", { place: 1 }),
        row("República en Llamas", { place: 2 }),
        row("NatiChain", { place: 1 }),
      ].map(toCard)
    ).map((c) => c.name);
    expect(names).toEqual([
      "NatiChain",
      "PACT",
      "pokemonad",
      "República en Llamas",
      "Lloverá",
      "Alfa",
      "Zeta",
    ]);
  });
});

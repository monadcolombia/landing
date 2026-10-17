import { describe, it, expect } from "vitest";
import { computeResults, type ScoreRow } from "@/lib/judging";

// Example data from the original rubric spreadsheet (Juez Negocios / Técnico / Creativo).
const s = (
  projectId: string,
  judgeEmail: string,
  area: ScoreRow["area"],
  v: [number, number, number, number, number, number]
): ScoreRow => ({
  projectId,
  judgeEmail,
  area,
  problem: v[0],
  blockchain: v[1],
  demo: v[2],
  creativity: v[3],
  technical: v[4],
  pitch: v[5],
});

const projects = [
  { id: "eco", name: "EcoToken", deployed: true, bonus: 2 },
  { id: "voto", name: "VotoU", deployed: true, bonus: 0 },
  { id: "arte", name: "ArteNFT", deployed: false, bonus: 0 },
];
const scores = [
  s("eco", "n", "business", [4, 4, 3, 4, 3, 4]),
  s("eco", "t", "technical", [4, 5, 4, 3, 4, 3]),
  s("eco", "c", "creative", [5, 4, 4, 5, 3, 5]),
  s("voto", "n", "business", [3, 2, 3, 3, 2, 3]),
  s("voto", "t", "technical", [3, 4, 2, 3, 3, 2]),
  s("voto", "c", "creative", [4, 3, 3, 4.5, 2, 4]),
  s("arte", "n", "business", [3, 1, 1, 4, 1, 3]),
];

describe("computeResults", () => {
  const r = computeResults(projects, scores);
  const by = (id: string) => r.find((x) => x.id === id)!;

  it("matches the spreadsheet weighted averages and totals", () => {
    expect(by("eco").averages).toEqual({
      problem: 4.25,
      blockchain: 4.5,
      demo: 3.75,
      creativity: 4.25,
      technical: 3.5,
      pitch: 4.2,
    });
    expect(by("eco").base).toBe(83);
    expect(by("eco").final).toBe(85);
    expect(by("voto").base).toBe(62.45);
  });

  it("ranks and flags discrepancies like the spreadsheet", () => {
    expect(by("eco").place).toBe(1);
    expect(by("voto").place).toBe(2);
    expect(by("eco").discrepancies).toEqual(["creativity", "pitch"]);
    expect(by("voto").discrepancies).toEqual(["blockchain", "pitch"]);
  });

  it("marks projects without a deployed contract as not eligible", () => {
    expect(by("arte").status).toBe("not_eligible");
    expect(by("arte").final).toBeNull();
    expect(by("arte").place).toBeNull();
  });

  it("breaks ties by the blockchain average", () => {
    const tie = computeResults(
      [
        { id: "a", name: "A", deployed: true, bonus: 0 },
        { id: "b", name: "B", deployed: true, bonus: 0 },
      ],
      [s("a", "x", "general", [5, 3, 3, 3, 3, 3]), s("b", "x", "general", [3, 5, 3, 3, 3, 3])]
    );
    expect(tie.find((x) => x.id === "b")!.place).toBe(1);
    expect(tie.find((x) => x.id === "a")!.place).toBe(2);
  });
});

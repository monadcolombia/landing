import { describe, it, expect } from "vitest";
import { computeResults, type ScoreRow } from "@/lib/judging";

// Example data from the original rubric spreadsheet, with every judge at the same weight.
const s = (
  projectId: string,
  judgeEmail: string,
  v: [number, number, number, number, number, number]
): ScoreRow => ({
  projectId,
  judgeEmail,
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
  s("eco", "n", [4, 4, 3, 4, 3, 4]),
  s("eco", "t", [4, 5, 4, 3, 4, 3]),
  s("eco", "c", [5, 4, 4, 5, 3, 5]),
  s("voto", "n", [3, 2, 3, 3, 2, 3]),
  s("voto", "t", [3, 4, 2, 3, 3, 2]),
  s("voto", "c", [4, 3, 3, 4.5, 2, 4]),
  s("arte", "n", [3, 1, 1, 4, 1, 3]),
];

describe("computeResults", () => {
  const r = computeResults(projects, scores);
  const by = (id: string) => r.find((x) => x.id === id)!;

  it("averages every judge with the same weight", () => {
    expect(by("eco").averages).toEqual({
      problem: 4.33,
      blockchain: 4.33,
      demo: 3.67,
      creativity: 4,
      technical: 3.33,
      pitch: 4,
    });
    expect(by("eco").base).toBe(80.91);
    expect(by("eco").final).toBe(82.91);
    expect(by("voto").base).toBe(60.96);
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
      [s("a", "x", [5, 3, 3, 3, 3, 3]), s("b", "x", [3, 5, 3, 3, 3, 3])]
    );
    expect(tie.find((x) => x.id === "b")!.place).toBe(1);
    expect(tie.find((x) => x.id === "a")!.place).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import { summarize, surveySchema, type SurveyRow } from "@/lib/survey";

const row = (o: Partial<SurveyRow>): SurveyRow => ({
  overall: 5,
  attendance: "first",
  heardFrom: [],
  builtBefore: false,
  bootcamp: "no",
  keepBuilding: "yes",
  notifyNext: false,
  mentors: null,
  venue: null,
  platform: null,
  organization: null,
  ...o,
});

describe("surveySchema", () => {
  it("accepts a minimal valid answer", () => {
    const r = surveySchema.safeParse({
      overall: 4,
      attendance: "v1",
      builtBefore: true,
      bootcamp: "yes_helped",
      keepBuilding: "maybe",
    });
    expect(r.success).toBe(true);
  });
  it("rejects out of range ratings and unknown options", () => {
    expect(
      surveySchema.safeParse({
        overall: 6,
        attendance: "v1",
        builtBefore: true,
        bootcamp: "no",
        keepBuilding: "yes",
      }).success
    ).toBe(false);
    expect(
      surveySchema.safeParse({
        overall: 3,
        attendance: "v3",
        builtBefore: true,
        bootcamp: "no",
        keepBuilding: "yes",
      }).success
    ).toBe(false);
  });
});

describe("summarize", () => {
  it("counts and averages, skipping blank aspect ratings", () => {
    const s = summarize([
      row({
        overall: 5,
        attendance: "v1",
        heardFrom: ["x", "friend"],
        builtBefore: true,
        mentors: 4,
      }),
      row({ overall: 4, heardFrom: ["x"], notifyNext: true, mentors: null }),
    ]);
    expect(s.total).toBe(2);
    expect(s.overallAvg).toBe(4.5);
    expect(s.overallDist).toEqual([0, 0, 0, 1, 1]);
    expect(s.attendance).toEqual({ first: 1, v1: 1 });
    expect(s.heardFrom.x).toBe(2);
    expect(s.heardFrom.friend).toBe(1);
    expect(s.builtBefore).toEqual({ yes: 1, no: 1 });
    expect(s.aspects.mentors).toBe(4);
    expect(s.aspects.venue).toBeNull();
    expect(s.notifyNext).toBe(1);
  });
});

describe("summarize highlights", () => {
  it("counts each highlighted person across answers", () => {
    const s = summarize([
      row({ highlights: ["Mentor · Ana", "Jurado · Luis"] }),
      row({ highlights: ["Mentor · Ana"] }),
      row({}),
    ]);
    expect(s.highlights).toEqual([
      { name: "Mentor · Ana", n: 2 },
      { name: "Jurado · Luis", n: 1 },
    ]);
  });
});

/**
 * Blitz judging rubric. Mirrors the "Rúbrica de evaluación" spreadsheet:
 * - 6 criteria scored 1 to 5 (half points allowed)
 * - every judge scores every criterion with the same weight
 * - per-criterion average = plain average over judges who scored it
 * - base (/100) = sum(avg / 5 * weight), only when all 6 criteria have at least one score
 * - final = base + bonus (0 to 5), max 105
 * - ties: higher "Uso de Monad / blockchain" average wins, otherwise shared place
 * - discrepancy: max - min between judges > 1.5 on a criterion
 */

export const JUDGING_EDITION = "v2" as const;

export type JudgeAreaKey = "business" | "technical" | "creative" | "general";

export type CriterionKey = "problem" | "blockchain" | "demo" | "creativity" | "technical" | "pitch";

export type Criterion = {
  key: CriterionKey;
  label: string;
  short: string;
  weight: number;
  question: string;
};

export const CRITERIA: Criterion[] = [
  {
    key: "problem",
    label: "Problema y valor",
    short: "Problema",
    weight: 0.25,
    question: "¿Resuelve un problema real y claro? ¿Saben para quién es?",
  },
  {
    key: "blockchain",
    label: "Uso de Monad / blockchain",
    short: "Blockchain",
    weight: 0.25,
    question:
      "¿El smart contract es central? ¿Aporta transparencia, propiedad, pagos o confianza que no se lograría con una base de datos?",
  },
  {
    key: "demo",
    label: "Funciona la demo",
    short: "Demo",
    weight: 0.2,
    question: "¿Se puede probar en vivo y el contrato responde?",
  },
  {
    key: "creativity",
    label: "Creatividad y experiencia de usuario",
    short: "Creatividad/UX",
    weight: 0.17,
    question: "¿Es original? ¿Se entiende cómo usarlo?",
  },
  {
    key: "technical",
    label: "Calidad técnica",
    short: "Calidad técnica",
    weight: 0.08,
    question:
      "Contrato claro, validaciones básicas (require), sin errores de seguridad obvios, código en repositorio.",
  },
  {
    key: "pitch",
    label: "Pitch",
    short: "Pitch",
    weight: 0.05,
    question: "¿Se entiende qué hicieron? (No se exige pitch profesional.)",
  },
];

export const SCALE_HELP = [
  "1 = No existe o no funciona",
  "2 = Existe, pero muy incompleto o confuso",
  "3 = Funciona con fallas o se entiende a medias",
  "4 = Funciona bien y se entiende; le falta poco",
  "5 = Claro, funciona y sorprende",
];

export const SCORE_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export const DISCREPANCY_THRESHOLD = 1.5;
export const MAX_BONUS = 5;

export function isValidScore(v: unknown): v is number {
  return typeof v === "number" && SCORE_OPTIONS.includes(v);
}

export type ScoreRow = {
  projectId: string;
  judgeEmail: string;
} & Partial<Record<CriterionKey, number | null>>;

export type ProjectInput = {
  id: string;
  name: string;
  team?: string | null;
  deployed: boolean;
  bonus: number;
};

export type ProjectResult = {
  id: string;
  name: string;
  team: string | null;
  deployed: boolean;
  averages: Record<CriterionKey, number | null>;
  ranges: Record<CriterionKey, number | null>;
  discrepancies: CriterionKey[];
  base: number | null;
  bonus: number;
  final: number | null;
  place: number | null;
  status: "ok" | "incomplete" | "not_eligible";
  judgesComplete: number;
  judgesStarted: number;
};

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;

export function computeResults(projects: ProjectInput[], scores: ScoreRow[]): ProjectResult[] {
  const results: ProjectResult[] = projects.map((p) => {
    const rows = scores.filter((s) => s.projectId === p.id);
    const averages = {} as Record<CriterionKey, number | null>;
    const ranges = {} as Record<CriterionKey, number | null>;
    const discrepancies: CriterionKey[] = [];

    for (const c of CRITERIA) {
      const vals = rows.map((r) => r[c.key]).filter((v): v is number => typeof v === "number");
      if (!p.deployed || vals.length === 0) {
        averages[c.key] = null;
      } else {
        averages[c.key] = round(vals.reduce((s, v) => s + v, 0) / vals.length, 2);
      }
      if (vals.length >= 2) {
        const range = Math.max(...vals) - Math.min(...vals);
        ranges[c.key] = range;
        if (p.deployed && range > DISCREPANCY_THRESHOLD) discrepancies.push(c.key);
      } else {
        ranges[c.key] = null;
      }
    }

    const judgesStarted = rows.filter((r) =>
      CRITERIA.some((c) => typeof r[c.key] === "number")
    ).length;
    const judgesComplete = rows.filter((r) =>
      CRITERIA.every((c) => typeof r[c.key] === "number")
    ).length;
    const bonus = Math.min(MAX_BONUS, Math.max(0, Number(p.bonus) || 0));

    let base: number | null = null;
    let status: ProjectResult["status"] = "not_eligible";
    if (p.deployed) {
      const allHave = CRITERIA.every((c) => averages[c.key] !== null);
      status = allHave ? "ok" : "incomplete";
      if (allHave) {
        base = round(
          CRITERIA.reduce((s, c) => s + ((averages[c.key] as number) / 5) * c.weight, 0) * 100,
          2
        );
      }
    }
    const final = base === null ? null : round(Math.min(105, base + bonus), 2);

    return {
      id: p.id,
      name: p.name,
      team: p.team ?? null,
      deployed: p.deployed,
      averages,
      ranges,
      discrepancies,
      base,
      bonus: base === null ? 0 : bonus,
      final,
      place: null,
      status,
      judgesComplete,
      judgesStarted,
    };
  });

  const ranked = results.filter((r) => r.final !== null);
  for (const r of ranked) {
    const f = r.final as number;
    const b = r.averages.blockchain ?? 0;
    r.place =
      1 +
      ranked.filter((o) => (o.final as number) > f).length +
      ranked.filter((o) => o.final === f && (o.averages.blockchain ?? 0) > b).length;
  }

  return results.sort((a, b) => {
    if (a.place !== null && b.place !== null) return a.place - b.place;
    if (a.place !== null) return -1;
    if (b.place !== null) return 1;
    return a.name.localeCompare(b.name);
  });
}

import { z } from "zod";

// Post-Blitz feedback survey: 8 short questions, about 2 minutes.

export const SURVEY_EDITION = "v2" as const;

export const ATTENDANCE = [
  { value: "first", label: "Es mi primer Blitz" },
  { value: "v1", label: "También fui al Blitz V1" },
] as const;

export const HEARD_FROM = [
  { value: "poli_apex", label: "Poli / ÁPEX" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X (Twitter)" },
  { value: "telegram_whatsapp", label: "Telegram / WhatsApp" },
  { value: "friend", label: "Un amigo" },
  { value: "luma", label: "Luma" },
  { value: "other", label: "Otro" },
] as const;

export const BOOTCAMP = [
  { value: "no", label: "No fui" },
  { value: "yes_helped", label: "Sí, y me ayudó mucho" },
  { value: "yes_somewhat", label: "Sí, me ayudó algo" },
  { value: "yes_not_helped", label: "Sí, pero no me ayudó" },
] as const;

export const KEEP_BUILDING = [
  { value: "yes", label: "Sí" },
  { value: "maybe", label: "Tal vez" },
  { value: "no", label: "No" },
] as const;

/** Roles people can be highlighted in, shown as groups in the survey. */
export const HIGHLIGHT_ROLES = [
  { key: "organizer", label: "Organizadores" },
  { key: "mentor", label: "Mentores" },
  { key: "judge", label: "Jurados" },
  { key: "volunteer", label: "Voluntarios" },
] as const;

export const ASPECTS = [
  { key: "mentors", label: "Mentores" },
  { key: "venue", label: "Lugar y comida" },
  { key: "platform", label: "Plataforma (Blitz)" },
  { key: "organization", label: "Organización y horarios" },
] as const;

export type AspectKey = (typeof ASPECTS)[number]["key"];

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];

const rating = z.number().int().min(1).max(5);

export const surveySchema = z.object({
  overall: rating,
  attendance: z.enum(values(ATTENDANCE)),
  heardFrom: z
    .array(z.enum(values(HEARD_FROM)))
    .max(HEARD_FROM.length)
    .default([]),
  builtBefore: z.boolean(),
  bootcamp: z.enum(values(BOOTCAMP)),
  mentors: rating.nullable().optional(),
  venue: rating.nullable().optional(),
  platform: rating.nullable().optional(),
  organization: rating.nullable().optional(),
  improve: z.string().trim().max(2000).optional().nullable(),
  keepBuilding: z.enum(values(KEEP_BUILDING)),
  notifyNext: z.boolean().default(false),
  contact: z.string().trim().max(200).optional().nullable(),
  // "Rol · Nombre" entries picked from the team list
  highlights: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
});

export type SurveyInput = z.infer<typeof surveySchema>;

export type SurveyRow = {
  overall: number;
  attendance: string;
  heardFrom: string[];
  builtBefore: boolean;
  bootcamp: string;
  keepBuilding: string;
  notifyNext: boolean;
  highlights?: string[];
} & Record<AspectKey, number | null>;

const round = (n: number) => Math.round(n * 100) / 100;

function avg(nums: (number | null | undefined)[]): number | null {
  const v = nums.filter((n): n is number => typeof n === "number");
  return v.length ? round(v.reduce((s, n) => s + n, 0) / v.length) : null;
}

function count<T extends string>(rows: string[], options: readonly { value: T }[]) {
  return Object.fromEntries(
    options.map((o) => [o.value, rows.filter((r) => r === o.value).length])
  ) as Record<T, number>;
}

/** Totals and averages for the admin dashboard. */
export function summarize(rows: SurveyRow[]) {
  return {
    total: rows.length,
    overallAvg: avg(rows.map((r) => r.overall)),
    overallDist: [1, 2, 3, 4, 5].map((n) => rows.filter((r) => r.overall === n).length),
    attendance: count(
      rows.map((r) => r.attendance),
      ATTENDANCE
    ),
    heardFrom: Object.fromEntries(
      HEARD_FROM.map((o) => [o.value, rows.filter((r) => r.heardFrom.includes(o.value)).length])
    ) as Record<(typeof HEARD_FROM)[number]["value"], number>,
    builtBefore: {
      yes: rows.filter((r) => r.builtBefore).length,
      no: rows.filter((r) => !r.builtBefore).length,
    },
    bootcamp: count(
      rows.map((r) => r.bootcamp),
      BOOTCAMP
    ),
    aspects: Object.fromEntries(
      ASPECTS.map((a) => [a.key, avg(rows.map((r) => r[a.key]))])
    ) as Record<AspectKey, number | null>,
    keepBuilding: count(
      rows.map((r) => r.keepBuilding),
      KEEP_BUILDING
    ),
    notifyNext: rows.filter((r) => r.notifyNext).length,
    highlights: Object.entries(
      rows
        .flatMap((r) => r.highlights ?? [])
        .reduce<Record<string, number>>((acc, h) => ({ ...acc, [h]: (acc[h] ?? 0) + 1 }), {})
    )
      .map(([name, n]) => ({ name, n }))
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)),
  };
}

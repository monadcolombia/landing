import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { TECHNICAL_SKILLS, NON_TECHNICAL_SKILLS } from "@/lib/validations/applications";
import type { Role, ApplicationStatus, Application } from "@prisma/client";

const EXPERTISE_AREAS = [
  "DeFi",
  "NFTs",
  "Infraestructura",
  "Gaming",
  "Social",
  "Herramientas de Desarrollo",
  "Otro",
] as const;

const SPECIFIC_EXPERIENCES = ["Monad", "Cadenas EVM", "Otros L1s", "L2s", "Cross-chain"] as const;

type ColumnKey = keyof Application;
type MultiSelectKey =
  | "mentorPrimarySkills"
  | "mentorNonTechnicalSkills"
  | "judgeExpertiseAreas"
  | "judgeSpecificExperience";

interface ColumnSpec {
  key: ColumnKey | { type: "multi"; field: MultiSelectKey; option: string };
  label: string;
  width?: number;
}

const COLUMNS: ColumnSpec[] = [
  { key: "id", label: "ID", width: 38 },
  { key: "createdAt", label: "Creada", width: 22 },
  { key: "role", label: "Rol", width: 12 },
  { key: "status", label: "Estado", width: 12 },
  { key: "fullName", label: "Nombre", width: 24 },
  { key: "email", label: "Email", width: 28 },
  { key: "phone", label: "Telefono", width: 16 },
  { key: "telegram", label: "Telegram", width: 16 },
  { key: "whatsapp", label: "WhatsApp", width: 16 },
  { key: "linkedin", label: "LinkedIn", width: 30 },
  { key: "twitter", label: "Twitter", width: 16 },
  { key: "instagram", label: "Instagram", width: 16 },
  { key: "city", label: "Ciudad", width: 12 },
  { key: "availability", label: "Disponibilidad libre", width: 24 },
  ...TECHNICAL_SKILLS.map(
    (skill) =>
      ({
        key: { type: "multi" as const, field: "mentorPrimarySkills" as const, option: skill },
        label: `Mentor skill: ${skill}`,
        width: 14,
      }) satisfies ColumnSpec
  ),
  { key: "mentorMonadExperience", label: "Mentor: experiencia Monad/EVM", width: 16 },
  { key: "mentorMonadExperienceDetails", label: "Mentor: detalles Monad/EVM", width: 40 },
  { key: "mentorBlockchainExperience", label: "Mentor: experiencia blockchain", width: 40 },
  ...NON_TECHNICAL_SKILLS.map(
    (skill) =>
      ({
        key: { type: "multi" as const, field: "mentorNonTechnicalSkills" as const, option: skill },
        label: `Mentor soft: ${skill}`,
        width: 14,
      }) satisfies ColumnSpec
  ),
  { key: "mentorPreviousExperience", label: "Mentor: mentoria previa", width: 16 },
  { key: "mentorPreviousDetails", label: "Mentor: detalles mentoria previa", width: 40 },
  { key: "mentorBio", label: "Mentor: bio", width: 50 },
  { key: "mentorWhy", label: "Mentor: motivacion", width: 50 },
  { key: "mentorTeamCommitment", label: "Mentor: equipos", width: 14 },
  { key: "judgeCurrentRole", label: "Jurado: rol actual", width: 30 },
  { key: "judgeYearsBlockchain", label: "Jurado: anios blockchain", width: 12 },
  { key: "judgeYearsTotal", label: "Jurado: anios total", width: 12 },
  { key: "judgeBio", label: "Jurado: bio", width: 50 },
  { key: "judgeTechnicalLevel", label: "Jurado: nivel tecnico", width: 18 },
  ...EXPERTISE_AREAS.map(
    (area) =>
      ({
        key: { type: "multi" as const, field: "judgeExpertiseAreas" as const, option: area },
        label: `Jurado expertise: ${area}`,
        width: 14,
      }) satisfies ColumnSpec
  ),
  ...SPECIFIC_EXPERIENCES.map(
    (exp) =>
      ({
        key: { type: "multi" as const, field: "judgeSpecificExperience" as const, option: exp },
        label: `Jurado experiencia: ${exp}`,
        width: 14,
      }) satisfies ColumnSpec
  ),
  { key: "judgePreviousExperience", label: "Jurado: jurado previo", width: 16 },
  { key: "judgePreviousDetails", label: "Jurado: detalles jurado previo", width: 40 },
  { key: "judgeCriteriaRanking", label: "Jurado: ranking criterios", width: 30 },
  { key: "judgeConflicts", label: "Jurado: conflictos", width: 18 },
  { key: "judgeOtherConflicts", label: "Jurado: detalle conflictos", width: 40 },
  { key: "judgeWhy", label: "Jurado: motivacion", width: 50 },
  { key: "volunteerAvailability", label: "Voluntario: disponibilidad", width: 22 },
  { key: "volunteerWhy", label: "Voluntario: motivacion", width: 50 },
];

function toCell(value: unknown): string | number | Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Si" : "No";
  if (typeof value === "number") return value;
  return String(value);
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as Role | null;
  const status = searchParams.get("status") as ApplicationStatus | null;

  const apps = await prisma.application.findMany({
    where: {
      ...(role && { role }),
      ...(status && { status }),
    },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MonadBlitz Colombia";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Aplicaciones");

  const colKey = (c: ColumnSpec, i: number) =>
    typeof c.key === "string" ? c.key : `${c.key.field}__${i}`;

  sheet.columns = COLUMNS.map((c, i) => ({
    header: c.label,
    key: colKey(c, i),
    width: c.width ?? 20,
  }));

  for (const app of apps) {
    const record = app as unknown as Record<string, unknown>;
    const row: Record<string, ReturnType<typeof toCell> | string> = {};
    COLUMNS.forEach((c, i) => {
      const key = colKey(c, i);
      if (typeof c.key === "string") {
        row[key] = toCell(record[c.key]);
      } else {
        const arr = record[c.key.field];
        row[key] = Array.isArray(arr) && arr.includes(c.key.option) ? "X" : "";
      }
    });
    sheet.addRow(row);
  }

  // Style header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6E54FF" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();

  const today = new Date().toISOString().slice(0, 10);
  const filenameParts = ["applications", role ?? "all", status ?? "all", today];
  const filename = `${filenameParts.join("-")}.xlsx`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

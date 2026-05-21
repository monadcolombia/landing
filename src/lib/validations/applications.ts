import { z } from "zod";

// Format validators for social/contact fields
const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Debe tener 10 dígitos (ej. 3001234567)")
  .or(z.literal(""))
  .optional();

const linkedinSchema = z
  .string()
  .regex(
    /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
    "Debe ser una URL válida de LinkedIn (ej. https://linkedin.com/in/tuperfil)"
  )
  .or(z.literal(""))
  .optional();

const twitterSchema = z
  .string()
  .regex(/^@?[\w]{1,15}$/, "Handle inválido (ej. @tuhandle)")
  .or(z.literal(""))
  .optional();

const instagramSchema = z
  .string()
  .regex(/^@?[\w.]{1,30}$/, "Handle inválido (ej. @tuhandle)")
  .or(z.literal(""))
  .optional();

// Max lengths for free-text fields
const MAX_MEDIUM = 500;
const MAX_LONG = 1000;

// Mentor skill options (Monad hackathon focused)
export const TECHNICAL_SKILLS = [
  "Solidity",
  "EVM",
  "Frontend (React/Next.js)",
  "Backend (Node/Python/Go)",
  "Smart Contracts",
  "DeFi",
  "NFTs/Gaming",
  "Infraestructura/DevOps",
  "Seguridad/Auditorías",
] as const;

export const NON_TECHNICAL_SKILLS = [
  "UX/UI Design",
  "Pitching/Presentaciones",
  "Modelo de Negocio",
  "Marketing/Growth",
  "Comunidad/Partnerships",
  "Legal/Regulatorio",
] as const;

// Shared fields for both mentor and judge applications
const baseSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre debe tener máximo 100 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    phone: phoneSchema,
    linkedin: linkedinSchema,
    twitter: twitterSchema,
    instagram: instagramSchema,
    city: z.enum(["medellin", "bogota", "both"]),
  })
  .refine(
    (data) => {
      const filled = [data.phone, data.linkedin, data.twitter, data.instagram].filter(
        (v) => v && v.trim() !== ""
      );
      return filled.length >= 2;
    },
    {
      message: "Por favor completa al menos 2 de: Teléfono, LinkedIn, Twitter, Instagram",
      path: ["instagram"],
    }
  );

// Mentor application schema
export const mentorSchema = baseSchema.and(
  z
    .object({
      role: z.literal("mentor"),
      mentor_primary_skills: z
        .array(z.string())
        .min(1, "Por favor selecciona al menos una habilidad técnica"),
      mentor_monad_experience: z.boolean(),
      mentor_monad_experience_details: z
        .string()
        .max(MAX_MEDIUM, `Máximo ${MAX_MEDIUM} caracteres`)
        .optional(),
      mentor_blockchain_experience: z
        .string()
        .min(10, "Por favor describe tu experiencia en blockchain (al menos 10 caracteres)")
        .max(MAX_MEDIUM, `Máximo ${MAX_MEDIUM} caracteres`),
      mentor_non_technical_skills: z.array(z.string()).optional(),
      mentor_previous_experience: z.boolean(),
      mentor_previous_details: z
        .string()
        .max(MAX_MEDIUM, `Máximo ${MAX_MEDIUM} caracteres`)
        .optional(),
      mentor_bio: z
        .string()
        .min(50, "La bio debe tener al menos 50 caracteres")
        .max(500, "La bio debe tener máximo 500 caracteres"),
      mentor_why: z
        .string()
        .min(20, "Por favor cuéntanos por que quieres ser mentor (al menos 20 caracteres)")
        .max(MAX_LONG, `Máximo ${MAX_LONG} caracteres`),
      mentor_team_commitment: z.enum(["1-2", "3-5", "5+", "flexible"]),
    })
    .refine(
      (data) => {
        if (
          data.mentor_monad_experience &&
          (!data.mentor_monad_experience_details ||
            data.mentor_monad_experience_details.trim() === "")
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Por favor describe tu experiencia con Monad/EVM",
        path: ["mentor_monad_experience_details"],
      }
    )
    .refine(
      (data) => {
        if (
          data.mentor_previous_experience &&
          (!data.mentor_previous_details || data.mentor_previous_details.trim() === "")
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Por favor describe tu experiencia previa como mentor",
        path: ["mentor_previous_details"],
      }
    )
);

// Judging criteria keys
const CRITERIA_KEYS = ["innovation", "technical", "team", "market", "ux"] as const;

// Judge application schema
export const judgeSchema = baseSchema.and(
  z
    .object({
      role: z.literal("judge"),
      judge_current_role: z
        .string()
        .min(5, "Por favor indica tu rol actual (al menos 5 caracteres)")
        .max(200, "Máximo 200 caracteres"),
      judge_years_blockchain: z
        .number()
        .min(0, "Los años deben ser al menos 0")
        .max(50, "Los años deben ser menos de 50"),
      judge_years_total: z
        .number()
        .min(0, "Los años deben ser al menos 0")
        .max(70, "Los años deben ser menos de 70"),
      judge_bio: z
        .string()
        .min(100, "La bio debe tener al menos 100 caracteres")
        .max(800, "La bio debe tener máximo 800 caracteres"),
      judge_technical_level: z.enum(["highly_technical", "moderate", "business_focused"]),
      judge_expertise_areas: z
        .array(z.string())
        .min(1, "Por favor selecciona al menos un area de expertise"),
      judge_specific_experience: z
        .array(z.string())
        .min(1, "Por favor selecciona al menos una experiencia específica"),
      judge_previous_experience: z.boolean(),
      judge_previous_details: z
        .string()
        .max(MAX_MEDIUM, `Máximo ${MAX_MEDIUM} caracteres`)
        .optional(),
      judge_criteria_ranking: z.record(z.string(), z.number()),
      judge_conflicts: z.enum(["ninguno", "si"], {
        message: "Por favor selecciona una opción",
      }),
      judge_conflict_details: z.string().max(MAX_LONG, `Máximo ${MAX_LONG} caracteres`).optional(),
      judge_why: z
        .string()
        .min(20, "Por favor cuéntanos por que quieres ser jurado (al menos 20 caracteres)")
        .max(MAX_LONG, `Máximo ${MAX_LONG} caracteres`),
    })
    .refine(
      (data) => {
        const ranking = data.judge_criteria_ranking;
        return CRITERIA_KEYS.every(
          (key) => typeof ranking[key] === "number" && ranking[key] >= 1 && ranking[key] <= 5
        );
      },
      {
        message: "Por favor asigna un ranking (1-5) a cada criterio de evaluación",
        path: ["judge_criteria_ranking"],
      }
    )
    .refine(
      (data) => {
        if (
          data.judge_conflicts === "si" &&
          (!data.judge_conflict_details || data.judge_conflict_details.trim() === "")
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Por favor describe tus conflictos de interés",
        path: ["judge_conflict_details"],
      }
    )
    .refine(
      (data) => {
        if (
          data.judge_previous_experience &&
          (!data.judge_previous_details || data.judge_previous_details.trim() === "")
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Por favor describe tu experiencia previa como jurado",
        path: ["judge_previous_details"],
      }
    )
);

// Contact handle validators for volunteer
const telegramSchema = z
  .string()
  .regex(/^@?[\w]{4,32}$/, "Handle de Telegram invalido (ej. @tuhandle)")
  .or(z.literal(""))
  .optional();

const whatsappSchema = z
  .string()
  .regex(/^\d{10}$/, "Debe tener 10 digitos (ej. 3001234567)")
  .or(z.literal(""))
  .optional();

// Volunteer application schema
export const volunteerSchema = z
  .object({
    role: z.literal("volunteer"),
    full_name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre debe tener maximo 100 caracteres"),
    email: z.string().email("Correo electronico invalido"),
    telegram: telegramSchema,
    whatsapp: whatsappSchema,
    city: z.enum(["medellin", "bogota", "both"]),
    volunteer_availability: z.enum(["event_day", "pre_event", "both"]),
    volunteer_why: z
      .string()
      .min(20, "Cuentanos por que quieres ser voluntario (al menos 20 caracteres)")
      .max(MAX_MEDIUM, `Maximo ${MAX_MEDIUM} caracteres`),
  })
  .refine(
    (data) => {
      const tg = (data.telegram ?? "").trim();
      const wp = (data.whatsapp ?? "").trim();
      return tg !== "" || wp !== "";
    },
    {
      message: "Comparte tu Telegram o WhatsApp (preferiblemente Telegram)",
      path: ["telegram"],
    }
  );

// Inferred types
export type MentorApplication = z.infer<typeof mentorSchema>;
export type JudgeApplication = z.infer<typeof judgeSchema>;
export type VolunteerApplication = z.infer<typeof volunteerSchema>;
export type Application = MentorApplication | JudgeApplication | VolunteerApplication;

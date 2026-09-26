"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  mentorSchema,
  judgeSchema,
  volunteerSchema,
  TECHNICAL_SKILLS,
  NON_TECHNICAL_SKILLS,
} from "@/lib/validations/applications";
import { FormField } from "@/components/forms/FormField";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormCheckbox } from "@/components/forms/FormCheckbox";

type ApplyRole = "mentor" | "judge" | "volunteer";

type ApplyFormValues = {
  role: ApplyRole | "";
  full_name: string;
  email: string;
  phone: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  city: "medellin";
  mentor_primary_skills: string[];
  mentor_monad_experience: boolean;
  mentor_monad_experience_details: string;
  mentor_blockchain_experience: string;
  mentor_non_technical_skills: string[];
  mentor_previous_experience: boolean;
  mentor_previous_details: string;
  mentor_bio: string;
  mentor_why: string;
  mentor_team_commitment: string;
  judge_current_role: string;
  judge_years_blockchain: number;
  judge_years_total: number;
  judge_bio: string;
  judge_technical_level: string;
  judge_expertise_areas: string[];
  judge_specific_experience: string[];
  judge_previous_experience: boolean;
  judge_previous_details: string;
  judge_criteria_ranking: Record<string, number>;
  judge_conflicts: string;
  judge_conflict_details: string;
  judge_why: string;
  volunteer_availability: string;
  volunteer_why: string;
};

const ROLES: { value: ApplyRole; label: string }[] = [
  { value: "mentor", label: "Mentor" },
  { value: "judge", label: "Jurado" },
  { value: "volunteer", label: "Voluntario" },
];

const ROLE_LABEL: Record<ApplyRole, string> = {
  mentor: "mentor",
  judge: "jurado",
  volunteer: "voluntario",
};

const EXPERTISE_AREAS = [
  "DeFi",
  "NFTs",
  "Infraestructura",
  "Gaming",
  "Social",
  "Herramientas de Desarrollo",
  "Otro",
];

const SPECIFIC_EXPERIENCES = ["Monad", "Cadenas EVM", "Otros L1s", "L2s", "Cross-chain"];

const JUDGING_CRITERIA = [
  { key: "innovation", label: "Innovación" },
  { key: "technical", label: "Ejecución Técnica" },
  { key: "team", label: "Equipo" },
  { key: "market", label: "Potencial de Mercado" },
  { key: "ux", label: "UX/UI" },
];

const roleRequired = z.object({
  role: z.enum(["mentor", "judge", "volunteer"], { message: "Elige un rol" }),
});

function schemaFor(role: string) {
  if (role === "mentor") return mentorSchema;
  if (role === "judge") return judgeSchema;
  if (role === "volunteer") return volunteerSchema;
  return roleRequired;
}

function initialRole(value: string | null): ApplyRole | "" {
  if (value === "mentor" || value === "judge" || value === "volunteer") return value;
  return "";
}

function messageOf(error: { message?: string } | undefined) {
  return error?.message;
}

export default function ApplyForm() {
  const params = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentRole, setSentRole] = useState<ApplyRole>("mentor");

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<ApplyFormValues>({
    resolver: (async (values, context, options) =>
      zodResolver(schemaFor(values.role))(
        values as never,
        context,
        options as never
      )) as Resolver<ApplyFormValues>,
    defaultValues: {
      role: initialRole(params.get("role")),
      full_name: "",
      email: "",
      phone: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      telegram: "",
      whatsapp: "",
      city: "medellin",
      mentor_primary_skills: [],
      mentor_monad_experience: false,
      mentor_monad_experience_details: "",
      mentor_blockchain_experience: "",
      mentor_non_technical_skills: [],
      mentor_previous_experience: false,
      mentor_previous_details: "",
      mentor_bio: "",
      mentor_why: "",
      mentor_team_commitment: "",
      judge_current_role: "",
      judge_years_blockchain: undefined,
      judge_years_total: undefined,
      judge_bio: "",
      judge_technical_level: "",
      judge_expertise_areas: [],
      judge_specific_experience: [],
      judge_previous_experience: false,
      judge_previous_details: "",
      judge_criteria_ranking: {},
      judge_conflicts: "",
      judge_conflict_details: "",
      judge_why: "",
      volunteer_availability: "",
      volunteer_why: "",
    },
  });

  const role = watch("role");
  const watchMonadExperience = watch("mentor_monad_experience");
  const watchMentorPrevious = watch("mentor_previous_experience");
  const watchMentorBio = watch("mentor_bio");
  const watchJudgePrevious = watch("judge_previous_experience");
  const watchConflicts = watch("judge_conflicts");
  const watchJudgeBio = watch("judge_bio");
  const watchWhy = watch("volunteer_why");

  const onSubmit = async (data: ApplyFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al enviar la aplicación");
      }
      if (data.role) setSentRole(data.role);
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Error al enviar la aplicación");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-monad-dark flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Aplicación enviada</h2>
          <p className="text-white/70 mb-6">
            Gracias por aplicar como {ROLE_LABEL[sentRole]}. Revisaremos tu aplicación y te
            contactaremos pronto.
          </p>
          <Link
            href="/"
            className="inline-block bg-monad-primary text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:brightness-110 transition-all"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-monad-dark py-16 sm:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Aplica al equipo</h1>
          <p className="text-white/70 text-base sm:text-lg">
            Registro abierto para MonadBlitz Medellín V2, 17 de octubre de 2026. Elige el rol y
            completa solo lo que aplica. Si ya aplicaste en junio, puedes volver a aplicar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 space-y-8"
        >
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">Rol</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ROLES.map((item) => {
                const selected = role === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setValue("role", item.value, { shouldValidate: false })}
                    className={`min-h-11 rounded-full px-4 py-3 font-mono text-sm uppercase tracking-wide transition-colors ${
                      selected
                        ? "bg-monad-primary text-white"
                        : "border border-white/15 text-white/80 hover:border-monad-primary/60"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {errors.role?.message && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </section>

          {role === "mentor" && (
            <>
              <ContactFields register={register} errors={errors} kind="social" />
              <CityField register={register} errors={errors} />
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Experiencia
                </h2>
                <Controller
                  name="mentor_primary_skills"
                  control={control}
                  render={({ field }) => (
                    <CheckGrid
                      label="Habilidades técnicas principales"
                      required
                      options={TECHNICAL_SKILLS}
                      value={field.value}
                      onChange={field.onChange}
                      error={messageOf(errors.mentor_primary_skills)}
                    />
                  )}
                />
                <FormCheckbox
                  label="Tengo experiencia con Monad o desarrollo EVM"
                  {...register("mentor_monad_experience")}
                />
                {watchMonadExperience && (
                  <FormTextarea
                    label="Cuéntanos sobre tu experiencia con Monad/EVM"
                    required
                    {...register("mentor_monad_experience_details")}
                    error={errors.mentor_monad_experience_details?.message}
                    placeholder="Describe tu experiencia con Monad o cadenas EVM"
                  />
                )}
                <FormTextarea
                  label="Otra experiencia en blockchain"
                  required
                  {...register("mentor_blockchain_experience")}
                  error={errors.mentor_blockchain_experience?.message}
                  placeholder="Describe tu experiencia con otras blockchains y proyectos"
                />
                <Controller
                  name="mentor_non_technical_skills"
                  control={control}
                  render={({ field }) => (
                    <CheckGrid
                      label="Habilidades no técnicas (opcional)"
                      options={NON_TECHNICAL_SKILLS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Experiencia como mentor
                </h2>
                <FormCheckbox
                  label="He sido mentor en hackathons anteriormente"
                  {...register("mentor_previous_experience")}
                />
                {watchMentorPrevious && (
                  <FormTextarea
                    label="Cuéntanos sobre tu experiencia previa como mentor"
                    required
                    {...register("mentor_previous_details")}
                    error={errors.mentor_previous_details?.message}
                    placeholder="En qué hackathons? Cuántos equipos?"
                  />
                )}
                <FormTextarea
                  label="Bio breve"
                  required
                  {...register("mentor_bio")}
                  error={errors.mentor_bio?.message}
                  placeholder="Cuéntanos sobre tu trayectoria (50-500 caracteres)"
                  maxLength={500}
                  showCount
                  currentLength={watchMentorBio?.length}
                />
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Compromiso
                </h2>
                <FormTextarea
                  label="Por qué quieres ser mentor en MonadBlitz?"
                  required
                  {...register("mentor_why")}
                  error={errors.mentor_why?.message}
                  placeholder="Comparte tu motivación para ser mentor"
                />
                <FormSelect
                  label="A cuantos equipos puedes comprometerte a ayudar?"
                  required
                  {...register("mentor_team_commitment")}
                  error={errors.mentor_team_commitment?.message}
                  options={[
                    { value: "1-2", label: "1-2 equipos" },
                    { value: "3-5", label: "3-5 equipos" },
                    { value: "5+", label: "5+ equipos" },
                    { value: "flexible", label: "Flexible" },
                  ]}
                />
              </section>
            </>
          )}

          {role === "judge" && (
            <>
              <ContactFields register={register} errors={errors} kind="social" />
              <CityField register={register} errors={errors} />
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Perfil profesional
                </h2>
                <FormField
                  label="Rol actual y empresa"
                  required
                  {...register("judge_current_role")}
                  error={errors.judge_current_role?.message}
                  placeholder="ej. Lead Developer en Monad Labs"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    label="Años de experiencia en blockchain/Web3"
                    type="number"
                    required
                    {...register("judge_years_blockchain", { valueAsNumber: true })}
                    error={errors.judge_years_blockchain?.message}
                    placeholder="5"
                  />
                  <FormField
                    label="Años de experiencia total en tech/negocios"
                    type="number"
                    required
                    {...register("judge_years_total", { valueAsNumber: true })}
                    error={errors.judge_years_total?.message}
                    placeholder="10"
                  />
                </div>
                <FormTextarea
                  label="Bio profesional"
                  required
                  {...register("judge_bio")}
                  error={errors.judge_bio?.message}
                  placeholder="Cuéntanos sobre tu trayectoria (100-800 caracteres)"
                  maxLength={800}
                  showCount
                  currentLength={watchJudgeBio?.length}
                />
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Areas de expertise
                </h2>
                <FormSelect
                  label="Nivel de expertise técnico"
                  required
                  {...register("judge_technical_level")}
                  error={errors.judge_technical_level?.message}
                  options={[
                    { value: "highly_technical", label: "Altamente técnico" },
                    { value: "moderate", label: "Moderado" },
                    { value: "business_focused", label: "Enfoque en negocios" },
                  ]}
                />
                <Controller
                  name="judge_expertise_areas"
                  control={control}
                  render={({ field }) => (
                    <CheckGrid
                      label="Areas de expertise"
                      required
                      options={EXPERTISE_AREAS}
                      value={field.value}
                      onChange={field.onChange}
                      error={messageOf(errors.judge_expertise_areas)}
                    />
                  )}
                />
                <Controller
                  name="judge_specific_experience"
                  control={control}
                  render={({ field }) => (
                    <CheckGrid
                      label="Experiencia específica con"
                      required
                      options={SPECIFIC_EXPERIENCES}
                      value={field.value}
                      onChange={field.onChange}
                      error={messageOf(errors.judge_specific_experience)}
                    />
                  )}
                />
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Experiencia como jurado
                </h2>
                <FormCheckbox
                  label="He sido jurado en hackathons anteriormente"
                  {...register("judge_previous_experience")}
                />
                {watchJudgePrevious && (
                  <FormTextarea
                    label="Cuéntanos sobre tu experiencia previa como jurado"
                    required
                    {...register("judge_previous_details")}
                    error={errors.judge_previous_details?.message}
                    placeholder="En qué hackathons? Cuántos?"
                  />
                )}
                <Controller
                  name="judge_criteria_ranking"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="block text-sm font-mono uppercase tracking-wide text-white/90">
                        Ordena los criterios de evaluación (1-5)
                        <span className="text-monad-primary ml-1">*</span>
                      </label>
                      <p className="text-xs text-white/50 mb-3">
                        1 = más importante, 5 = menos importante
                      </p>
                      <div className="space-y-3">
                        {JUDGING_CRITERIA.map((criterion) => (
                          <div
                            key={criterion.key}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="text-sm text-white/80">{criterion.label}</span>
                            <select
                              value={field.value?.[criterion.key] || ""}
                              onChange={(e) => {
                                field.onChange({
                                  ...field.value,
                                  [criterion.key]: Number(e.target.value),
                                });
                              }}
                              className="px-3 py-2 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-monad-primary"
                            >
                              <option value="">-</option>
                              {[1, 2, 3, 4, 5].map((rank) => (
                                <option key={rank} value={rank}>
                                  {rank}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      {errors.judge_criteria_ranking && (
                        <p className="text-red-500 text-sm">
                          {messageOf(errors.judge_criteria_ranking as { message?: string }) ||
                            "Por favor completa todos los criterios"}
                        </p>
                      )}
                    </div>
                  )}
                />
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Conflictos de interés
                </h2>
                <FormSelect
                  label="¿Estás afiliado a algún proyecto que planea participar?"
                  required
                  {...register("judge_conflicts")}
                  error={errors.judge_conflicts?.message}
                  options={[
                    { value: "ninguno", label: "No, ninguno" },
                    { value: "si", label: "Si, tengo conflictos" },
                  ]}
                />
                {watchConflicts === "si" && (
                  <FormTextarea
                    label="Describe tus conflictos de interés"
                    required
                    {...register("judge_conflict_details")}
                    error={errors.judge_conflict_details?.message}
                    placeholder="Describe los proyectos con los que tienes relación"
                  />
                )}
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Motivación
                </h2>
                <FormTextarea
                  label="Por qué quieres ser jurado en MonadBlitz?"
                  required
                  {...register("judge_why")}
                  error={errors.judge_why?.message}
                  placeholder="Comparte tu motivación para ser jurado"
                />
              </section>
            </>
          )}

          {role === "volunteer" && (
            <>
              <ContactFields register={register} errors={errors} kind="chat" />
              <CityField register={register} errors={errors} />
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Disponibilidad
                </h2>
                <FormSelect
                  label="¿Cuándo puedes apoyar?"
                  required
                  {...register("volunteer_availability")}
                  error={errors.volunteer_availability?.message}
                  options={[
                    { value: "event_day", label: "Solo el día del evento" },
                    {
                      value: "pre_event",
                      label: "Solo pre-evento (logística, difusión, montaje)",
                    },
                    { value: "both", label: "Pre-evento y día del evento" },
                  ]}
                />
              </section>
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                  Motivación
                </h2>
                <FormTextarea
                  label="Por qué quieres ser voluntario en MonadBlitz?"
                  required
                  {...register("volunteer_why")}
                  error={errors.volunteer_why?.message}
                  placeholder="Cuéntanos brevemente tu motivación"
                  maxLength={500}
                  showCount
                  currentLength={watchWhy?.length}
                />
              </section>
            </>
          )}

          {role && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-monad-primary text-white font-bold px-8 py-4 rounded-full font-mono uppercase tracking-wide hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Enviar aplicación"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function ContactFields({
  register,
  errors,
  kind,
}: {
  register: ReturnType<typeof useForm<ApplyFormValues>>["register"];
  errors: ReturnType<typeof useForm<ApplyFormValues>>["formState"]["errors"];
  kind: "social" | "chat";
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">Contacto</h2>
      <FormField
        label="Nombre completo"
        required
        {...register("full_name")}
        error={errors.full_name?.message}
        placeholder="Juan Perez"
      />
      <FormField
        label="Correo electrónico"
        type="email"
        required
        {...register("email")}
        error={errors.email?.message}
        placeholder="juan@example.com"
      />
      {kind === "social" ? (
        <>
          <p className="text-sm text-white/50">Completa al menos 2 de los siguientes 4 campos</p>
          <FormField
            label="Telefono"
            type="tel"
            {...register("phone")}
            error={errors.phone?.message}
            placeholder="3001234567"
          />
          <FormField
            label="Perfil de LinkedIn"
            {...register("linkedin")}
            error={errors.linkedin?.message}
            placeholder="https://linkedin.com/in/monadcolombia"
          />
          <FormField
            label="Twitter/X"
            {...register("twitter")}
            error={errors.twitter?.message}
            placeholder="@monadcolombia"
          />
          <FormField
            label="Instagram"
            {...register("instagram")}
            error={errors.instagram?.message}
            placeholder="@monadcolombia"
          />
        </>
      ) : (
        <>
          <p className="text-sm text-white/50">
            Comparte tu Telegram o WhatsApp. Telegram es mejor para coordinar.
          </p>
          <FormField
            label="Telegram"
            {...register("telegram")}
            error={errors.telegram?.message}
            placeholder="@tuhandle"
          />
          <FormField
            label="WhatsApp"
            type="tel"
            {...register("whatsapp")}
            error={errors.whatsapp?.message}
            placeholder="3001234567"
          />
        </>
      )}
    </section>
  );
}

function CityField({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<ApplyFormValues>>["register"];
  errors: ReturnType<typeof useForm<ApplyFormValues>>["formState"]["errors"];
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">Ciudad</h2>
      <FormSelect
        label="En qué ciudad puedes asistir?"
        required
        {...register("city")}
        error={errors.city?.message}
        options={[{ value: "medellin", label: "Medellín (17 de octubre, 2026)" }]}
      />
      <p className="text-sm text-white/50">
        El evento es de un solo día. Se requiere disponibilidad completa.
      </p>
    </section>
  );
}

function CheckGrid({
  label,
  required,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  required?: boolean;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="block text-sm font-mono uppercase tracking-wide text-white/90">
        {label}
        {required && <span className="text-monad-primary ml-1">*</span>}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 cursor-pointer min-h-11">
            <input
              type="checkbox"
              value={option}
              checked={value.includes(option)}
              onChange={(e) => {
                onChange(
                  e.target.checked ? [...value, option] : value.filter((item) => item !== option)
                );
              }}
              className="w-4 h-4 rounded bg-white/5 border border-white/10 checked:bg-monad-primary checked:border-monad-primary"
            />
            <span className="text-sm text-white/80">{option}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

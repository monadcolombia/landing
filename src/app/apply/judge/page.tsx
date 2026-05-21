"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { judgeSchema, type JudgeApplication } from "@/lib/validations/applications";
import { FormField } from "@/components/forms/FormField";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { motion } from "framer-motion";
import Link from "next/link";

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

export default function JudgeApplicationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<JudgeApplication>({
    resolver: zodResolver(judgeSchema),
    defaultValues: {
      role: "judge",
      judge_previous_experience: false,
      judge_expertise_areas: [],
      judge_specific_experience: [],
      judge_criteria_ranking: {},
    },
  });

  const watchPreviousExperience = watch("judge_previous_experience");
  const watchConflicts = watch("judge_conflicts");
  const watchBio = watch("judge_bio");

  const onSubmit = async (data: JudgeApplication) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al enviar la aplicación");
      }

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
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-monad-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-monad-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Aplicación Enviada!</h2>
          <p className="text-white/70 mb-6">
            Gracias por aplicar como jurado. Revisaremos tu aplicación y te contactaremos pronto.
          </p>
          <Link
            href="/"
            className="inline-block bg-monad-primary text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:brightness-110 transition-all"
          >
            Volver al Inicio
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-monad-dark py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Aplicación de Jurado</h1>
            <p className="text-white/70 text-lg">
              Ayuda a evaluar y reconocer proyectos blockchain excepcionales en Colombia
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
          >
            {/* Información Básica */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Información Básica
              </h2>

              <FormField
                label="Nombre Completo"
                required
                {...register("full_name")}
                error={errors.full_name?.message}
                placeholder="Juan Perez"
              />

              <FormField
                label="Correo Electrónico"
                type="email"
                required
                {...register("email")}
                error={errors.email?.message}
                placeholder="juan@example.com"
              />

              <p className="text-sm text-white/50">
                Completa al menos 2 de los siguientes 4 campos
              </p>

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
            </div>

            {/* Ciudad */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">Ciudad</h2>

              <FormSelect
                label="En que evento puedes ser jurado?"
                required
                {...register("city")}
                error={errors.city?.message}
                options={[
                  { value: "medellin", label: "Medellin (Junio 6, 2026)" },
                  { value: "bogota", label: "Bogota (Fecha por confirmar)" },
                  { value: "both", label: "Ambos eventos" },
                ]}
              />

              <p className="text-sm text-white/50">
                El evento es de un solo día. Se requiere disponibilidad completa.
              </p>
            </div>

            {/* Perfil Profesional */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Perfil Profesional
              </h2>

              <FormField
                label="Rol actual y empresa"
                required
                {...register("judge_current_role")}
                error={errors.judge_current_role?.message}
                placeholder="ej. Lead Developer en Monad Labs"
              />

              <div className="grid md:grid-cols-2 gap-6">
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
                currentLength={watchBio?.length}
              />
            </div>

            {/* Areas de Expertise */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Areas de Expertise
              </h2>

              <FormSelect
                label="Nivel de expertise técnico"
                required
                {...register("judge_technical_level")}
                error={errors.judge_technical_level?.message}
                options={[
                  { value: "highly_technical", label: "Altamente Técnico" },
                  { value: "moderate", label: "Moderado" },
                  { value: "business_focused", label: "Enfoque en Negocios" },
                ]}
              />

              <Controller
                name="judge_expertise_areas"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-mono uppercase tracking-wide text-white/90">
                      Areas de expertise
                      <span className="text-monad-primary ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {EXPERTISE_AREAS.map((area) => (
                        <label key={area} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={area}
                            checked={field.value?.includes(area)}
                            onChange={(e) => {
                              const updatedValue = e.target.checked
                                ? [...(field.value || []), area]
                                : (field.value || []).filter((v) => v !== area);
                              field.onChange(updatedValue);
                            }}
                            className="w-4 h-4 rounded bg-white/5 border border-white/10 checked:bg-monad-primary checked:border-monad-primary"
                          />
                          <span className="text-sm text-white/80">{area}</span>
                        </label>
                      ))}
                    </div>
                    {errors.judge_expertise_areas && (
                      <p className="text-red-500 text-sm">{errors.judge_expertise_areas.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="judge_specific_experience"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-mono uppercase tracking-wide text-white/90">
                      Experiencia específica con
                      <span className="text-monad-primary ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {SPECIFIC_EXPERIENCES.map((exp) => (
                        <label key={exp} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={exp}
                            checked={field.value?.includes(exp)}
                            onChange={(e) => {
                              const updatedValue = e.target.checked
                                ? [...(field.value || []), exp]
                                : (field.value || []).filter((v) => v !== exp);
                              field.onChange(updatedValue);
                            }}
                            className="w-4 h-4 rounded bg-white/5 border border-white/10 checked:bg-monad-primary checked:border-monad-primary"
                          />
                          <span className="text-sm text-white/80">{exp}</span>
                        </label>
                      ))}
                    </div>
                    {errors.judge_specific_experience && (
                      <p className="text-red-500 text-sm">
                        {errors.judge_specific_experience.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Experiencia como Jurado */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Experiencia como Jurado
              </h2>

              <FormCheckbox
                label="He sido jurado en hackathons anteriormente"
                {...register("judge_previous_experience")}
              />

              {watchPreviousExperience && (
                <FormTextarea
                  label="Cuéntanos sobre tu experiencia previa como jurado"
                  required
                  {...register("judge_previous_details")}
                  error={errors.judge_previous_details?.message}
                  placeholder="En que hackathons? Cuantos?"
                />
              )}

              <Controller
                name="judge_criteria_ranking"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-mono uppercase tracking-wide text-white/90">
                      Ordena los criterios de evaluación por importancia (1-5)
                      <span className="text-monad-primary ml-1">*</span>
                    </label>
                    <p className="text-xs text-white/50 mb-3">
                      1 = Mas Importante, 5 = Menos Importante
                    </p>
                    <div className="space-y-3">
                      {JUDGING_CRITERIA.map((criterion) => (
                        <div key={criterion.key} className="flex items-center justify-between">
                          <span className="text-white/80">{criterion.label}</span>
                          <select
                            value={(field.value as Record<string, number>)?.[criterion.key] || ""}
                            onChange={(e) => {
                              field.onChange({
                                ...(field.value as object),
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
                      <p className="text-red-500 text-sm mt-2">
                        {(errors.judge_criteria_ranking as { message?: string }).message ||
                          "Por favor completa todos los criterios"}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Conflictos de Interés */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Conflictos de Interés
              </h2>

              <FormSelect
                label="Estas afiliado a algun proyecto que planea participar?"
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
                  placeholder="Describe los proyectos con los que tienes relacion"
                />
              )}
            </div>

            {/* Motivación */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Motivación
              </h2>

              <FormTextarea
                label="Por que quieres ser jurado en MonadBlitz?"
                required
                {...register("judge_why")}
                error={errors.judge_why?.message}
                placeholder="Comparte tu motivación para ser jurado"
              />
            </div>

            {/* Enviar */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-monad-primary text-white font-bold px-8 py-4 rounded-full font-mono uppercase tracking-wide hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Enviar Aplicación"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

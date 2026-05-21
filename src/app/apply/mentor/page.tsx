"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  mentorSchema,
  type MentorApplication,
  TECHNICAL_SKILLS,
  NON_TECHNICAL_SKILLS,
} from "@/lib/validations/applications";
import { FormField } from "@/components/forms/FormField";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MentorApplicationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<MentorApplication>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      role: "mentor",
      mentor_monad_experience: false,
      mentor_previous_experience: false,
      mentor_primary_skills: [],
      mentor_non_technical_skills: [],
    },
  });

  const watchMonadExperience = watch("mentor_monad_experience");
  const watchPreviousExperience = watch("mentor_previous_experience");
  const watchBio = watch("mentor_bio");

  const onSubmit = async (data: MentorApplication) => {
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
            Gracias por aplicar como mentor. Revisaremos tu aplicación y te contactaremos pronto.
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Aplicación de Mentor</h1>
            <p className="text-white/70 text-lg">
              Ayuda a formar la próxima generación de builders blockchain en Colombia
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
                label="A que ciudad puedes asistir?"
                required
                {...register("city")}
                error={errors.city?.message}
                options={[
                  { value: "medellin", label: "Medellin (Junio 6, 2026)" },
                  { value: "bogota", label: "Bogota (Fecha por confirmar)" },
                  { value: "both", label: "Ambas ciudades" },
                ]}
              />

              <p className="text-sm text-white/50">
                El evento es de un solo día. Se requiere disponibilidad completa.
              </p>
            </div>

            {/* Experiencia */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Experiencia
              </h2>

              <Controller
                name="mentor_primary_skills"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-mono uppercase tracking-wide text-white/90">
                      Habilidades técnicas principales
                      <span className="text-monad-primary ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {TECHNICAL_SKILLS.map((skill) => (
                        <label key={skill} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={skill}
                            checked={field.value?.includes(skill)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(field.value || []), skill]
                                : (field.value || []).filter((v) => v !== skill);
                              field.onChange(updated);
                            }}
                            className="w-4 h-4 rounded bg-white/5 border border-white/10 checked:bg-monad-primary checked:border-monad-primary"
                          />
                          <span className="text-sm text-white/80">{skill}</span>
                        </label>
                      ))}
                    </div>
                    {errors.mentor_primary_skills && (
                      <p className="text-red-500 text-sm">{errors.mentor_primary_skills.message}</p>
                    )}
                  </div>
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
                  <div className="space-y-2">
                    <label className="block text-sm font-mono uppercase tracking-wide text-white/90">
                      Habilidades no técnicas (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {NON_TECHNICAL_SKILLS.map((skill) => (
                        <label key={skill} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={skill}
                            checked={field.value?.includes(skill)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(field.value || []), skill]
                                : (field.value || []).filter((v) => v !== skill);
                              field.onChange(updated);
                            }}
                            className="w-4 h-4 rounded bg-white/5 border border-white/10 checked:bg-monad-primary checked:border-monad-primary"
                          />
                          <span className="text-sm text-white/80">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Experiencia de Mentoria */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Experiencia como Mentor
              </h2>

              <FormCheckbox
                label="He sido mentor en hackathons anteriormente"
                {...register("mentor_previous_experience")}
              />

              {watchPreviousExperience && (
                <FormTextarea
                  label="Cuéntanos sobre tu experiencia previa como mentor"
                  required
                  {...register("mentor_previous_details")}
                  error={errors.mentor_previous_details?.message}
                  placeholder="En que hackathons? Cuantos equipos?"
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
                currentLength={watchBio?.length}
              />
            </div>

            {/* Compromiso */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Compromiso
              </h2>

              <FormTextarea
                label="Por que quieres ser mentor en MonadBlitz?"
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

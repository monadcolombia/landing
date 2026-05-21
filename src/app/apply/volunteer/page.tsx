"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { volunteerSchema, type VolunteerApplication } from "@/lib/validations/applications";
import { FormField } from "@/components/forms/FormField";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VolunteerApplicationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VolunteerApplication>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      role: "volunteer",
    },
  });

  const watchWhy = watch("volunteer_why");

  const onSubmit = async (data: VolunteerApplication) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al enviar la aplicacion");
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Error al enviar la aplicacion");
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
          <h2 className="text-2xl font-bold text-white mb-2">Aplicacion Enviada!</h2>
          <p className="text-white/70 mb-6">
            Gracias por querer ser voluntario. Revisaremos tu aplicacion y te contactaremos pronto.
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
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Aplicacion de Voluntario
            </h1>
            <p className="text-white/70 text-lg">
              Ayudanos a hacer realidad MonadBlitz. El equipo backstage que hace que todo funcione.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
          >
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Informacion de contacto
              </h2>

              <FormField
                label="Nombre Completo"
                required
                {...register("full_name")}
                error={errors.full_name?.message}
                placeholder="Juan Perez"
              />

              <FormField
                label="Correo Electronico"
                type="email"
                required
                {...register("email")}
                error={errors.email?.message}
                placeholder="juan@example.com"
              />

              <p className="text-sm text-white/50">
                Comparte tu Telegram o WhatsApp (preferiblemente Telegram para coordinar facil)
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
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">Ciudad</h2>

              <FormSelect
                label="En que ciudad puedes ayudar?"
                required
                {...register("city")}
                error={errors.city?.message}
                options={[
                  { value: "medellin", label: "Medellin (Junio 6, 2026)" },
                  { value: "bogota", label: "Bogota (Fecha por confirmar)" },
                  { value: "both", label: "Ambas ciudades" },
                ]}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Disponibilidad
              </h2>

              <FormSelect
                label="Cuando puedes apoyar?"
                required
                {...register("volunteer_availability")}
                error={errors.volunteer_availability?.message}
                options={[
                  { value: "event_day", label: "Solo el dia del evento" },
                  { value: "pre_event", label: "Solo pre-evento (logistica, difusion, montaje)" },
                  { value: "both", label: "Pre-evento y dia del evento" },
                ]}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-3">
                Motivacion
              </h2>

              <FormTextarea
                label="Por que quieres ser voluntario en MonadBlitz?"
                required
                {...register("volunteer_why")}
                error={errors.volunteer_why?.message}
                placeholder="Cuentanos brevemente tu motivacion"
                maxLength={500}
                showCount
                currentLength={watchWhy?.length}
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-monad-primary text-white font-bold px-8 py-4 rounded-full font-mono uppercase tracking-wide hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Enviar Aplicacion"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

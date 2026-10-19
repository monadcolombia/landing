"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ASPECTS,
  ATTENDANCE,
  BOOTCAMP,
  HEARD_FROM,
  KEEP_BUILDING,
  type AspectKey,
} from "@/lib/survey";

type State = {
  overall: number | null;
  attendance: string | null;
  heardFrom: string[];
  builtBefore: boolean | null;
  bootcamp: string | null;
  aspects: Partial<Record<AspectKey, number>>;
  improve: string;
  keepBuilding: string | null;
  notifyNext: boolean | null;
  contact: string;
  website: string;
};

const chip = (on: boolean) =>
  `px-4 py-2 rounded-full border text-sm transition-colors ${
    on
      ? "bg-monad-primary border-monad-primary text-white"
      : "border-white/15 text-white/80 hover:border-white/40"
  }`;

function Question({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-white font-semibold">
        <span className="text-monad-light font-mono mr-2">{n}.</span>
        {title}
      </legend>
      {hint && <p className="text-xs text-white/50 -mt-1">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Stars({
  value,
  onChange,
  label,
}: {
  value: number | null | undefined;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className={`w-11 h-11 rounded-lg font-mono text-sm border transition-colors ${
            value === n
              ? "bg-monad-primary border-monad-primary text-white"
              : "border-white/15 text-white/70 hover:border-white/40"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function FeedbackForm() {
  const [s, setS] = useState<State>({
    overall: null,
    attendance: null,
    heardFrom: [],
    builtBefore: null,
    bootcamp: null,
    aspects: {},
    improve: "",
    keepBuilding: null,
    notifyNext: null,
    contact: "",
    website: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const missing =
    s.overall === null ||
    s.attendance === null ||
    s.builtBefore === null ||
    s.bootcamp === null ||
    s.keepBuilding === null ||
    s.notifyNext === null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missing) {
      setError("Responde las preguntas 1, 2, 4, 5 y 8 para enviar.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overall: s.overall,
          attendance: s.attendance,
          heardFrom: s.heardFrom,
          builtBefore: s.builtBefore,
          bootcamp: s.bootcamp,
          ...s.aspects,
          improve: s.improve,
          keepBuilding: s.keepBuilding,
          notifyNext: s.notifyNext,
          contact: s.contact,
          website: s.website,
        }),
      });
      if (!r.ok) throw new Error();
      try {
        localStorage.setItem("monad-feedback-v2-done", "1");
      } catch {}
      setDone(true);
    } catch {
      setError("No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-monad-dark flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-[10px] font-mono uppercase tracking-[3px] text-monad-light mb-3">
            {"// GRACIAS"}
          </p>
          <h1 className="text-3xl font-heading font-extrabold text-white">
            ¡Gracias por contarnos!
          </h1>
          <p className="mt-3 text-white/70">
            Con tus respuestas armamos el próximo Blitz. Nos vemos pronto.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 px-6 py-3 rounded-full bg-monad-primary text-white font-mono uppercase text-sm tracking-wide"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-monad-dark py-10 sm:py-16 px-4">
      <form onSubmit={submit} className="max-w-xl mx-auto space-y-9">
        <header>
          <p className="text-[10px] font-mono uppercase tracking-[3px] text-monad-light mb-3">
            {"// MONADBLITZ MEDELLÍN V2"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            ¿Cómo te fue en el Blitz?
          </h1>
          <p className="mt-3 text-white/70">
            Son 8 preguntas y toma 2 minutos. Es anónimo, a menos que nos dejes un contacto al
            final.
          </p>
        </header>

        {/* Honeypot for bots, hidden from people and screen readers */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={s.website}
          onChange={(e) => set("website", e.target.value)}
          className="hidden"
          aria-hidden="true"
        />

        <Question
          n={1}
          title="En general, ¿cómo calificas el Blitz?"
          hint="1 = muy malo, 5 = excelente"
        >
          <Stars
            value={s.overall}
            onChange={(v) => set("overall", v)}
            label="Calificación general"
          />
        </Question>

        <Question n={2} title="¿Es tu primer Blitz o también fuiste al V1?">
          <div className="flex flex-wrap gap-2">
            {ATTENDANCE.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set("attendance", o.value)}
                className={chip(s.attendance === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Question>

        <Question n={3} title="¿Cómo te enteraste?" hint="Puedes marcar varias">
          <div className="flex flex-wrap gap-2">
            {HEARD_FROM.map((o) => {
              const on = s.heardFrom.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() =>
                    set(
                      "heardFrom",
                      on ? s.heardFrom.filter((h) => h !== o.value) : [...s.heardFrom, o.value]
                    )
                  }
                  className={chip(on)}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </Question>

        <Question n={4} title="¿Ya habías construido en Monad antes?">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => set("builtBefore", true)}
              className={chip(s.builtBefore === true)}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => set("builtBefore", false)}
              className={chip(s.builtBefore === false)}
            >
              No, fue mi primera vez
            </button>
          </div>
        </Question>

        <Question n={5} title="¿Fuiste al bootcamp virtual? ¿Te sirvió?">
          <div className="flex flex-wrap gap-2">
            {BOOTCAMP.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set("bootcamp", o.value)}
                className={chip(s.bootcamp === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Question>

        <Question n={6} title="Califica de 1 a 5" hint="Deja en blanco lo que no aplique">
          <div className="space-y-4">
            {ASPECTS.map((a) => (
              <div
                key={a.key}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <span className="text-sm text-white/80">{a.label}</span>
                <Stars
                  value={s.aspects[a.key]}
                  onChange={(v) => set("aspects", { ...s.aspects, [a.key]: v })}
                  label={a.label}
                />
              </div>
            ))}
          </div>
        </Question>

        <Question n={7} title="¿Qué mejorarías para el próximo?">
          <textarea
            value={s.improve}
            onChange={(e) => set("improve", e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Lo que quieras: horarios, comida, mentores, premios, la plataforma..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-monad-primary"
          />
        </Question>

        <Question n={8} title="¿Vas a seguir construyendo tu proyecto?">
          <div className="flex flex-wrap gap-2">
            {KEEP_BUILDING.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set("keepBuilding", o.value)}
                className={chip(s.keepBuilding === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-white/80 pt-2">¿Te avisamos del próximo Blitz?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => set("notifyNext", true)}
              className={chip(s.notifyNext === true)}
            >
              Sí, avísenme
            </button>
            <button
              type="button"
              onClick={() => set("notifyNext", false)}
              className={chip(s.notifyNext === false)}
            >
              No, gracias
            </button>
          </div>
          {s.notifyNext && (
            <input
              type="text"
              value={s.contact}
              onChange={(e) => set("contact", e.target.value)}
              maxLength={200}
              placeholder="Tu correo o usuario de Telegram"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-monad-primary"
            />
          )}
        </Question>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full py-4 rounded-full bg-monad-primary hover:brightness-110 text-white font-mono uppercase tracking-wide text-sm disabled:opacity-50"
        >
          {sending ? "Enviando..." : "Enviar respuestas"}
        </button>
      </form>
    </main>
  );
}

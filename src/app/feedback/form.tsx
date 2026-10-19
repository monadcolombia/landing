"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ASPECTS,
  ATTENDANCE,
  BOOTCAMP,
  HEARD_FROM,
  HIGHLIGHT_ROLES,
  KEEP_BUILDING,
  titleCaseName,
  type AspectKey,
} from "@/lib/survey";
import { ORGANIZERS_BY_EDITION } from "@/lib/organizers";
import MemberAvatar from "@/components/MemberAvatar";

/* ------------------------------------------------------------------ */
/* Types and state                                                     */
/* ------------------------------------------------------------------ */

type Person = {
  role: (typeof HIGHLIGHT_ROLES)[number]["key"];
  name: string;
  /** Application id, for the team photo */
  id?: string;
  /** Static photo, for organizers */
  image?: string;
};

const roleLabel = (r: Person["role"]) =>
  ({ organizer: "Organización", mentor: "Mentor", judge: "Jurado", volunteer: "Voluntario" })[r];
const personKey = (p: Person) => `${roleLabel(p.role)} · ${p.name}`;

type Answers = {
  overall: number | null;
  attendance: string | null;
  heardFrom: string[];
  builtBefore: boolean | null;
  bootcamp: string | null;
  aspects: Partial<Record<AspectKey, number>>;
  highlights: string[];
  improve: string;
  keepBuilding: string | null;
  notifyNext: boolean | null;
  contact: string;
};

const EMPTY: Answers = {
  overall: null,
  attendance: null,
  heardFrom: [],
  builtBefore: null,
  bootcamp: null,
  aspects: {},
  highlights: [],
  improve: "",
  keepBuilding: null,
  notifyNext: null,
  contact: "",
};

const DRAFT_KEY = "monad-feedback-v2-draft";
const DONE_KEY = "monad-feedback-v2-done";
const TOTAL = 9;

function loadDraft(): { a: Answers; step: number } | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return { a: { ...EMPTY, ...d.a }, step: Number(d.step) || 0 };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Option({
  selected,
  onClick,
  children,
  multi,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`w-full min-h-[56px] flex items-center gap-3 text-left px-4 py-3 rounded-2xl border text-base transition-all active:scale-[0.98] ${
        selected
          ? "bg-monad-primary/20 border-monad-primary text-white"
          : "bg-white/[0.04] border-white/10 text-white/90 hover:border-white/30"
      }`}
    >
      <span
        aria-hidden="true"
        className={`shrink-0 w-6 h-6 flex items-center justify-center border-2 text-xs ${
          multi ? "rounded-md" : "rounded-full"
        } ${selected ? "bg-monad-primary border-monad-primary text-white" : "border-white/30"}`}
      >
        {selected ? "✓" : ""}
      </span>
      <span>{children}</span>
    </button>
  );
}

function Scale({
  value,
  onChange,
  label,
  big,
}: {
  value: number | null | undefined;
  onChange: (v: number) => void;
  label: string;
  big?: boolean;
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} de 5`}
            onClick={() => onChange(n)}
            className={`${big ? "h-16 text-2xl" : "h-12 text-lg"} rounded-2xl font-heading font-bold border transition-all active:scale-95 ${
              value === n
                ? "bg-monad-primary border-monad-primary text-white"
                : "bg-white/[0.04] border-white/10 text-white/80 hover:border-white/30"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {big && (
        <div className="flex justify-between text-xs text-white/50 mt-2 px-1">
          <span>Muy malo</span>
          <span>Excelente</span>
        </div>
      )}
    </div>
  );
}

function PersonCard({
  p,
  selected,
  onClick,
}: {
  p: Person;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={`relative flex flex-col items-center text-center rounded-2xl border px-1.5 pt-3 pb-2 transition-all active:scale-95 ${
        selected
          ? "border-monad-primary bg-monad-primary/20"
          : "border-white/10 bg-white/[0.04] hover:border-white/30"
      }`}
    >
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image}
          alt=""
          loading="lazy"
          className={`w-14 h-14 rounded-full object-cover mb-3 ring-2 ${
            selected ? "ring-monad-primary" : "ring-white/10"
          }`}
        />
      ) : (
        <MemberAvatar
          id={p.id ?? ""}
          name={p.name}
          sizeClass="w-14 h-14"
          ringClass={selected ? "ring-2 ring-monad-primary" : "ring-white/10"}
        />
      )}
      <span className="text-[13px] leading-tight text-white/90">{p.name}</span>
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-monad-primary text-white text-[11px] flex items-center justify-center">
          ✓
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export default function FeedbackForm() {
  const [a, setA] = useState<Answers>(EMPTY);
  // 0 = welcome screen, 1..TOTAL = questions
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [people, setPeople] = useState<Person[]>(() =>
    ORGANIZERS_BY_EDITION.v2.map((o) => ({
      role: "organizer" as const,
      name: titleCaseName(o.name),
      image: o.image,
    }))
  );
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");
  const restored = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore an unfinished answer after a reload.
  useEffect(() => {
    const d = loadDraft();
    restored.current = true;
    if (!d) return;
    const t = setTimeout(() => {
      setA(d.a);
      setStep(Math.min(Math.max(d.step, 0), TOTAL));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!restored.current || done) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ a, step }));
    } catch {}
  }, [a, step, done]);

  useEffect(() => {
    fetch("/api/team?edition=v2")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d: { data?: { id: string; role: string; fullName: string }[] }) => {
        const team = (d.data ?? [])
          .filter((m) => ["mentor", "judge", "volunteer"].includes(m.role))
          .map((m) => ({
            role: m.role as Person["role"],
            name: titleCaseName(m.fullName),
            id: m.id,
          }));
        setPeople((prev) => [...prev.filter((p) => p.role === "organizer"), ...team]);
      })
      .catch(() => {});
  }, []);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    []
  );

  const go = useCallback(
    (to: number) => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      setDir(to > step ? 1 : -1);
      setStep(to);
      setError("");
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [step]
  );

  const update = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setA((prev) => ({ ...prev, [k]: v }));

  /** For single-choice questions: save and move on after a short beat. */
  const pickAndNext = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    update(k, v);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => go(step + 1), 280);
  };

  const toggle = (k: "heardFrom" | "highlights", v: string) =>
    setA((prev) => ({
      ...prev,
      [k]: prev[k].includes(v) ? prev[k].filter((x) => x !== v) : [...prev[k], v],
    }));

  const canContinue = (() => {
    switch (step) {
      case 1:
        return a.overall !== null;
      case 2:
        return a.attendance !== null;
      case 4:
        return a.builtBefore !== null;
      case 5:
        return a.bootcamp !== null;
      case 9:
        return a.keepBuilding !== null && a.notifyNext !== null;
      default:
        return true;
    }
  })();
  const optional = step === 3 || step === 6 || step === 7 || step === 8;
  const hasAnswer =
    (step === 3 && a.heardFrom.length > 0) ||
    (step === 6 && Object.keys(a.aspects).length > 0) ||
    (step === 7 && a.highlights.length > 0) ||
    (step === 8 && a.improve.trim().length > 0);

  const submit = async () => {
    setSending(true);
    setError("");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overall: a.overall,
          attendance: a.attendance,
          heardFrom: a.heardFrom,
          builtBefore: a.builtBefore,
          bootcamp: a.bootcamp,
          ...a.aspects,
          highlights: a.highlights,
          improve: a.improve,
          keepBuilding: a.keepBuilding,
          notifyNext: a.notifyNext,
          contact: a.contact,
          website,
        }),
      });
      if (!r.ok) throw new Error();
      try {
        localStorage.setItem(DONE_KEY, "1");
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      setDone(true);
    } catch {
      setError("No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  /* ---------------------------- Done screen ---------------------------- */
  if (done) {
    return (
      <main className="min-h-[100dvh] bg-monad-dark flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-monad-primary flex items-center justify-center text-3xl text-white">
            ✓
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-white">¡Gracias!</h1>
          <p className="mt-3 text-white/70 text-lg">
            Con tus respuestas armamos el próximo Blitz. Nos vemos pronto.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 px-8 py-4 rounded-full bg-monad-primary text-white font-mono uppercase text-sm tracking-wide"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </main>
    );
  }

  /* --------------------------- Welcome screen -------------------------- */
  if (step === 0) {
    return (
      <main className="min-h-[100dvh] bg-monad-dark flex flex-col px-6 pt-16 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <p className="text-[11px] font-mono uppercase tracking-[3px] text-monad-light mb-4">
            {"// MONADBLITZ MEDELLÍN V2"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white leading-[1.05]">
            ¿Cómo te fue en el Blitz?
          </h1>
          <p className="mt-5 text-lg text-white/70">
            Ayúdanos a armar el próximo. Son {TOTAL} preguntas cortas, casi todas de tocar una
            opción.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-white/70">
            <span className="px-3 py-1.5 rounded-full bg-white/[0.06]">⏱ 2 minutos</span>
            <span className="px-3 py-1.5 rounded-full bg-white/[0.06]">🔒 Anónima</span>
          </div>
        </div>
        <div className="max-w-md mx-auto w-full">
          <button
            type="button"
            onClick={() => go(1)}
            className="w-full py-4 rounded-full bg-monad-primary hover:brightness-110 text-white font-mono uppercase tracking-wide text-base active:scale-[0.98] transition-transform"
          >
            Empezar
          </button>
          <p className="mt-3 text-center text-xs text-white/40">
            Usamos cookies esenciales.{" "}
            <Link href="/privacidad" className="underline hover:text-white/70">
              Privacidad
            </Link>
          </p>
        </div>
      </main>
    );
  }

  /* ------------------------------ Questions ---------------------------- */
  const progress = (step - 1) / TOTAL + (canContinue ? 1 / TOTAL : 0);

  return (
    <main className="min-h-[100dvh] bg-monad-dark flex flex-col">
      {/* Honeypot for bots, hidden from people and screen readers */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      {/* Top bar: back, progress */}
      <header className="sticky top-0 z-10 bg-monad-dark/95 backdrop-blur px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(step - 1)}
            aria-label="Pregunta anterior"
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 4.5L7 10l5.5 5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div
            className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={TOTAL}
            aria-valuenow={step}
            aria-label={`Pregunta ${step} de ${TOTAL}`}
          >
            <motion.div
              className="h-full rounded-full bg-monad-primary"
              animate={{ width: `${Math.max(progress, 0.04) * 100}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-mono text-white/60 w-10 text-right">
            {step}/{TOTAL}
          </span>
        </div>
      </header>

      {/* Question body */}
      <div className="flex-1 px-5 pt-4 pb-32">
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.section
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {step === 1 && (
                <Q title="En general, ¿cómo calificas el Blitz?">
                  <Scale
                    big
                    value={a.overall}
                    label="Calificación general"
                    onChange={(v) => pickAndNext("overall", v)}
                  />
                </Q>
              )}

              {step === 2 && (
                <Q title="¿Es tu primer Blitz o también fuiste al V1?">
                  {ATTENDANCE.map((o) => (
                    <Option
                      key={o.value}
                      selected={a.attendance === o.value}
                      onClick={() => pickAndNext("attendance", o.value)}
                    >
                      {o.label}
                    </Option>
                  ))}
                </Q>
              )}

              {step === 3 && (
                <Q title="¿Cómo te enteraste?" hint="Puedes marcar varias">
                  {HEARD_FROM.map((o) => (
                    <Option
                      key={o.value}
                      multi
                      selected={a.heardFrom.includes(o.value)}
                      onClick={() => toggle("heardFrom", o.value)}
                    >
                      {o.label}
                    </Option>
                  ))}
                </Q>
              )}

              {step === 4 && (
                <Q title="¿Ya habías construido en Monad antes?">
                  <Option
                    selected={a.builtBefore === true}
                    onClick={() => pickAndNext("builtBefore", true)}
                  >
                    Sí
                  </Option>
                  <Option
                    selected={a.builtBefore === false}
                    onClick={() => pickAndNext("builtBefore", false)}
                  >
                    No, fue mi primera vez
                  </Option>
                </Q>
              )}

              {step === 5 && (
                <Q title="¿Fuiste al bootcamp virtual? ¿Te sirvió?">
                  {BOOTCAMP.map((o) => (
                    <Option
                      key={o.value}
                      selected={a.bootcamp === o.value}
                      onClick={() => pickAndNext("bootcamp", o.value)}
                    >
                      {o.label}
                    </Option>
                  ))}
                </Q>
              )}

              {step === 6 && (
                <Q
                  title="Califica de 1 a 5"
                  hint="1 = muy malo, 5 = excelente. Salta lo que no aplique"
                >
                  <div className="space-y-5">
                    {ASPECTS.map((x) => (
                      <div key={x.key}>
                        <p className="text-white/90 mb-2">{x.label}</p>
                        <Scale
                          value={a.aspects[x.key]}
                          label={x.label}
                          onChange={(v) => update("aspects", { ...a.aspects, [x.key]: v })}
                        />
                      </div>
                    ))}
                  </div>
                </Q>
              )}

              {step === 7 && (
                <Q title="¿A quién resaltarías del evento?" hint="Toca a quienes quieras">
                  <div className="space-y-5">
                    {HIGHLIGHT_ROLES.map((r) => {
                      const group = people.filter((p) => p.role === r.key);
                      if (group.length === 0) return null;
                      return (
                        <div key={r.key}>
                          <p className="text-[11px] font-mono uppercase tracking-[2px] text-white/50 mb-2">
                            {r.label}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {group.map((p) => {
                              const k = personKey(p);
                              return (
                                <PersonCard
                                  key={k}
                                  p={p}
                                  selected={a.highlights.includes(k)}
                                  onClick={() => toggle("highlights", k)}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Q>
              )}

              {step === 8 && (
                <Q title="¿Qué mejorarías para el próximo?" hint="Lo que quieras, en tus palabras">
                  <textarea
                    value={a.improve}
                    onChange={(e) => update("improve", e.target.value)}
                    rows={6}
                    maxLength={2000}
                    placeholder="Horarios, comida, mentores, premios, la plataforma..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-base focus:outline-none focus:border-monad-primary"
                  />
                </Q>
              )}

              {step === 9 && (
                <Q title="¿Vas a seguir construyendo tu proyecto?">
                  <div className="grid grid-cols-3 gap-2">
                    {KEEP_BUILDING.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        role="radio"
                        aria-checked={a.keepBuilding === o.value}
                        onClick={() => update("keepBuilding", o.value)}
                        className={`h-14 rounded-2xl border text-base transition-all active:scale-95 ${
                          a.keepBuilding === o.value
                            ? "bg-monad-primary border-monad-primary text-white"
                            : "bg-white/[0.04] border-white/10 text-white/90"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xl font-heading font-bold text-white pt-6">
                    ¿Te avisamos del próximo Blitz?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: true, l: "Sí, avísenme" },
                      { v: false, l: "No, gracias" },
                    ].map((o) => (
                      <button
                        key={String(o.v)}
                        type="button"
                        role="radio"
                        aria-checked={a.notifyNext === o.v}
                        onClick={() => update("notifyNext", o.v)}
                        className={`h-14 rounded-2xl border text-base transition-all active:scale-95 ${
                          a.notifyNext === o.v
                            ? "bg-monad-primary border-monad-primary text-white"
                            : "bg-white/[0.04] border-white/10 text-white/90"
                        }`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                  {a.notifyNext && (
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      value={a.contact}
                      onChange={(e) => update("contact", e.target.value)}
                      maxLength={200}
                      placeholder="Tu correo o usuario de Telegram"
                      className="w-full h-14 px-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-base focus:outline-none focus:border-monad-primary"
                    />
                  )}
                </Q>
              )}
            </motion.section>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom action bar, always within thumb reach */}
      <footer className="fixed bottom-0 inset-x-0 z-10 bg-gradient-to-t from-monad-dark via-monad-dark/95 to-transparent px-5 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto">
          {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
          {step < TOTAL ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => go(step + 1)}
              className="w-full py-4 rounded-full bg-monad-primary hover:brightness-110 text-white font-mono uppercase tracking-wide text-base disabled:opacity-30 active:scale-[0.98] transition-all"
            >
              {optional && !hasAnswer ? "Saltar" : "Siguiente"}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canContinue || sending}
              onClick={submit}
              className="w-full py-4 rounded-full bg-monad-primary hover:brightness-110 text-white font-mono uppercase tracking-wide text-base disabled:opacity-30 active:scale-[0.98] transition-all"
            >
              {sending ? "Enviando..." : "Enviar respuestas"}
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}

function Q({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-2xl sm:text-3xl font-heading font-bold text-white leading-tight mb-1">
        {title}
      </legend>
      {hint && <p className="text-sm text-white/50 !mt-1 mb-4">{hint}</p>}
      <div className="space-y-3 pt-2">{children}</div>
    </fieldset>
  );
}

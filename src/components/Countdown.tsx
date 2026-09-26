"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { getUpcomingCity } from "@/lib/constants";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate + "T09:00:00-05:00").getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

// External store for countdown - avoids setState-in-effect issues
function createCountdownStore(targetDate: string | null) {
  let listeners: Array<() => void> = [];
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function getSnapshot(): string {
    if (!targetDate) return JSON.stringify({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    return JSON.stringify(calculateTimeLeft(targetDate));
  }

  function getServerSnapshot(): string {
    return JSON.stringify({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  }

  function subscribe(listener: () => void): () => void {
    listeners.push(listener);
    if (listeners.length === 1 && targetDate) {
      intervalId = setInterval(() => {
        listeners.forEach((l) => l());
      }, 1000);
    }
    return () => {
      listeners = listeners.filter((l) => l !== listener);
      if (listeners.length === 0 && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }

  return { subscribe, getSnapshot, getServerSnapshot };
}

const EASING = [0.16, 1, 0.3, 1] as const;

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-monad-dark tabular-nums tracking-tight">
        {value}
      </span>
      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[2px] text-monad-dark/40 mt-1">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-monad-primary/60 self-start mt-1">
      :
    </span>
  );
}

// Singleton stores per target date
const stores = new Map<string, ReturnType<typeof createCountdownStore>>();
function getStore(targetDate: string | null) {
  const key = targetDate ?? "__none__";
  if (!stores.has(key)) {
    stores.set(key, createCountdownStore(targetDate));
  }
  return stores.get(key)!;
}

export default function Countdown() {
  const event = getUpcomingCity();
  const store = getStore(event?.dateISO ?? null);

  const timeLeftJson = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const timeLeft: TimeLeft = JSON.parse(timeLeftJson);

  if (!event?.dateISO) return null;

  const isOver =
    timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  // If server snapshot returns zeros but the timer hasn't actually reached zero,
  // the store hasn't started ticking yet - show dashes as loading state.
  // We derive this from the timeLeft itself: if the server snapshot is all zeros
  // and we know the event is in the future (static check), show dashes.
  const showDashes = isOver && timeLeftJson === store.getServerSnapshot();

  return (
    <section id="countdown" className="py-12 sm:py-16 px-6 bg-white relative overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, #6E54FF, transparent 70%)" }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="text-center"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-monad-dark/40 mb-2">
            {"// PRÓXIMO EVENTO"}
          </p>
          <h3 className="text-lg sm:text-xl font-heading font-bold text-monad-dark mb-1">
            MonadBlitz {event.name}
          </h3>
          <p className="text-sm font-mono text-monad-primary mb-8">{event.date}</p>

          {/* Timer */}
          {showDashes ? (
            <div className="flex items-center justify-center gap-3 sm:gap-5 lg:gap-8">
              <TimeUnit value="--" label="Días" />
              <Separator />
              <TimeUnit value="--" label="Horas" />
              <Separator />
              <TimeUnit value="--" label="Min" />
              <Separator />
              <TimeUnit value="--" label="Seg" />
            </div>
          ) : !isOver ? (
            <motion.div
              className="flex items-center justify-center gap-3 sm:gap-5 lg:gap-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASING }}
            >
              <TimeUnit value={pad(timeLeft.days)} label="Días" />
              <Separator />
              <TimeUnit value={pad(timeLeft.hours)} label="Horas" />
              <Separator />
              <TimeUnit value={pad(timeLeft.minutes)} label="Min" />
              <Separator />
              <TimeUnit value={pad(timeLeft.seconds)} label="Seg" />
            </motion.div>
          ) : (
            <p className="text-xl font-heading font-bold text-monad-primary">
              El evento ha comenzado!
            </p>
          )}

          {/* Urgency */}
          {!isOver && (
            <p className="mt-6 text-xs font-mono text-monad-dark/50 uppercase tracking-wide">
              Cupos limitados - 100 lugares
            </p>
          )}

          {/* CTA */}
          {event.registrationUrl && (
            <motion.div
              className="mt-4 flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-monad-primary text-white font-bold px-8 py-3 rounded-full hover:brightness-110 transition-all text-center font-mono uppercase tracking-wide btn-glow text-sm"
              >
                Registrate Ahora
              </a>
              <AddToCalendarButton event={event} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function AddToCalendarButton({
  event,
}: {
  event: { name: string; dateISO: string | null; venue?: string };
}) {
  if (!event.dateISO) return null;

  const title = encodeURIComponent(`MonadBlitz ${event.name}`);
  // Use Colombia timezone (America/Bogota) with ctz param so Google handles conversion
  const dateClean = event.dateISO.replace(/-/g, "");
  const startDateTime = `${dateClean}T100000`;
  const endDateTime = `${dateClean}T220000`;
  const details = encodeURIComponent(
    "MonadBlitz Hackathon - Monad Tour Colombia 2026. Un día de hacking intensivo construyendo en Monad.\n\nMás info: https://monadcolombia.xyz"
  );
  const location = encodeURIComponent(event.venue || event.name + ", Colombia");

  // Google Calendar: timed event (10:00 - 20:00 COT)
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}&ctz=America/Bogota`;

  return (
    <a
      href={googleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border border-monad-dark/20 text-monad-dark/70 font-medium px-6 py-3 rounded-full hover:border-monad-primary/50 hover:text-monad-dark transition-all text-center font-mono text-sm"
      aria-label={`Agregar MonadBlitz ${event.name} a Google Calendar`}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      Agregar al Calendario
    </a>
  );
}

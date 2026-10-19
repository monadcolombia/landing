"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { getUpcomingCity } from "@/lib/constants";

const SEEN_KEY = "monad-feedback-v2-popup";
const DONE_KEY = "monad-feedback-v2-done";
const SHOW_AFTER_MS = 3000;

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export default function FeedbackPopup() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    setOpen(false);
  }, []);

  useEffect(() => {
    // While a next Blitz is announced, the event popup takes this slot instead.
    if (getUpcomingCity()) return;
    if (read(SEEN_KEY) === "1" || read(DONE_KEY) === "1") return;
    const t = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={close}
          aria-modal="true"
          role="dialog"
          aria-labelledby="feedback-popup-title"
        >
          <div className="absolute inset-0 bg-monad-dark/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-7 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              aria-label="Cerrar"
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-900 transition-colors p-1"
            >
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <p className="text-[10px] font-mono uppercase tracking-[3px] text-monad-primary mb-3">
              {"// MEDELLÍN V2"}
            </p>
            <h2
              id="feedback-popup-title"
              className="text-3xl font-extrabold font-heading text-gray-900 leading-tight"
            >
              ¿Fuiste al Blitz?
            </h2>
            <p className="text-gray-600 mt-3 mb-6">
              Cuéntanos cómo te fue. Toma 2 minutos. Con tus respuestas armamos el próximo.
            </p>
            <Link
              href="/feedback"
              onClick={close}
              className="block w-full bg-monad-primary text-white text-center font-bold py-3 rounded-full hover:brightness-110 transition-all font-mono uppercase tracking-wide text-sm"
            >
              Responder encuesta
            </Link>
            <button
              onClick={close}
              className="block w-full text-center text-xs text-gray-500 mt-3 hover:text-gray-700 transition-colors"
            >
              ahora no
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

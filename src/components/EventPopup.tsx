"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "monad-popup-seen";
const SHOW_AFTER_MS = 4000;

export default function EventPopup() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    const t = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onEsc);
    };
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
              {"// PROXIMO MONADBLITZ"}
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 leading-tight">
              Medellin
            </h3>
            <p className="text-sm font-mono text-gray-500 mt-2 mb-6">6 de Junio, 2026</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-monad-primary mt-1 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8 4.5 8s4.5-4.5 4.5-8c0-2.5-2-4.5-4.5-4.5z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <div className="text-sm">
                  <a
                    href="https://maps.app.goo.gl/7eVLjPduu39L3iB19"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-heading font-semibold text-gray-900 hover:text-monad-primary transition-colors"
                  >
                    Indie Universe Hotel
                  </a>
                  <p className="text-xs text-gray-500">Coliving, Coffee & Cowork 24/7</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-monad-primary mt-1 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 13.5h12M3 13.5v-5h2v5M7 13.5v-7h2v7M11 13.5v-9h2v9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm text-gray-700">$2,000 USD en premios</span>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-4 h-4 text-monad-primary mt-1 flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M8 4v4l2.5 1.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-sm text-gray-700">9:00 AM - 10:00 PM</span>
              </div>
            </div>

            <a
              href="https://lu.ma/medellinblockchain"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="block w-full bg-monad-primary text-white text-center font-bold py-3 rounded-full hover:brightness-110 transition-all font-mono uppercase tracking-wide text-sm"
            >
              Registrate gratis
            </a>
            <button
              onClick={close}
              className="block w-full text-center text-xs text-gray-400 mt-3 hover:text-gray-600 transition-colors"
            >
              ahora no
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "monad-banner-dismissed-until";
const DISMISS_DAYS = 7;

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notify() {
  listeners.forEach((cb) => cb());
}

function isVisible(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const until = stored ? Number(stored) : 0;
  if (Number.isFinite(until) && until > Date.now()) return false;
  return true;
}

function isVisibleServer(): boolean {
  return false;
}

export default function AnnouncementBar() {
  const visible = useSyncExternalStore(subscribe, isVisible, isVisibleServer);

  useEffect(() => {
    document.documentElement.style.setProperty("--banner-h", visible ? "36px" : "0px");
    return () => {
      document.documentElement.style.setProperty("--banner-h", "0px");
    };
  }, [visible]);

  const dismiss = () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000)
    );
    notify();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          exit={{ y: -40 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-[60] h-9 bg-monad-primary text-white flex items-center px-4"
          role="region"
          aria-label="Anuncio del proximo evento"
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono">
            <span className="hidden sm:inline whitespace-nowrap">6 Jun 2026</span>
            <span className="hidden sm:inline text-white/60">·</span>
            <span className="whitespace-nowrap truncate">Indie Universe Hotel, Medellin</span>
            <a
              href="https://lu.ma/medellinblockchain"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold uppercase tracking-wide underline underline-offset-2 hover:no-underline whitespace-nowrap"
            >
              Registrate
            </a>
          </div>
          <button
            onClick={dismiss}
            aria-label="Cerrar anuncio"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

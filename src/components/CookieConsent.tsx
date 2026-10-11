"use client";

import { useSyncExternalStore, useCallback } from "react";

const COOKIE_CONSENT_KEY = "cookie_consent";

function getSnapshot(): boolean {
  return !localStorage.getItem(COOKIE_CONSENT_KEY);
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function CookieConsent() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const accept = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto bg-monad-dark/90 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 sm:p-5 flex flex-row items-center gap-3 sm:gap-4">
        <p className="text-xs sm:text-sm text-white/80 flex-1">
          <span className="hidden sm:inline">
            Este sitio usa cookies esenciales para su funcionamiento. Al continuar navegando,
            aceptas su uso.{" "}
          </span>
          <span className="sm:hidden">Usamos cookies esenciales. </span>
          <a href="/privacidad" className="text-monad-primary hover:underline">
            <span className="hidden sm:inline">Consulta nuestra política de privacidad</span>
            <span className="sm:hidden">Privacidad</span>
          </a>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-monad-primary text-white text-xs sm:text-sm font-mono uppercase tracking-wide px-4 sm:px-5 py-2 rounded-full hover:brightness-110 transition-all"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

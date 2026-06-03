"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type GoogleCredentialResponse = { credential?: string };

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "small" | "medium" | "large";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
    }
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [gisReady, setGisReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleGoogleCredential = useCallback(async (response: GoogleCredentialResponse) => {
    if (!response.credential) {
      setError("No se recibio credencial de Google");
      return;
    }
    try {
      const res = await fetch("/api/admin/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setError("");
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403) {
          setError("Este correo no esta autorizado");
        } else {
          setError(data.error || "Error al ingresar con Google");
        }
      }
    } catch {
      setError("Error de conexion con Google");
    }
  }, []);

  useEffect(() => {
    if (
      !gisReady ||
      isAuthenticated !== false ||
      !googleButtonRef.current ||
      !GOOGLE_CLIENT_ID ||
      !window.google
    ) {
      return;
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: "signin_with",
      shape: "pill",
      logo_alignment: "left",
      width: 320,
    });
  }, [gisReady, isAuthenticated, handleGoogleCredential]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    router.push("/");
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-monad-dark flex items-center justify-center">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-monad-dark flex items-center justify-center px-4">
        {GOOGLE_CLIENT_ID ? (
          <>
            <Script
              src="https://accounts.google.com/gsi/client"
              strategy="afterInteractive"
              onLoad={() => setGisReady(true)}
            />
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8">
              <h1 className="text-2xl font-bold text-white mb-6 text-center">Acceso Admin</h1>
              <div className="flex justify-center">
                <div ref={googleButtonRef} />
              </div>
              {error && <p className="text-red-500 text-sm text-center mt-6">{error}</p>}
            </div>
          </>
        ) : (
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Acceso Admin</h1>
            <p className="text-white/70 text-sm">
              Login con Google no esta configurado. Falta `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-monad-dark">
      <header className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">MonadBlitz Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Cerrar Sesion
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

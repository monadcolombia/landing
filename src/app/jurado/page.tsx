"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  AREA_LABELS,
  CRITERIA,
  SCALE_HELP,
  SCORE_OPTIONS,
  type CriterionKey,
  type JudgeAreaKey,
} from "@/lib/judging";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type Judge = { email: string; name: string; area: JudgeAreaKey };
type Project = {
  id: string;
  name: string;
  team: string | null;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  contractAddress: string | null;
  deployed: boolean;
};
type Score = Partial<Record<CriterionKey, number | null>> & {
  projectId: string;
  comment?: string | null;
};

function completeCount(s?: Score) {
  if (!s) return 0;
  return CRITERIA.filter((c) => typeof s[c.key] === "number").length;
}

export default function JuradoPage() {
  return (
    <Suspense fallback={<p className="p-8 text-white/70">Cargando...</p>}>
      <Jurado />
    </Suspense>
  );
}

function Jurado() {
  const params = useSearchParams();
  const [auth, setAuth] = useState<boolean | null>(null);
  const [judge, setJudge] = useState<Judge | null>(null);
  const [error, setError] = useState(
    params.get("error") === "link"
      ? "El link no es válido o ya venció. Pide uno nuevo al equipo."
      : ""
  );
  const [gisReady, setGisReady] = useState(false);
  const btnRef = useRef<HTMLDivElement | null>(null);

  const loadMe = useCallback(async () => {
    try {
      const r = await fetch("/api/jurado/me");
      const d = await r.json();
      setAuth(Boolean(d.authenticated));
      setJudge(d.judge ?? null);
    } catch {
      setAuth(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(loadMe, 0);
    return () => clearTimeout(t);
  }, [loadMe]);

  const onCredential = useCallback(
    async (response: { credential?: string }) => {
      if (!response.credential) return setError("No se recibió credencial de Google");
      const r = await fetch("/api/jurado/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (r.ok) {
        setError("");
        loadMe();
      } else if (r.status === 403) {
        setError("Este correo no está registrado como jurado. Escríbele al equipo organizador.");
      } else {
        setError("No se pudo ingresar con Google. Pide tu link de acceso al equipo.");
      }
    },
    [loadMe]
  );

  useEffect(() => {
    if (!gisReady || auth !== false || !btnRef.current || !GOOGLE_CLIENT_ID || !window.google)
      return;
    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onCredential });
    window.google.accounts.id.renderButton(btnRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: "signin_with",
      shape: "pill",
      width: 300,
    });
  }, [gisReady, auth, onCredential]);

  if (auth === null) return <p className="p-8 text-white/70">Cargando...</p>;

  if (!auth || !judge) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {GOOGLE_CLIENT_ID && (
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => setGisReady(true)}
          />
        )}
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-monad-primary">
            Monad Blitz Medellín V2
          </p>
          <h1 className="text-2xl font-bold mt-2 mb-6">Acceso jurado</h1>
          <div className="flex justify-center">
            <div ref={btnRef} />
          </div>
          {error && <p className="text-red-400 text-sm mt-6">{error}</p>}
          <p className="text-white/50 text-xs mt-6">
            Si no puedes entrar con Google, pide tu link de acceso personal al equipo organizador.
          </p>
        </div>
      </div>
    );
  }

  return <ScoringBoard judge={judge} onLogout={() => setAuth(false)} />;
}

function ScoringBoard({ judge, onLogout }: { judge: Judge; onLogout: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/jurado/projects");
    if (r.status === 401) return onLogout();
    const d = await r.json();
    setProjects(d.projects || []);
    const map: Record<string, Score> = {};
    for (const s of d.scores || []) map[s.projectId] = s;
    setScores(map);
    setLoading(false);
  }, [onLogout]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const eligible = projects.filter((p) => p.deployed);
  const done = eligible.filter((p) => completeCount(scores[p.id]) === CRITERIA.length).length;

  const logout = async () => {
    await fetch("/api/jurado/logout", { method: "POST" });
    onLogout();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-monad-primary">
            Monad Blitz Medellín V2 · Jurado
          </p>
          <h1 className="text-2xl font-bold mt-1">{judge.name}</h1>
          <p className="text-white/60 text-sm">Área: {AREA_LABELS[judge.area]}</p>
        </div>
        <button onClick={logout} className="text-sm text-white/60 hover:text-white shrink-0">
          Salir
        </button>
      </header>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-monad-primary transition-all"
            style={{ width: `${eligible.length ? (done / eligible.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-sm font-mono text-white/80">
          {done}/{eligible.length} calificados
        </span>
      </div>

      <button
        onClick={() => setShowHelp((v) => !v)}
        className="mt-4 text-sm text-monad-primary hover:underline"
      >
        {showHelp ? "Ocultar escala" : "Ver escala de 1 a 5"}
      </button>
      {showHelp && (
        <ul className="mt-2 text-sm text-white/70 space-y-1 bg-white/5 border border-white/10 rounded-lg p-4">
          {SCALE_HELP.map((s) => (
            <li key={s}>{s}</li>
          ))}
          <li>Se permiten medios puntos. ×2 = criterio de tu área: tu nota cuenta doble.</li>
        </ul>
      )}

      {loading ? (
        <p className="mt-8 text-white/60">Cargando proyectos...</p>
      ) : projects.length === 0 ? (
        <p className="mt-8 text-white/60">
          Todavía no hay proyectos cargados. Las entregas cierran a las 6:30 pm; recarga en un rato.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              area={judge.area}
              score={scores[p.id]}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
              onSaved={(s) => {
                setScores((prev) => ({ ...prev, [p.id]: s }));
                setOpenId(null);
              }}
            />
          ))}
        </ul>
      )}

      <button
        onClick={load}
        className="mt-6 w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-sm font-mono uppercase tracking-wide"
      >
        Actualizar lista
      </button>
    </div>
  );
}

function ProjectCard({
  project: p,
  area,
  score,
  open,
  onToggle,
  onSaved,
}: {
  project: Project;
  area: JudgeAreaKey;
  score?: Score;
  open: boolean;
  onToggle: () => void;
  onSaved: (s: Score) => void;
}) {
  const n = completeCount(score);
  const badge = !p.deployed
    ? { t: "No aplica", c: "bg-white/10 text-white/50" }
    : n === CRITERIA.length
      ? { t: "Calificado", c: "bg-green-500/20 text-green-400" }
      : n > 0
        ? { t: `${n}/6`, c: "bg-yellow-500/20 text-yellow-400" }
        : { t: "Pendiente", c: "bg-monad-primary/20 text-monad-light" };

  return (
    <li className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full text-left px-4 py-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{p.name}</p>
          {p.team && <p className="text-sm text-white/50 truncate">{p.team}</p>}
        </div>
        <span className={`px-2 py-1 text-xs rounded-full shrink-0 ${badge.c}`}>{badge.t}</span>
      </button>
      {open && <ScoreForm project={p} area={area} score={score} onSaved={onSaved} />}
    </li>
  );
}

function ScoreForm({
  project: p,
  area,
  score,
  onSaved,
}: {
  project: Project;
  area: JudgeAreaKey;
  score?: Score;
  onSaved: (s: Score) => void;
}) {
  const [values, setValues] = useState<Partial<Record<CriterionKey, number | null>>>(() => {
    const v: Partial<Record<CriterionKey, number | null>> = {};
    for (const c of CRITERIA) v[c.key] = score?.[c.key] ?? null;
    return v;
  });
  const [comment, setComment] = useState(score?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const missing = useMemo(() => CRITERIA.filter((c) => values[c.key] == null).length, [values]);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const r = await fetch("/api/jurado/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: p.id, ...values, comment }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Error");
      onSaved(d.data);
    } catch {
      setMsg("No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-white/10 px-4 py-4 space-y-5">
      {p.description && (
        <p className="text-sm text-white/70 whitespace-pre-line">{p.description}</p>
      )}
      <div className="flex flex-wrap gap-2 text-sm">
        {p.repoUrl && <ExtLink href={p.repoUrl}>Repo</ExtLink>}
        {p.demoUrl && <ExtLink href={p.demoUrl}>Demo</ExtLink>}
        {p.contractAddress && (
          <ExtLink href={`https://testnet.monadvision.com/address/${p.contractAddress}`}>
            Contrato
          </ExtLink>
        )}
      </div>

      {!p.deployed ? (
        <p className="text-sm text-white/60 bg-white/5 rounded-lg p-3">
          No aplica: este proyecto no tiene un smart contract desplegado en Monad Testnet. No hace
          falta calificarlo.
        </p>
      ) : (
        <>
          {CRITERIA.map((c) => {
            const double = c.multipliers[area] === 2;
            return (
              <div key={c.key}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {c.label}{" "}
                    <span className="text-white/40 text-xs font-mono">
                      {Math.round(c.weight * 100)}%
                    </span>
                  </p>
                  {double && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-monad-primary/30 text-monad-light">
                      ×2 tu área
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-0.5">{c.question}</p>
                <div className="mt-2 grid grid-cols-9 gap-1">
                  {SCORE_OPTIONS.map((o) => {
                    const sel = values[c.key] === o;
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setValues((v) => ({ ...v, [c.key]: sel ? null : o }))}
                        className={`py-2 rounded-md font-mono transition-colors ${Number.isInteger(o) ? "text-sm" : "text-[11px]"} ${
                          sel
                            ? "bg-monad-primary text-white"
                            : Number.isInteger(o)
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "bg-white/5 text-white/60 hover:bg-white/15"
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div>
            <p className="font-medium">Comentarios (opcional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-2 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-monad-primary"
              placeholder="Qué te gustó, qué le falta..."
            />
          </div>
          {msg && <p className="text-red-400 text-sm">{msg}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 rounded-full bg-monad-primary hover:bg-monad-primary/80 font-mono uppercase tracking-wide text-sm disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : missing > 0
                ? `Guardar (faltan ${missing})`
                : "Guardar calificación"}
          </button>
        </>
      )}
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  const safe = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-monad-light"
    >
      {children} ↗
    </a>
  );
}

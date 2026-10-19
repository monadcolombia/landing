"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ASPECTS,
  ATTENDANCE,
  BOOTCAMP,
  HEARD_FROM,
  KEEP_BUILDING,
  type summarize,
} from "@/lib/survey";

type Summary = ReturnType<typeof summarize>;
type Data = {
  summary: Summary;
  comments: { createdAt: string; overall: number; text: string }[];
  contacts: { createdAt: string; contact: string; keepBuilding: string }[];
};

// V1 reference numbers, for comparison.
const V1 = { overall: 4.7, responses: 13, newToMonad: 74, builtBefore: 19 };
const SHARE_URL = "https://monadcolombia.xyz/feedback";
const btn = "px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-wide transition-colors";

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

function Card({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <p className="text-xs font-mono uppercase text-white/50">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
      {note && <p className="text-xs text-white/40 mt-1">{note}</p>}
    </div>
  );
}

function Bars({
  title,
  items,
  total,
}: {
  title: string;
  items: { label: string; n: number }[];
  total: number;
}) {
  const max = Math.max(1, ...items.map((i) => i.n));
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="font-mono uppercase text-sm text-white/80 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label} className="text-sm">
            <div className="flex justify-between text-white/80">
              <span>{i.label}</span>
              <span className="font-mono text-white/60">
                {i.n} · {pct(i.n, total)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded mt-1">
              <div
                className="h-2 bg-monad-primary rounded"
                style={{ width: `${(i.n / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [data, setData] = useState<Data | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/feedback");
      if (r.ok) setData(await r.json());
    } catch {
      // keep last data
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, 30000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Feedback Blitz V2</h2>
          <p className="text-sm text-white/50">Encuesta post-evento · se actualiza cada 30 s</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={copy} className={`${btn} bg-monad-primary text-white`}>
            {copied ? "Link copiado" : "Copiar link de la encuesta"}
          </button>
          <a
            href="/api/admin/feedback?format=csv"
            className={`${btn} bg-white/10 hover:bg-white/20 text-white`}
          >
            Descargar CSV
          </a>
          <button onClick={load} className={`${btn} bg-white/10 hover:bg-white/20 text-white`}>
            Actualizar
          </button>
        </div>
      </div>
      <p className="text-sm text-white/60">
        Link para compartir: <span className="font-mono text-monad-light">{SHARE_URL}</span>
      </p>

      {!data ? (
        <p className="text-white/60">Cargando...</p>
      ) : data.summary.total === 0 ? (
        <p className="text-white/60">
          Aún no hay respuestas. Comparte el link para empezar a recibirlas.
        </p>
      ) : (
        <Body data={data} />
      )}
    </div>
  );
}

function Body({ data }: { data: Data }) {
  const s = data.summary;
  const t = s.total;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card label="Respuestas" value={String(t)} note={`V1: ${V1.responses}`} />
        <Card
          label="Calificación general"
          value={s.overallAvg === null ? "—" : s.overallAvg.toFixed(2)}
          note={`V1: ${V1.overall} de 5`}
        />
        <Card
          label="Volvieron del V1"
          value={`${pct(s.attendance.v1, t)}%`}
          note={`${s.attendance.v1} de ${t}`}
        />
        <Card
          label="Primera vez en Monad"
          value={`${pct(s.builtBefore.no, t)}%`}
          note={`V1: ${pct(V1.newToMonad, V1.newToMonad + V1.builtBefore)}% (${V1.newToMonad} de ${V1.newToMonad + V1.builtBefore})`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Bars
          title="Calificación general"
          total={t}
          items={[5, 4, 3, 2, 1].map((n) => ({ label: `${n} de 5`, n: s.overallDist[n - 1] }))}
        />
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="font-mono uppercase text-sm text-white/80 mb-3">
            Promedio por aspecto (1 a 5)
          </h3>
          <ul className="space-y-3">
            {ASPECTS.map((a) => {
              const v = s.aspects[a.key];
              return (
                <li key={a.key} className="text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>{a.label}</span>
                    <span className="font-mono text-white">{v === null ? "—" : v.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded mt-1">
                    <div
                      className="h-2 bg-monad-primary rounded"
                      style={{ width: `${((v ?? 0) / 5) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <Bars
          title="¿Cómo se enteraron? (varias opciones)"
          total={t}
          items={HEARD_FROM.map((o) => ({ label: o.label, n: s.heardFrom[o.value] })).sort(
            (a, b) => b.n - a.n
          )}
        />
        <Bars
          title="Bootcamp virtual"
          total={t}
          items={BOOTCAMP.map((o) => ({ label: o.label, n: s.bootcamp[o.value] }))}
        />
        <Bars
          title="Asistencia"
          total={t}
          items={ATTENDANCE.map((o) => ({ label: o.label, n: s.attendance[o.value] }))}
        />
        <Bars
          title="¿Seguirán construyendo su proyecto?"
          total={t}
          items={[
            ...KEEP_BUILDING.map((o) => ({ label: o.label, n: s.keepBuilding[o.value] })),
            { label: "Quieren aviso del próximo Blitz", n: s.notifyNext },
          ]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="font-mono uppercase text-sm text-white/80 mb-3">
            ¿Qué mejorarían? ({data.comments.length})
          </h3>
          <ul className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
            {data.comments.map((c, i) => (
              <li key={i} className="text-sm text-white/80 border-b border-white/5 pb-2">
                <p className="whitespace-pre-line">{c.text}</p>
                <p className="text-xs text-white/40 mt-1">
                  General {c.overall}/5 · {new Date(c.createdAt).toLocaleString("es-CO")}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="font-mono uppercase text-sm text-white/80 mb-3">
            Para avisar del próximo Blitz ({data.contacts.length})
          </h3>
          <ul className="space-y-1 max-h-[480px] overflow-y-auto pr-2 text-sm">
            {data.contacts.map((c, i) => (
              <li key={i} className="flex justify-between gap-3 text-white/80">
                <span className="font-mono break-all">{c.contact}</span>
                <span className="text-xs text-white/40 shrink-0">
                  Sigue construyendo: {KEEP_BUILDING.find((o) => o.value === c.keepBuilding)?.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

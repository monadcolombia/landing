"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import {
  AREA_LABELS,
  CRITERIA,
  MAX_BONUS,
  type CriterionKey,
  type JudgeAreaKey,
  type ProjectResult,
} from "@/lib/judging";

type Project = {
  id: string;
  name: string;
  team: string | null;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  contractAddress: string | null;
  deployed: boolean;
  bonus: number;
};
type Judge = { id: string; email: string; name: string; area: JudgeAreaKey; active: boolean };
type Detail = Partial<Record<CriterionKey, number | null>> & {
  projectId: string;
  judge: string;
  area: JudgeAreaKey;
  comment: string | null;
};

const input =
  "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-monad-primary";
const btn = "px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-wide transition-colors";

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
  return d;
}

export default function AdminJudgingPage() {
  const [tab, setTab] = useState<"results" | "projects" | "judges">("results");
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((r) => r.json())
      .then((d) => setCanWrite(Array.isArray(d.writableRoles) && d.writableRoles.includes("judge")))
      .catch(() => setCanWrite(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-white">Jurado · Blitz V2</h2>
        <a href="/jurado" target="_blank" className="text-sm text-monad-primary hover:underline">
          Vista de jueces ↗
        </a>
      </div>
      {!canWrite && (
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-300 rounded-lg px-4 py-3 text-sm font-mono">
          Solo lectura. Necesitas acceso completo para editar proyectos y jurados.
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            ["results", "Resultados"],
            ["projects", "Proyectos"],
            ["judges", "Jurados"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`${btn} ${tab === k ? "bg-monad-primary text-white" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === "results" && <Results />}
      {tab === "projects" && <Projects canWrite={canWrite} />}
      {tab === "judges" && <Judges canWrite={canWrite} />}
    </div>
  );
}

/* ----------------------------- Results ----------------------------- */

function Results() {
  const [data, setData] = useState<{
    results: ProjectResult[];
    detail: Detail[];
    activeJudges: number;
  } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api("/api/admin/judging/results"));
      setUpdated(new Date());
    } catch {
      // keep last data
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, 15000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  if (!data) return <p className="text-white/60">Cargando...</p>;
  if (data.results.length === 0) return <p className="text-white/60">Aún no hay proyectos.</p>;

  const fmt = (n: number | null) => (n === null ? "—" : n.toFixed(2).replace(/\.00$/, ""));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/50 flex-wrap gap-2">
        <span>
          {data.activeJudges} jurados activos · se actualiza cada 15 s
          {updated && ` · ${updated.toLocaleTimeString("es-CO")}`}
        </span>
        <button onClick={load} className={`${btn} bg-white/10 hover:bg-white/20 text-white`}>
          Actualizar
        </button>
      </div>
      <p className="text-xs text-white/40">
        Rojo = los jueces difieren más de 1,5 puntos en ese criterio. Desempate: mayor promedio en
        Uso de Monad / blockchain. Toca una fila para ver las notas de cada juez.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-xs font-mono uppercase text-white/60">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Proyecto</th>
              <th className="px-3 py-2 text-right">Final</th>
              <th className="px-3 py-2 text-right">Base</th>
              <th className="px-3 py-2 text-right">Bono</th>
              {CRITERIA.map((c) => (
                <th key={c.key} className="px-3 py-2 text-right whitespace-nowrap">
                  {c.short} <span className="text-white/30">{Math.round(c.weight * 100)}%</span>
                </th>
              ))}
              <th className="px-3 py-2 text-right">Jueces</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.results.map((r) => (
              <Fragment key={r.id}>
                <tr
                  onClick={() => setOpen(open === r.id ? null : r.id)}
                  className={`cursor-pointer hover:bg-white/5 ${r.place && r.place <= 3 ? "bg-monad-primary/10" : ""}`}
                >
                  <td className="px-3 py-2 font-mono font-bold text-white">{r.place ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{r.name}</div>
                    {r.team && <div className="text-xs text-white/40">{r.team}</div>}
                    {r.status === "not_eligible" && (
                      <div className="text-xs text-white/40">No aplica (sin contrato)</div>
                    )}
                    {r.status === "incomplete" && (
                      <div className="text-xs text-yellow-400">Incompleto</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-white">{fmt(r.final)}</td>
                  <td className="px-3 py-2 text-right text-white/70">{fmt(r.base)}</td>
                  <td className="px-3 py-2 text-right text-white/70">
                    {r.base === null ? "—" : r.bonus}
                  </td>
                  {CRITERIA.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 py-2 text-right font-mono ${
                        r.discrepancies.includes(c.key) ? "text-red-400 font-bold" : "text-white/80"
                      }`}
                    >
                      {fmt(r.averages[c.key])}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-mono text-white/70">
                    {r.judgesComplete}/{data.activeJudges}
                  </td>
                </tr>
                {open === r.id && (
                  <tr className="bg-black/20">
                    <td colSpan={6 + CRITERIA.length} className="px-3 py-3">
                      <JudgeDetail rows={data.detail.filter((d) => d.projectId === r.id)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JudgeDetail({ rows }: { rows: Detail[] }) {
  if (rows.length === 0)
    return <p className="text-white/50 text-sm">Ningún juez ha calificado este proyecto.</p>;
  return (
    <div className="space-y-2">
      {rows.map((d, i) => (
        <div key={i} className="text-sm">
          <span className="text-white font-medium">{d.judge}</span>{" "}
          <span className="text-white/40">({AREA_LABELS[d.area]})</span>
          <span className="ml-2 font-mono text-white/70">
            {CRITERIA.map((c) => `${c.short}: ${d[c.key] ?? "—"}`).join(" · ")}
          </span>
          {d.comment && <p className="text-white/60 italic mt-0.5">“{d.comment}”</p>}
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Projects ----------------------------- */

function Projects({ canWrite }: { canWrite: boolean }) {
  const [list, setList] = useState<Project[]>([]);
  const [form, setForm] = useState({
    name: "",
    team: "",
    repoUrl: "",
    demoUrl: "",
    contractAddress: "",
    description: "",
    deployed: true,
  });
  const [bulk, setBulk] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const d = await api("/api/admin/judging/projects");
    setList(d.data || []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    setMsg("");
    try {
      await fn();
      if (ok) setMsg(ok);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  };

  const addOne = () =>
    run(async () => {
      await api("/api/admin/judging/projects", { method: "POST", body: JSON.stringify(form) });
      setForm({
        name: "",
        team: "",
        repoUrl: "",
        demoUrl: "",
        contractAddress: "",
        description: "",
        deployed: true,
      });
    }, "Proyecto agregado");

  const addBulk = () =>
    run(async () => {
      const projects = bulk
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [name, team, repoUrl, demoUrl, contractAddress] = l
            .split("|")
            .map((x) => x?.trim());
          return { name, team, repoUrl, demoUrl, contractAddress };
        });
      const d = await api("/api/admin/judging/projects", {
        method: "POST",
        body: JSON.stringify({ projects }),
      });
      setBulk("");
      setMsg(`${d.created} proyectos agregados`);
    });

  const patch = (id: string, body: object) =>
    run(() =>
      api(`/api/admin/judging/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) })
    );

  return (
    <div className="space-y-6">
      {canWrite && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
            <h3 className="font-mono uppercase text-sm text-white/80">Agregar proyecto</h3>
            <input
              className={input}
              placeholder="Nombre del proyecto *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className={input}
              placeholder="Equipo / integrantes"
              value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
            />
            <input
              className={input}
              placeholder="Repo (GitHub)"
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
            />
            <input
              className={input}
              placeholder="Demo (URL)"
              value={form.demoUrl}
              onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
            />
            <input
              className={input}
              placeholder="Dirección del contrato en Monad Testnet"
              value={form.contractAddress}
              onChange={(e) => setForm({ ...form, contractAddress: e.target.value })}
            />
            <textarea
              className={input}
              rows={2}
              placeholder="Descripción corta"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.deployed}
                onChange={(e) => setForm({ ...form, deployed: e.target.checked })}
              />
              Tiene smart contract desplegado en Monad Testnet
            </label>
            <button
              disabled={!form.name.trim()}
              onClick={addOne}
              className={`${btn} bg-monad-primary text-white disabled:opacity-40`}
            >
              Agregar
            </button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
            <h3 className="font-mono uppercase text-sm text-white/80">Pegar varios</h3>
            <p className="text-xs text-white/50">
              Uno por línea: Nombre | Equipo | Repo | Demo | Contrato
            </p>
            <textarea
              className={`${input} font-mono`}
              rows={9}
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              placeholder="Vertex | Juan, Cristian | github.com/... | vertex.app | 0x..."
            />
            <button
              disabled={!bulk.trim()}
              onClick={addBulk}
              className={`${btn} bg-monad-primary text-white disabled:opacity-40`}
            >
              Agregar todos
            </button>
          </div>
        </div>
      )}
      {msg && <p className="text-sm text-monad-light">{msg}</p>}

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-xs font-mono uppercase text-white/60">
            <tr>
              <th className="px-3 py-2 text-left">Proyecto ({list.length})</th>
              <th className="px-3 py-2 text-left">Links</th>
              <th className="px-3 py-2 text-center">Contrato desplegado</th>
              <th className="px-3 py-2 text-center">Bono (0–{MAX_BONUS})</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {list.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2">
                  <div className="text-white font-medium">{p.name}</div>
                  {p.team && <div className="text-xs text-white/40">{p.team}</div>}
                  {p.contractAddress && (
                    <div className="text-xs font-mono text-white/40 break-all">
                      {p.contractAddress}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-xs space-x-2 whitespace-nowrap">
                  {p.repoUrl && (
                    <a
                      className="text-monad-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={p.repoUrl.startsWith("http") ? p.repoUrl : `https://${p.repoUrl}`}
                    >
                      Repo
                    </a>
                  )}
                  {p.demoUrl && (
                    <a
                      className="text-monad-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={p.demoUrl.startsWith("http") ? p.demoUrl : `https://${p.demoUrl}`}
                    >
                      Demo
                    </a>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    disabled={!canWrite}
                    checked={p.deployed}
                    onChange={(e) => patch(p.id, { deployed: e.target.checked })}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <select
                    disabled={!canWrite}
                    value={p.bonus}
                    onChange={(e) => patch(p.id, { bonus: Number(e.target.value) })}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white"
                  >
                    {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  {canWrite && (
                    <button
                      onClick={() =>
                        confirm(`¿Borrar "${p.name}" y todas sus notas?`) &&
                        run(() => api(`/api/admin/judging/projects/${p.id}`, { method: "DELETE" }))
                      }
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Borrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- Judges ----------------------------- */

function Judges({ canWrite }: { canWrite: boolean }) {
  const [list, setList] = useState<Judge[]>([]);
  const [form, setForm] = useState({ name: "", email: "", area: "general" as JudgeAreaKey });
  const [msg, setMsg] = useState("");
  const [links, setLinks] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const d = await api("/api/admin/judging/judges");
    setList(d.data || []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setMsg("");
    try {
      await fn();
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  };

  const getLink = async (j: Judge) => {
    try {
      const d = await api(`/api/admin/judging/judges/${j.id}/link`);
      setLinks((l) => ({ ...l, [j.id]: d.url }));
      await navigator.clipboard?.writeText(d.url).catch(() => undefined);
      setMsg(`Link de ${j.name} copiado (válido 48 h)`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-6">
      {canWrite && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() =>
                run(async () => {
                  const d = await api("/api/admin/judging/judges", {
                    method: "POST",
                    body: JSON.stringify({ importApproved: true }),
                  });
                  setMsg(`${d.created} jurados importados de ${d.found} aplicaciones aprobadas`);
                })
              }
              className={`${btn} bg-monad-primary text-white`}
            >
              Importar jurados aprobados (V2)
            </button>
            <span className="text-xs text-white/50">
              El área se sugiere según su nivel técnico; revísala abajo.
            </span>
          </div>
          <div className="grid sm:grid-cols-4 gap-2">
            <input
              className={input}
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className={input}
              placeholder="Correo (Google)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <select
              className={input}
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value as JudgeAreaKey })}
            >
              {Object.entries(AREA_LABELS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <button
              disabled={!form.name.trim() || !form.email.trim()}
              onClick={() =>
                run(async () => {
                  await api("/api/admin/judging/judges", {
                    method: "POST",
                    body: JSON.stringify(form),
                  });
                  setForm({ name: "", email: "", area: "general" });
                })
              }
              className={`${btn} bg-white/10 hover:bg-white/20 text-white disabled:opacity-40`}
            >
              Agregar jurado
            </button>
          </div>
        </div>
      )}
      {msg && <p className="text-sm text-monad-light">{msg}</p>}
      <p className="text-xs text-white/50">
        ×2 por área: Negocios → Problema y Pitch · Técnico → Blockchain, Demo y Calidad técnica ·
        Creativo → Creatividad/UX y Pitch · General → todo cuenta igual.
      </p>
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-xs font-mono uppercase text-white/60">
            <tr>
              <th className="px-3 py-2 text-left">Jurado ({list.length})</th>
              <th className="px-3 py-2 text-left">Área</th>
              <th className="px-3 py-2 text-center">Activo</th>
              <th className="px-3 py-2 text-left">Acceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {list.map((j) => (
              <tr key={j.id} className={j.active ? "" : "opacity-50"}>
                <td className="px-3 py-2">
                  <div className="text-white font-medium">{j.name}</div>
                  <div className="text-xs text-white/40">{j.email}</div>
                </td>
                <td className="px-3 py-2">
                  <select
                    disabled={!canWrite}
                    value={j.area}
                    onChange={(e) =>
                      run(() =>
                        api(`/api/admin/judging/judges/${j.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ area: e.target.value }),
                        })
                      )
                    }
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white"
                  >
                    {Object.entries(AREA_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    disabled={!canWrite}
                    checked={j.active}
                    onChange={(e) =>
                      run(() =>
                        api(`/api/admin/judging/judges/${j.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ active: e.target.checked }),
                        })
                      )
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  {canWrite && (
                    <button
                      onClick={() => getLink(j)}
                      className="text-monad-primary hover:underline text-xs"
                    >
                      Copiar link de acceso
                    </button>
                  )}
                  {links[j.id] && (
                    <input
                      readOnly
                      value={links[j.id]}
                      onFocus={(e) => e.target.select()}
                      className="mt-1 w-full bg-black/30 rounded px-2 py-1 text-[11px] font-mono text-white/70"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

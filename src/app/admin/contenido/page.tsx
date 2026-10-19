"use client";

import { useCallback, useEffect, useState } from "react";
import { EDITIONS, editionInfo, type EditionKey } from "@/lib/editions";

// Public content of each edition: projects and winners, posts (tweets and other links)
// and gallery photos. Everything here shows up on monadcolombia.xyz.

const btn = "px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-wide transition-colors";
const input =
  "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-monad-primary";
const card = "bg-white/5 border border-white/10 rounded-lg p-4";

async function api(url: string, init?: RequestInit) {
  const r = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
  return d;
}

type Tab = "projects" | "posts" | "photos";

export default function ContentAdminPage() {
  const [edition, setEdition] = useState<EditionKey>("v2");
  const [tab, setTab] = useState<Tab>("projects");
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((r) => r.json())
      .then((d) => setCanWrite(Array.isArray(d.writableRoles) && d.writableRoles.includes("judge")))
      .catch(() => setCanWrite(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Contenido por edición</h2>
        <p className="text-sm text-white/50 mt-1">
          Lo que cambies aquí se ve en monadcolombia.xyz, en la pestaña de cada edición.
        </p>
      </div>
      {!canWrite && (
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-300 rounded-lg px-4 py-3 text-sm font-mono">
          Solo lectura. Necesitas acceso completo para editar.
        </div>
      )}
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex gap-2">
          {EDITIONS.map((e) => (
            <button
              key={e.key}
              onClick={() => setEdition(e.key)}
              className={`${btn} ${edition === e.key ? "bg-monad-primary text-white" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
            >
              {e.label} · {e.date.replace(/ de 2026$/, "")}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(
            [
              ["projects", "Proyectos y ganadores"],
              ["posts", "Posts"],
              ["photos", "Galería"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`${btn} ${tab === k ? "bg-white text-monad-dark" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {tab === "projects" && <Projects key={edition} edition={edition} canWrite={canWrite} />}
      {tab === "posts" && <Posts key={edition} edition={edition} canWrite={canWrite} />}
      {tab === "photos" && <Photos key={edition} edition={edition} canWrite={canWrite} />}
      <p className="text-xs text-white/40">
        El equipo (mentores, jurados y voluntarios) de cada edición sale de las aplicaciones
        aprobadas en{" "}
        <a className="underline" href="/admin">
          Aplicaciones
        </a>
        .
      </p>
    </div>
  );
}

function useList<T>(url: string) {
  const [list, setList] = useState<T[]>([]);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    try {
      const d = await api(url);
      setList(d.data || []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    }
  }, [url]);
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
  return { list, msg, setMsg, run };
}

/* ----------------------------- Projects ----------------------------- */

type Project = {
  id: string;
  name: string;
  team: string | null;
  place: number | null;
  tweetUrl: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
};

function Projects({ edition, canWrite }: { edition: EditionKey; canWrite: boolean }) {
  const { list, msg, setMsg, run } = useList<Project>(
    `/api/admin/judging/projects?edition=${edition}`
  );
  const patch = (id: string, body: object) =>
    run(() =>
      api(`/api/admin/judging/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) })
    );
  const sorted = [...list].sort(
    (a, b) => (a.place ?? 9) - (b.place ?? 9) || a.name.localeCompare(b.name, "es")
  );

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className={`${card} flex flex-wrap items-center gap-3`}>
          <p className="flex-1 min-w-[220px] text-xs text-white/50">
            Trae los proyectos de {editionInfo(edition).blitzSlug} en blitz.devnads.com, con sus
            tweets e imágenes.
            {edition === "v1" && " En V1 también trae los ganadores que quedaron en Blitz."} Se
            puede repetir: no duplica ni borra lo que ya editaste.
          </p>
          <button
            onClick={() =>
              run(async () => {
                const d = await api(`/api/admin/judging/import?edition=${edition}`, {
                  method: "POST",
                });
                setMsg(
                  `Blitz: ${d.found} proyectos, ${d.created} nuevos, ${d.updated} actualizados`
                );
              })
            }
            className={`${btn} bg-monad-primary text-white`}
          >
            Importar desde Blitz
          </button>
        </div>
      )}
      {msg && <p className="text-sm text-monad-light">{msg}</p>}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 border-b border-white/10 text-xs font-mono uppercase text-white/60">
            <tr>
              <th className="px-3 py-2 text-left">Proyecto ({list.length})</th>
              <th className="px-3 py-2 text-left">Tweet</th>
              <th className="px-3 py-2 text-center">Ganador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sorted.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2">
                  <div className="text-white font-medium">{p.name}</div>
                  {p.team && <div className="text-xs text-white/40">{p.team}</div>}
                </td>
                <td className="px-3 py-2">
                  <input
                    key={p.tweetUrl ?? ""}
                    type="url"
                    disabled={!canWrite}
                    placeholder="https://x.com/.../status/..."
                    defaultValue={p.tweetUrl ?? ""}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== (p.tweetUrl ?? "")) patch(p.id, { tweetUrl: v });
                    }}
                    className="w-full min-w-56 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <select
                    disabled={!canWrite}
                    value={p.place ?? ""}
                    onChange={(e) =>
                      patch(p.id, { place: e.target.value ? Number(e.target.value) : null })
                    }
                    className={`border rounded px-2 py-1 ${
                      p.place
                        ? "bg-monad-primary/20 border-monad-primary text-white"
                        : "bg-white/5 border-white/10 text-white/70"
                    }`}
                  >
                    <option value="">—</option>
                    <option value="1">1er puesto</option>
                    <option value="2">2do puesto</option>
                    <option value="3">3er puesto</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="p-4 text-sm text-white/50">
            No hay proyectos de esta edición. Usa “Importar desde Blitz”.
          </p>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Posts ----------------------------- */

type Post = { id: string; url: string; label: string | null; sortOrder: number };

function Posts({ edition, canWrite }: { edition: EditionKey; canWrite: boolean }) {
  const { list, msg, run } = useList<Post>(`/api/admin/content/posts?edition=${edition}`);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const move = (i: number, dir: -1 | 1) => {
    const a = list[i];
    const b = list[i + dir];
    if (!a || !b) return;
    run(async () => {
      await api(`/api/admin/content/posts/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      });
      await api(`/api/admin/content/posts/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      });
    });
  };

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className={`${card} space-y-2`}>
          <p className="text-xs text-white/50">
            Pega el link de un tweet (se muestra embebido) o de otra publicación, como Instagram o
            LinkedIn (se muestra como tarjeta con link).
          </p>
          <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2">
            <input
              className={input}
              placeholder="https://x.com/MedellinBlock/status/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              className={input}
              placeholder="Título (ej. Recap, Ganadores)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <button
              disabled={!url.trim()}
              onClick={() =>
                run(async () => {
                  await api("/api/admin/content/posts", {
                    method: "POST",
                    body: JSON.stringify({ edition, url, label }),
                  });
                  setUrl("");
                  setLabel("");
                }, "Post agregado")
              }
              className={`${btn} bg-monad-primary text-white disabled:opacity-40`}
            >
              Agregar
            </button>
          </div>
        </div>
      )}
      {msg && <p className="text-sm text-monad-light">{msg}</p>}
      <div className="bg-white/5 border border-white/10 rounded-lg divide-y divide-white/10">
        {list.map((p, i) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
            <span className="w-6 text-white/40 font-mono">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <input
                key={p.label ?? ""}
                disabled={!canWrite}
                defaultValue={p.label ?? ""}
                placeholder="Sin título"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== (p.label ?? ""))
                    run(() =>
                      api(`/api/admin/content/posts/${p.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ label: v }),
                      })
                    );
                }}
                className="w-full bg-transparent text-white focus:outline-none"
              />
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-xs text-monad-light"
              >
                {p.url}
              </a>
            </div>
            {canWrite && (
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-white/60 disabled:opacity-20"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === list.length - 1}
                  className="text-white/60 disabled:opacity-20"
                >
                  ↓
                </button>
                <button
                  onClick={() =>
                    confirm("¿Quitar este post de la página?") &&
                    run(() => api(`/api/admin/content/posts/${p.id}`, { method: "DELETE" }))
                  }
                  className="text-red-400 hover:text-red-300"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <p className="p-4 text-sm text-white/50">Aún no hay posts de esta edición.</p>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Photos ----------------------------- */

type Photo = { id: string; src: string; alt: string | null; sortOrder: number };

/** Shrinks a photo in the browser so uploads stay small (longest side 1600 px, WebP). */
async function shrink(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  for (const q of [0.82, 0.7, 0.55]) {
    const dataUrl = canvas.toDataURL("image/webp", q);
    if (dataUrl.length * 0.75 < 1_400_000) return { dataUrl, width, height };
  }
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.6), width, height };
}

function Photos({ edition, canWrite }: { edition: EditionKey; canWrite: boolean }) {
  const { list, msg, setMsg, run } = useList<Photo>(`/api/admin/content/photos?edition=${edition}`);
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let done = 0;
    try {
      for (const file of Array.from(files)) {
        setMsg(`Subiendo ${done + 1} de ${files.length}...`);
        const img = await shrink(file);
        await api("/api/admin/content/photos", {
          method: "POST",
          body: JSON.stringify({ edition, ...img }),
        });
        done++;
      }
      await run(async () => undefined, `${done} fotos subidas`);
    } catch (e) {
      setMsg(`${done} subidas. Error: ${e instanceof Error ? e.message : "no se pudo subir"}`);
    } finally {
      setBusy(false);
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const a = list[i];
    const b = list[i + dir];
    if (!a || !b) return;
    run(async () => {
      await api(`/api/admin/content/photos/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      });
      await api(`/api/admin/content/photos/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      });
    });
  };

  return (
    <div className="space-y-4">
      {canWrite && (
        <div className={`${card} flex flex-wrap items-center gap-3`}>
          <p className="flex-1 min-w-[220px] text-xs text-white/50">
            Elige una o varias fotos. Se achican antes de subir (máx. 1600 px). Las primeras seis
            son las que más se ven.
            {edition === "v1" &&
              " Mientras V1 no tenga fotos aquí, la página muestra las seis que ya tenía."}
          </p>
          <label
            className={`${btn} bg-monad-primary text-white cursor-pointer ${busy ? "opacity-50" : ""}`}
          >
            {busy ? "Subiendo..." : "Subir fotos"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={busy}
              className="hidden"
              onChange={(e) => {
                upload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}
      {msg && <p className="text-sm text-monad-light">{msg}</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {list.map((p, i) => (
          <div key={p.id} className={`${card} p-2 space-y-2`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt={p.alt ?? ""}
              className="w-full aspect-[4/3] object-cover rounded"
            />
            <input
              key={p.alt ?? ""}
              disabled={!canWrite}
              defaultValue={p.alt ?? ""}
              placeholder="Descripción (para accesibilidad)"
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (p.alt ?? ""))
                  run(() =>
                    api(`/api/admin/content/photos/${p.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ alt: v }),
                    })
                  );
              }}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs"
            />
            {canWrite && (
              <div className="flex justify-between text-xs">
                <span className="space-x-2">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-white/60 disabled:opacity-20"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === list.length - 1}
                    className="text-white/60 disabled:opacity-20"
                  >
                    →
                  </button>
                </span>
                <button
                  onClick={() =>
                    confirm("¿Quitar esta foto?") &&
                    run(() => api(`/api/admin/content/photos/${p.id}`, { method: "DELETE" }))
                  }
                  className="text-red-400 hover:text-red-300"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-sm text-white/50">Aún no hay fotos de esta edición.</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { BlitzProjectCard } from "@/lib/blitz-v2-projects";

const EASING = [0.16, 1, 0.3, 1] as const;

const PLACE_LABEL: Record<1 | 2 | 3, string> = {
  1: "1er puesto",
  2: "2do puesto",
  3: "3er puesto",
};

const PLACE_STYLE: Record<1 | 2 | 3, string> = {
  1: "bg-monad-primary text-white",
  2: "bg-monad-primary/15 text-monad-primary",
  3: "bg-gray-100 text-gray-700",
};

function ProjectLinks({ p }: { p: BlitzProjectCard }) {
  const links: { href: string; label: string }[] = [];
  if (p.tweet) links.push({ href: p.tweet, label: p.tweet.includes("/status/") ? "Tweet" : "X" });
  if (p.demo) links.push({ href: p.demo, label: "Demo" });
  if (p.video) links.push({ href: p.video, label: "Video" });
  p.repos.forEach((href, i) =>
    links.push({ href, label: p.repos.length > 1 ? `Código ${i + 1}` : "Código" })
  );
  return (
    <div className="flex flex-wrap gap-2 mt-auto pt-4">
      {links.map((l) => (
        <a
          key={l.href + l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-full border border-gray-200 text-xs font-mono uppercase tracking-wide text-gray-700 hover:border-monad-primary hover:text-monad-primary transition-colors"
        >
          {l.label} ↗
        </a>
      ))}
    </div>
  );
}

function ProjectCard({ p, index }: { p: BlitzProjectCard; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const long = p.description.length > 220;
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05, ease: EASING }}
      className={`flex flex-col rounded-2xl border bg-white overflow-hidden ${
        p.place ? "border-monad-primary/40 shadow-sm" : "border-gray-200"
      }`}
    >
      {p.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image}
          alt={`Imagen del proyecto ${p.name}`}
          loading="lazy"
          className="w-full aspect-video object-cover bg-gray-100"
        />
      )}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold font-heading text-gray-900">{p.name}</h3>
          {p.place && (
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-mono uppercase ${PLACE_STYLE[p.place]}`}
            >
              {PLACE_LABEL[p.place]}
            </span>
          )}
        </div>
        {p.category && (
          <p className="text-[11px] font-mono uppercase tracking-wide text-gray-400 mt-1">
            {p.category}
          </p>
        )}
        {p.team.length > 0 && <p className="text-sm text-gray-600 mt-2">{p.team.join(", ")}</p>}
        {p.description && (
          <p
            className={`text-sm text-gray-500 mt-3 leading-relaxed break-words ${
              expanded ? "" : "line-clamp-4"
            }`}
          >
            {p.description}
          </p>
        )}
        {long && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="self-start text-xs text-monad-primary hover:underline mt-1"
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        )}
        <ProjectLinks p={p} />
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<BlitzProjectCard[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((j) => setProjects(j.data || []))
      .catch(() => setProjects([]));
  }, []);

  if (projects.length === 0) return null;
  const winners = projects.filter((p) => p.place);
  const others = projects.filter((p) => !p.place);
  const hasWinners = winners.length > 0;

  return (
    <section id="proyectos" className="py-16 sm:py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mb-10"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-500 mb-4">
            {"// PROYECTOS"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-gray-900 max-w-3xl">
            {hasWinners ? "Ganadores Blitz Medellín V2" : "Proyectos Blitz Medellín V2"}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-2xl leading-relaxed">
            {projects.length} proyectos construidos en Monad el 17 de octubre en Indie Universe.
            {hasWinners && " Así quedaron los ganadores según el jurado."}
          </p>
        </motion.div>

        {hasWinners && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((p, i) => (
                <ProjectCard key={p.id} p={p} index={i} />
              ))}
            </div>
            <h3 className="mt-14 mb-6 text-xl sm:text-2xl font-bold font-heading text-gray-900">
              Todos los proyectos
            </h3>
          </>
        )}
        {showAll || !hasWinners ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((p, i) => (
              <ProjectCard key={p.id} p={p} index={i} />
            ))}
          </div>
        ) : (
          <button
            onClick={() => setShowAll(true)}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full font-mono text-sm uppercase tracking-wide hover:bg-gray-50 transition-all"
          >
            Ver los otros {others.length} proyectos
          </button>
        )}
      </div>
    </section>
  );
}

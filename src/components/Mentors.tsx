"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TeamMemberCard, { type TeamMember } from "./TeamMemberCard";
import EditionTabs from "./EditionTabs";
import { DEFAULT_EDITION, editionInfo, type EditionKey } from "@/lib/editions";

const EASING = [0.16, 1, 0.3, 1] as const;

export default function Mentors() {
  const [edition, setEdition] = useState<EditionKey>(DEFAULT_EDITION);
  const [byEdition, setByEdition] = useState<Partial<Record<EditionKey, TeamMember[]>>>({});
  const members = byEdition[edition] ?? [];
  const loaded = edition in byEdition;

  useEffect(() => {
    if (loaded) return;
    fetch(`/api/team?edition=${edition}`)
      .then((r) => r.json())
      .then((j) => setByEdition((m) => ({ ...m, [edition]: j.data || [] })))
      .catch(() => setByEdition((m) => ({ ...m, [edition]: [] })));
  }, [edition, loaded]);

  // Hide the section only when the default edition has no team yet.
  if (edition === DEFAULT_EDITION && (!loaded || members.length === 0)) return null;

  const mentors = members.filter((m) => m.role === "mentor");
  const judges = members.filter((m) => m.role === "judge");
  const volunteers = members.filter((m) => m.role === "volunteer");

  return (
    <section className="py-16 sm:py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mb-12"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-500 mb-4">
            {"// EQUIPO"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-gray-900 max-w-2xl">
            Mentores, jurados y voluntarios
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl">
            Builders con experiencia real que te acompañan durante el Blitz y evalúan los proyectos,
            y el equipo de voluntarios que hace posible el día.
          </p>
          <div className="mt-6">
            <EditionTabs value={edition} onChange={setEdition} />
          </div>
        </motion.div>

        {loaded && members.length === 0 && (
          <p className="text-gray-500">
            Pronto publicamos el equipo de la edición del {editionInfo(edition).date}.
          </p>
        )}

        {mentors.length > 0 && <Group label="Mentores" members={mentors} />}

        {judges.length > 0 && (
          <div className="mt-14">
            <Group label="Jurados" members={judges} />
          </div>
        )}

        {volunteers.length > 0 && (
          <div className="mt-14">
            <Group label="Voluntarios" members={volunteers} compact />
          </div>
        )}

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASING }}
        >
          <Link
            href="/equipo"
            className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-6 py-2.5 text-[10px] sm:text-xs font-mono uppercase tracking-[2px] text-gray-500 hover:border-monad-primary hover:text-monad-primary hover:gap-3 transition-all duration-300"
          >
            Ver todo el equipo
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Group({
  label,
  members,
  compact = false,
}: {
  label: string;
  members: TeamMember[];
  compact?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-500 mb-6">
        {`// ${label.toUpperCase()} (${String(members.length).padStart(2, "0")})`}
      </p>
      <div
        className={
          compact
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        }
      >
        {members.map((m, i) => (
          <TeamMemberCard key={m.id} member={m} index={i} theme="light" compact={compact} />
        ))}
      </div>
    </div>
  );
}

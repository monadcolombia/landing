"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TeamMemberCard, { type TeamMember } from "./TeamMemberCard";

const EASING = [0.16, 1, 0.3, 1] as const;

export default function Mentors() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((j) => setMembers(j.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || members.length === 0) return null;

  const mentors = members.filter((m) => m.role === "mentor");
  const judges = members.filter((m) => m.role === "judge");

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
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-400 mb-4">
            {"// EQUIPO"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-gray-900 max-w-2xl">
            Mentores y jurados
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl">
            Builders con experiencia real que te acompañan durante el hack y evaluan los proyectos.
          </p>
        </motion.div>

        {mentors.length > 0 && <Group label="Mentores" members={mentors} />}

        {judges.length > 0 && (
          <div className="mt-14">
            <Group label="Jurados" members={judges} />
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

function Group({ label, members }: { label: string; members: TeamMember[] }) {
  return (
    <div>
      <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-400 mb-6">
        {`// ${label.toUpperCase()} (${String(members.length).padStart(2, "0")})`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <TeamMemberCard key={m.id} member={m} index={i} theme="light" />
        ))}
      </div>
    </div>
  );
}

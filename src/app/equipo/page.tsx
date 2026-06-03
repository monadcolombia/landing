"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ORGANIZERS } from "@/lib/organizers";
import OrganizerCard from "@/components/OrganizerCard";
import TeamMemberCard, { type TeamMember } from "@/components/TeamMemberCard";

const EASING = [0.16, 1, 0.3, 1] as const;

export default function EquipoPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((json) => setMembers(json.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const mentors = members.filter((m) => m.role === "mentor");
  const judges = members.filter((m) => m.role === "judge");

  return (
    <div className="min-h-screen bg-monad-dark py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-block text-sm text-white/50 hover:text-white font-mono mb-8 transition-colors"
        >
          &larr; Volver al inicio
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASING }}
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-white/40 mb-4">
            {"// EQUIPO"}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white mb-4">
            Equipo
          </h1>
          <p className="text-base sm:text-lg text-white/50 max-w-xl mb-12">
            Las personas que organizan, guían y evalúan los proyectos en MonadBlitz Colombia.
          </p>
        </motion.div>

        <div className="space-y-16">
          <Section title="Organizadores">
            {ORGANIZERS.map((o, i) => (
              <OrganizerCard key={o.name} organizer={o} index={i} theme="dark" />
            ))}
          </Section>

          {loading ? (
            <p className="text-white/50 text-center py-8">Cargando mentores y jurados...</p>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/50 text-lg mb-2">Pronto anunciaremos mentores y jurados</p>
              <p className="text-white/30 text-sm">
                Estamos revisando aplicaciones. Vuelve pronto.
              </p>
            </div>
          ) : (
            <>
              {mentors.length > 0 && (
                <Section title="Mentores">
                  {mentors.map((m, i) => (
                    <TeamMemberCard key={m.id} member={m} index={i} theme="dark" />
                  ))}
                </Section>
              )}
              {judges.length > 0 && (
                <Section title="Jurados">
                  {judges.map((m, i) => (
                    <TeamMemberCard key={m.id} member={m} index={i} theme="dark" />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-[3px] text-white/40 mb-6">
        {`// ${title.toUpperCase()}`}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

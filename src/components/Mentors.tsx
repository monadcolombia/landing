"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const EASING = [0.16, 1, 0.3, 1] as const;

type TeamMember = {
  id: string;
  role: "mentor" | "judge";
  fullName: string;
  city: string;
  mentorBio: string | null;
  mentorPrimarySkills: string[];
  judgeBio: string | null;
  judgeExpertiseAreas: string[];
  judgeCurrentRole: string | null;
  linkedin: string | null;
  twitter: string | null;
};

function twitterDisplay(raw: string | null): string | null {
  if (!raw) return null;
  const handle = raw
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "")
    .replace(/\/$/, "")
    .trim();
  return handle ? `@${handle}` : null;
}

function twitterHref(raw: string | null): string | null {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/, "").trim();
  return handle ? `https://x.com/${handle}` : null;
}

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
    <section id="equipo" className="py-16 sm:py-20 px-6 bg-white">
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
          <PersonCard key={m.id} member={m} index={i} />
        ))}
      </div>
    </div>
  );
}

function PersonCard({ member, index }: { member: TeamMember; index: number }) {
  const isMentor = member.role === "mentor";
  const bio = isMentor ? member.mentorBio : member.judgeBio;
  const tags = isMentor ? member.mentorPrimarySkills : member.judgeExpertiseAreas;
  const subtitle = !isMentor ? member.judgeCurrentRole : null;
  const xHref = twitterHref(member.twitter);
  const xLabel = twitterDisplay(member.twitter);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASING }}
      className="group p-5 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-bold text-gray-900 leading-tight">{member.fullName}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full bg-monad-primary/10 text-monad-primary border border-monad-primary/20 flex-shrink-0">
          {isMentor ? "Mentor" : "Jurado"}
        </span>
      </div>

      {bio && <p className="text-sm text-gray-500 mb-3 line-clamp-3">{bio}</p>}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-gray-500 border border-gray-200"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-auto pt-2 text-xs text-gray-400">
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-monad-primary transition-colors"
          >
            LinkedIn
          </a>
        )}
        {xHref && xLabel && (
          <a
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-monad-primary transition-colors"
          >
            {xLabel}
          </a>
        )}
        <span className="ml-auto capitalize text-gray-300">
          {member.city === "both" ? "Ambas ciudades" : member.city}
        </span>
      </div>
    </motion.article>
  );
}

"use client";

import { motion } from "framer-motion";
import MemberAvatar from "./MemberAvatar";

const EASING = [0.16, 1, 0.3, 1] as const;

export type TeamMember = {
  id: string;
  role: "mentor" | "judge" | "volunteer";
  fullName: string;
  city: string;
  edition: "v1" | "v2";
  mentorBio: string | null;
  mentorPrimarySkills: string[];
  judgeBio: string | null;
  judgeExpertiseAreas: string[];
  judgeCurrentRole: string | null;
  linkedin: string | null;
  twitter: string | null;
};

export type Theme = "light" | "dark";

const STYLES: Record<Theme, Record<string, string>> = {
  light: {
    card: "border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-200 hover:shadow-sm",
    avatarRing: "ring-gray-200 bg-gray-100",
    name: "text-gray-900",
    subtitle: "text-gray-400",
    bio: "text-gray-500",
    tag: "bg-white text-gray-500 border-gray-200",
    link: "text-gray-400 hover:text-monad-primary",
    city: "text-gray-300",
  },
  dark: {
    card: "border-white/10 bg-white/5",
    avatarRing: "ring-white/10 bg-white/5",
    name: "text-white",
    subtitle: "text-white/40",
    bio: "text-white/60",
    tag: "bg-white/5 text-white/40 border-white/10",
    link: "text-white/30 hover:text-white/60",
    city: "text-white/30",
  },
};

function twitterHandle(raw: string | null): string | null {
  if (!raw) return null;
  const handle = raw
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "")
    .replace(/\/$/, "")
    .trim();
  return handle || null;
}

type Props = {
  member: TeamMember;
  index: number;
  theme: Theme;
  /** Smaller card with only photo, name and links. Used for volunteers. */
  compact?: boolean;
};

export default function TeamMemberCard({ member, index, theme, compact = false }: Props) {
  const s = STYLES[theme];
  const isMentor = member.role === "mentor";
  const isJudge = member.role === "judge";
  const bio = compact ? null : isMentor ? member.mentorBio : isJudge ? member.judgeBio : null;
  const tags = compact
    ? []
    : isMentor
      ? member.mentorPrimarySkills
      : isJudge
        ? member.judgeExpertiseAreas
        : [];
  const subtitle = isJudge && !compact ? member.judgeCurrentRole : null;
  const handle = twitterHandle(member.twitter);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASING }}
      className={`group ${compact ? "p-4" : "p-5"} rounded-xl border ${s.card} transition-all duration-300 flex flex-col items-center text-center`}
    >
      <MemberAvatar
        id={member.id}
        name={member.fullName}
        sizeClass={compact ? "w-14 h-14 text-sm" : "w-20 h-20 text-lg"}
        ringClass={s.avatarRing}
      />

      <h3
        className={`font-heading font-bold leading-tight mb-1 ${compact ? "text-sm" : ""} ${s.name}`}
      >
        {member.fullName}
      </h3>

      {subtitle && <p className={`text-xs mb-3 truncate max-w-full ${s.subtitle}`}>{subtitle}</p>}

      {bio && <p className={`text-sm mb-3 line-clamp-3 ${s.bio}`}>{bio}</p>}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          {tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${s.tag}`}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div
        className={`flex flex-wrap items-center justify-center gap-3 mt-auto pt-2 text-xs ${s.link}`}
      >
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
          >
            LinkedIn
          </a>
        )}
        {handle && (
          <a
            href={`https://x.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
          >
            @{handle}
          </a>
        )}
        {!compact && (
          <span className={`capitalize ${s.city}`}>
            {member.edition === "v1" ? "V1" : "V2"}
            {" · "}
            {member.city === "both" ? "Ambas ciudades" : member.city}
          </span>
        )}
      </div>
    </motion.article>
  );
}

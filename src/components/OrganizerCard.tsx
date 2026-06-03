"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Organizer } from "@/lib/organizers";

const EASING = [0.16, 1, 0.3, 1] as const;

export type Theme = "light" | "dark";

const STYLES: Record<Theme, Record<string, string>> = {
  light: {
    card: "border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-200 hover:shadow-sm",
    avatarRing: "ring-gray-200",
    name: "text-gray-900",
    role: "text-gray-500",
    link: "text-gray-400 hover:text-monad-primary",
  },
  dark: {
    card: "border-white/10 bg-white/5",
    avatarRing: "ring-white/10",
    name: "text-white",
    role: "text-white/60",
    link: "text-white/30 hover:text-white/60",
  },
};

function twitterHandle(raw: string | undefined): string | null {
  if (!raw) return null;
  const handle = raw
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "")
    .replace(/\/$/, "")
    .trim();
  return handle || null;
}

type Props = {
  organizer: Organizer;
  index: number;
  theme: Theme;
};

export default function OrganizerCard({ organizer, index, theme }: Props) {
  const s = STYLES[theme];
  const { name, role, image, twitter, linkedin, website } = organizer;
  const handle = twitterHandle(twitter);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASING }}
      className={`group p-5 rounded-xl border ${s.card} transition-all duration-300 flex flex-col items-center text-center`}
    >
      <Image
        src={image}
        alt={name}
        width={96}
        height={96}
        className={`w-20 h-20 rounded-full object-cover mb-3 ring-1 ${s.avatarRing}`}
      />
      <h3 className={`font-heading font-bold leading-tight mb-1 ${s.name}`}>{name}</h3>
      <p className={`text-sm mb-3 ${s.role}`}>{role}</p>

      {(website || linkedin || handle) && (
        <div
          className={`flex flex-wrap items-center justify-center gap-3 mt-auto pt-2 text-xs ${s.link}`}
        >
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
            >
              Web
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
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
        </div>
      )}
    </motion.article>
  );
}

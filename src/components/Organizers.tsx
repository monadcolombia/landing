"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ORGANIZERS, type Organizer } from "@/lib/organizers";

const EASING = [0.16, 1, 0.3, 1] as const;

export default function Organizers() {
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
            Equipo organizador
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl">
            Las personas y organizaciones que hacen posible MonadBlitz Colombia.
          </p>
        </motion.div>

        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-400 mb-6">
          {`// ORGANIZADORES (${String(ORGANIZERS.length).padStart(2, "0")})`}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ORGANIZERS.map((o, i) => (
            <OrganizerCard key={o.name} organizer={o} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OrganizerCard({ organizer, index }: { organizer: Organizer; index: number }) {
  const { name, role, image, twitter, linkedin, website } = organizer;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASING }}
      className="group p-5 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300 flex flex-col items-center text-center"
    >
      <Image
        src={image}
        alt={name}
        width={96}
        height={96}
        className="w-20 h-20 rounded-full object-cover mb-4 ring-1 ring-gray-200"
      />
      <h3 className="font-heading font-bold text-gray-900 leading-tight mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-3">{role}</p>

      {(twitter || linkedin || website) && (
        <div className="flex items-center gap-3 mt-auto pt-2 text-xs text-gray-400">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-monad-primary transition-colors"
            >
              Web
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-monad-primary transition-colors"
            >
              LinkedIn
            </a>
          )}
          {twitter && (
            <a
              href={
                twitter.startsWith("http") ? twitter : `https://x.com/${twitter.replace(/^@/, "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-monad-primary transition-colors"
            >
              @
              {twitter
                .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "")
                .replace(/^@/, "")
                .replace(/\/$/, "")}
            </a>
          )}
        </div>
      )}
    </motion.article>
  );
}

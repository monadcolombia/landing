"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ORGANIZERS_BY_EDITION } from "@/lib/organizers";
import { DEFAULT_EDITION, type EditionKey } from "@/lib/editions";
import OrganizerCard from "./OrganizerCard";
import EditionTabs from "./EditionTabs";

const EASING = [0.16, 1, 0.3, 1] as const;

export default function Organizers() {
  const [edition, setEdition] = useState<EditionKey>(DEFAULT_EDITION);
  const organizers = ORGANIZERS_BY_EDITION[edition];
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
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-500 mb-4">
            {"// EQUIPO"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-gray-900 max-w-2xl">
            Equipo organizador
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl">
            Las personas y organizaciones que hacen posible MonadBlitz Colombia.
          </p>
          <div className="mt-6">
            <EditionTabs value={edition} onChange={setEdition} />
          </div>
        </motion.div>

        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-500 mb-6">
          {`// ORGANIZADORES (${String(organizers.length).padStart(2, "0")})`}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizers.map((o, i) => (
            <OrganizerCard key={`${edition}-${o.name}`} organizer={o} index={i} theme="light" />
          ))}
        </div>
      </div>
    </section>
  );
}

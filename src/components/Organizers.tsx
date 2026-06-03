"use client";

import { motion } from "framer-motion";
import { ORGANIZERS } from "@/lib/organizers";
import OrganizerCard from "./OrganizerCard";

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
            <OrganizerCard key={o.name} organizer={o} index={i} theme="light" />
          ))}
        </div>
      </div>
    </section>
  );
}

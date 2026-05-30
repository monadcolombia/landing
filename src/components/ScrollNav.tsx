"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const sections = [
  { id: "hero", label: "Inicio" },
  { id: "countdown", label: "Countdown" },
  { id: "stats", label: "Stats" },
  { id: "eventos", label: "Eventos" },
  { id: "agenda", label: "Agenda" },
  { id: "equipo", label: "Equipo" },
  { id: "construir", label: "Construir" },
  { id: "aliados", label: "Aliados" },
  { id: "galeria", label: "Galería" },
  { id: "faq", label: "FAQ" },
  { id: "explorar", label: "Explorar" },
];

// Sections with dark backgrounds
const darkSections = new Set(["hero", "eventos", "aliados", "galeria", "highlights"]);

export default function ScrollNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const [visible, setVisible] = useState(false);

  const isDark = darkSections.has(activeSection);

  useEffect(() => {
    // Delayed entrance
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.2 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <motion.nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {sections.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            className="group relative flex items-center justify-center p-1"
            aria-label={label}
            aria-current={isActive ? "true" : undefined}
          >
            {/* Tooltip */}
            <motion.span
              className={`absolute right-10 text-xs font-mono whitespace-nowrap px-2.5 py-1 rounded-md pointer-events-none ${
                isDark
                  ? "bg-white/10 backdrop-blur-sm text-white/80 border border-white/10"
                  : "bg-white text-gray-600 shadow-sm border border-gray-100"
              }`}
              initial={{ opacity: 0, x: 4 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ opacity: 0 }}
            >
              {label}
            </motion.span>

            {/* Dot indicator */}
            <motion.span
              className="block rounded-full"
              animate={{
                width: isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                backgroundColor: isActive
                  ? "#6E54FF"
                  : isDark
                    ? "rgba(255, 255, 255, 0.25)"
                    : "rgba(0, 0, 0, 0.15)",
                boxShadow: isActive ? "0 0 12px rgba(110, 84, 255, 0.4)" : "none",
              }}
              whileHover={{
                scale: 1.4,
                backgroundColor: "#6E54FF",
              }}
              transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 20 }}
            />
          </a>
        );
      })}
    </motion.nav>
  );
}

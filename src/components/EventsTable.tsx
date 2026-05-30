"use client";

import { motion } from "framer-motion";
import { CITIES } from "@/lib/constants";
import ConcentricCircles from "./ConcentricCircles";

const EASING = [0.16, 1, 0.3, 1] as const;

export default function EventsTable() {
  return (
    <section id="eventos" className="py-16 sm:py-20 px-6 bg-monad-dark relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -bottom-[15%] -left-[10%] pointer-events-none opacity-30">
        <ConcentricCircles size={450} dark />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mb-16"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-white/40 mb-4">
            {"// EVENTOS"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white max-w-3xl">
            La comunidad Monad está onchain - y en persona.
          </h2>
          <p className="text-base sm:text-lg text-white/50 mt-4 max-w-xl">
            Hackathons MonadBlitz en Medellín y Bogotá. Encuentra el evento más cercano.
          </p>
        </motion.div>

        {/* Event rows */}
        <div>
          {CITIES.map((city, i) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: EASING,
              }}
              className="event-row border-t border-white/10 py-5 sm:py-6 px-2 sm:px-4 rounded-lg transition-all duration-300"
            >
              {/* Desktop layout */}
              <div className="hidden sm:grid grid-cols-[140px_1fr_1fr_auto] gap-4 items-center">
                {/* Date */}
                <span className="text-sm font-mono text-white/50">
                  {city.confirmed ? city.date : "Próximamente"}
                </span>

                {/* City name + venue */}
                <div className="flex items-center gap-3">
                  {city.confirmed && (
                    <span className="w-2 h-2 rounded-full bg-monad-primary animate-pulse-glow flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-lg font-heading font-bold text-white block leading-tight">
                      {city.name}
                    </span>
                    {city.venue && city.venueUrl ? (
                      <a
                        href={city.venueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-white/40 hover:text-monad-primary transition-colors mt-1"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8 4.5 8s4.5-4.5 4.5-8c0-2.5-2-4.5-4.5-4.5z"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                          />
                          <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                        {city.venue}
                      </a>
                    ) : city.venue ? (
                      <span className="text-xs font-mono text-white/40 block mt-1">
                        {city.venue}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Event type */}
                <span className="text-sm font-mono text-white/30">
                  {city.eventType || "MonadBlitz Hackathon"}
                </span>

                {/* CTA */}
                {city.confirmed ? (
                  <a
                    href={city.registrationUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-monad-primary text-monad-primary rounded-full px-5 py-2 text-[10px] sm:text-xs font-mono uppercase tracking-[2px] hover:bg-monad-primary hover:text-white hover:gap-3 transition-all duration-300"
                  >
                    Regístrate
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                ) : (
                  <span className="inline-flex items-center border border-white/15 text-white/30 rounded-full px-5 py-2 text-[10px] sm:text-xs font-mono uppercase tracking-[2px]">
                    Próximamente
                  </span>
                )}
              </div>

              {/* Mobile layout */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {city.confirmed && (
                      <span className="w-2 h-2 rounded-full bg-monad-primary animate-pulse-glow flex-shrink-0" />
                    )}
                    <span className="text-lg font-heading font-bold text-white">{city.name}</span>
                  </div>
                  <span className="text-xs font-mono text-white/40">
                    {city.confirmed ? city.date : "Próximamente"}
                  </span>
                </div>
                {city.venue && city.venueUrl ? (
                  <a
                    href={city.venueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-white/40 hover:text-monad-primary transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8 4.5 8s4.5-4.5 4.5-8c0-2.5-2-4.5-4.5-4.5z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                      <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    {city.venue}
                  </a>
                ) : city.venue ? (
                  <span className="text-xs font-mono text-white/40 block">{city.venue}</span>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/30">
                    {city.eventType || "MonadBlitz Hackathon"}
                  </span>
                  {city.confirmed && (
                    <a
                      href={city.registrationUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-monad-primary uppercase tracking-wider"
                    >
                      Regístrate
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Bottom border */}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  );
}

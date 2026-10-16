"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import ConcentricCircles from "./ConcentricCircles";

/* Deterministic pseudo-random for SSR consistency */
function seeded(seed: number): number {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

/* Pre-compute bar heights - wave pattern peaking at ~70% */
const BAR_COUNT = 70;
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const x = i / BAR_COUNT;
  const peak = 0.68;
  const gaussian = Math.exp(-Math.pow(x - peak, 2) / (2 * 0.08));
  const noise = seeded(i * 127.1 + 311.7);
  return Math.max(0.04, Math.min(1, gaussian * 0.55 + noise * 0.45));
});

const LINE_X = (0.68 * 100).toFixed(1);
const EASING = [0.16, 1, 0.3, 1] as const;

/* ---- Stat sub-components ---- */

interface StatProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
  compact?: boolean;
}

function StatCounter({ value, suffix = "", label, delay = 0, compact = false }: StatProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const t = setTimeout(() => {
      const ctrl = animate(mv, value, {
        duration: 2,
        ease: EASING,
        onUpdate: (v) => setDisplay(Math.round(v)),
      });
      return ctrl.stop;
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [isInView, mv, value, delay]);

  return (
    <motion.div
      ref={ref}
      className={compact ? "px-6 py-5" : ""}
      initial={{ opacity: 0, y: compact ? 15 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: compact ? 0.5 : 0.6, delay, ease: EASING }}
    >
      <div className="flex items-baseline gap-0.5">
        <span
          className={`font-extrabold text-gray-900 font-heading tabular-nums ${
            compact ? "text-3xl xl:text-4xl" : "text-4xl sm:text-5xl lg:text-6xl"
          }`}
        >
          {display.toLocaleString()}
        </span>
        {suffix && (
          <span
            className={`font-bold text-gray-700 font-heading ${
              compact ? "text-2xl xl:text-3xl" : "text-3xl sm:text-4xl lg:text-5xl"
            }`}
          >
            {suffix}
          </span>
        )}
      </div>
      <p
        className={`font-mono uppercase text-gray-400 ${
          compact
            ? "text-[10px] tracking-[2px] mt-1.5"
            : "text-[10px] sm:text-xs tracking-[3px] mt-2"
        }`}
      >
        {label}
      </p>
    </motion.div>
  );
}

function FixedStat({
  value,
  label,
  delay = 0,
  compact = false,
}: {
  value: string;
  label: string;
  delay?: number;
  compact?: boolean;
}) {
  return (
    <motion.div
      className={compact ? "px-6 py-5" : ""}
      initial={{ opacity: 0, y: compact ? 15 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: compact ? 0.5 : 0.6, delay, ease: EASING }}
    >
      <span
        className={`font-extrabold text-gray-900 font-heading ${
          compact ? "text-3xl xl:text-4xl" : "text-4xl sm:text-5xl lg:text-6xl"
        }`}
      >
        {value}
      </span>
      <p
        className={`font-mono uppercase text-gray-400 ${
          compact
            ? "text-[10px] tracking-[2px] mt-1.5"
            : "text-[10px] sm:text-xs tracking-[3px] mt-2"
        }`}
      >
        {label}
      </p>
    </motion.div>
  );
}

/* ---- Main section ---- */

export default function Stats() {
  return (
    <section id="stats" className="relative pt-14 sm:pt-20 pb-0 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          {/* Left: Heading + description + CTA */}
          <div className="flex-1 min-w-0">
            <motion.p
              className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-500 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASING }}
            >
              {"// RENDIMIENTO"}
            </motion.p>

            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-gray-900 max-w-2xl mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASING }}
            >
              Monad desbloquea una nueva era de rendimiento EVM.
            </motion.h2>

            <motion.p
              className="text-base lg:text-lg text-gray-500 max-w-xl leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASING }}
            >
              Habilitando productos que el EVM nunca antes ha visto.
            </motion.p>

            {/* Mobile stats grid */}
            <div className="grid grid-cols-2 gap-y-8 gap-x-6 sm:gap-x-12 mb-10 lg:hidden">
              <StatCounter value={10000} label="Transacciones por segundo" delay={0} />
              <StatCounter value={100} suffix="%" label="Compatible con EVM" delay={0.1} />
              <FixedStat value="0.8s" label="Finalidad" delay={0.2} />
              <FixedStat value="0.4s" label="Tiempo de bloque" delay={0.3} />
            </div>

            {/* CTA */}
            <motion.a
              href="https://docs.monad.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-6 py-2.5 text-[10px] sm:text-xs font-mono uppercase tracking-[2px] text-gray-500 hover:border-monad-primary hover:text-monad-primary hover:gap-3 transition-all duration-300"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Conoce el rendimiento de Monad
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
          </div>

          {/* Stats panel moved to EventsTable section */}
        </div>
      </div>

      {/* Throughput visualization */}
      <div className="max-w-7xl mx-auto mt-16 sm:mt-20 relative">
        {/* Concentric circles - center dot at the top of the vertical line */}
        <div
          className="absolute pointer-events-none z-0"
          style={{
            left: `${LINE_X}%`,
            top: "-100px",
            transform: "translate(-50%, -50%)",
          }}
        >
          <ConcentricCircles size={220} />
        </div>

        {/* Vertical connecting line */}
        <motion.div
          className="absolute bg-gray-900 w-px z-10"
          style={{
            left: `${LINE_X}%`,
            top: "-100px",
            bottom: "0",
            transformOrigin: "top",
          }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASING }}
        />

        {/* Bar chart */}
        <div className="flex items-end gap-[2px] h-[120px] sm:h-[180px] lg:h-[220px]">
          {BAR_HEIGHTS.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gray-200/80 rounded-t-[1px]"
              style={{ height: `${(h * 100).toFixed(2)}%`, transformOrigin: "bottom" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.4 + i * 0.008,
                ease: EASING,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom border */}
      <div className="border-b border-gray-100 mt-0" />
    </section>
  );
}

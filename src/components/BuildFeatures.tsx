"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

/* ─── Types ─── */
interface Position {
  x: number;
  y: number;
}

/* ─── Card config ─── */
const CARDS = [
  { number: "001", label: "PERFORMANCE" },
  { number: "002", label: "DECENTRALIZATION" },
  { number: "003", label: "COMMUNITY" },
] as const;

type CardNumber = (typeof CARDS)[number]["number"];

/* ─── Polygon helper ─── */
function regularPolygon(cx: number, cy: number, r: number, sides: number, rotDeg = 0): string {
  const rot = (rotDeg * Math.PI) / 180;
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2 + rot;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
}

/* ─── Parallax easing ─── */
const EASE = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";

function layer(pos: Position, intensity: number) {
  return {
    transform: `translate(${pos.x * intensity}px, ${pos.y * intensity}px)`,
    transition: EASE,
  } as const;
}

/* ─── SVG Card Illustrations ─── */

function PerformanceSVG({ pos }: { pos: Position }) {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <radialGradient id="perf-grad" cx="42%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#e0e060" stopOpacity="0.6" />
          <stop offset="30%" stopColor="#90e0c0" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#80ccf0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#c0b0e8" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Soft gradient blob */}
      <ellipse cx="200" cy="210" rx="150" ry="140" fill="url(#perf-grad)" />

      {/* Dashed square */}
      <g style={layer(pos, 8)}>
        <rect
          x="85"
          y="95"
          width="230"
          height="220"
          fill="none"
          stroke="#222"
          strokeWidth="1.2"
          strokeDasharray="14 10"
        />
      </g>

      {/* Diamond (45deg rotated square) */}
      <g style={layer(pos, 18)}>
        <polygon points="200,72 328,205 200,338 72,205" fill="none" stroke="#222" strokeWidth="1" />
      </g>

      {/* Inner small rectangle */}
      <g style={layer(pos, 28)}>
        <rect x="142" y="145" width="116" height="120" fill="none" stroke="#222" strokeWidth="1" />
      </g>
    </svg>
  );
}

function DecentralizationSVG({ pos }: { pos: Position }) {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <linearGradient id="dec-grad" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#b0a0d8" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#88b0f0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#78c8f0" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Gradient blob */}
      <ellipse cx="200" cy="205" rx="150" ry="145" fill="url(#dec-grad)" />

      {/* Outer octagon 1 */}
      <g style={layer(pos, 8)}>
        <polygon
          points={regularPolygon(200, 205, 160, 8, -8)}
          fill="none"
          stroke="#222"
          strokeWidth="1"
        />
      </g>

      {/* Outer octagon 2 (offset rotation) */}
      <g style={layer(pos, 16)}>
        <polygon
          points={regularPolygon(200, 205, 152, 8, 16)}
          fill="none"
          stroke="#222"
          strokeWidth="1"
        />
      </g>

      {/* Inner dashed octagon */}
      <g style={layer(pos, 26)}>
        <polygon
          points={regularPolygon(200, 205, 115, 8, 5)}
          fill="none"
          stroke="#222"
          strokeWidth="1.2"
          strokeDasharray="14 10"
        />
      </g>
    </svg>
  );
}

function CommunitySVG({ pos }: { pos: Position }) {
  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <radialGradient id="comm-grad" cx="38%" cy="42%" r="42%">
          <stop offset="0%" stopColor="#f0b870" stopOpacity="0.65" />
          <stop offset="35%" stopColor="#e898b0" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#d090d0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#c0a0e0" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Gradient blob */}
      <ellipse cx="200" cy="200" rx="148" ry="145" fill="url(#comm-grad)" />

      {/* Outer circle */}
      <g style={layer(pos, 8)}>
        <circle cx="200" cy="200" r="140" fill="none" stroke="#222" strokeWidth="1" />
      </g>

      {/* Saturn ring (tilted ellipse) */}
      <g style={layer(pos, 18)}>
        <ellipse
          cx="200"
          cy="220"
          rx="190"
          ry="35"
          fill="none"
          stroke="#222"
          strokeWidth="1"
          transform="rotate(-15, 200, 220)"
        />
      </g>

      {/* Inner dashed circle */}
      <g style={layer(pos, 26)}>
        <circle
          cx="200"
          cy="200"
          r="85"
          fill="none"
          stroke="#222"
          strokeWidth="1.2"
          strokeDasharray="12 8"
        />
      </g>
    </svg>
  );
}

/* ─── Illustration lookup ─── */
const ILLUSTRATIONS: Record<CardNumber, React.FC<{ pos: Position }>> = {
  "001": PerformanceSVG,
  "002": DecentralizationSVG,
  "003": CommunitySVG,
};

/* ─── Feature Card ─── */
function FeatureCard({
  number,
  label,
  index,
}: {
  number: CardNumber;
  label: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  }, []);

  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);

  const Illustration = ILLUSTRATIONS[number];

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.25, delay: 0, ease: [0.16, 1, 0.3, 1] },
      }}
      className="relative aspect-[4/5] overflow-hidden cursor-default select-none transition-shadow duration-300 ring-1 ring-transparent hover:ring-gray-200 hover:shadow-xl hover:shadow-black/10"
      style={{
        backgroundImage: "radial-gradient(circle, #c8c8c8 0.7px, transparent 0.7px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-6 h-6 border-l-[1.5px] border-t-[1.5px] border-gray-800" />
      <div className="absolute top-4 right-4 w-6 h-6 border-r-[1.5px] border-t-[1.5px] border-gray-800" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-l-[1.5px] border-b-[1.5px] border-gray-800" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-r-[1.5px] border-b-[1.5px] border-gray-800" />

      {/* Number label - top right */}
      <span className="absolute top-5 right-14 text-[11px] font-mono text-gray-800 tracking-wider">
        {"// "}
        {number}
      </span>

      {/* Category label - bottom left */}
      <span className="absolute bottom-5 left-14 text-[11px] font-mono text-gray-800 tracking-wider">
        {"// "}
        {label}
      </span>

      {/* SVG illustration */}
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
        <Illustration pos={pos} />
      </div>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export default function BuildFeatures() {
  return (
    <section id="construir" className="py-16 sm:py-20 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-block mb-6"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="h-px w-16 bg-monad-primary mx-auto" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 font-heading text-gray-900">
            Construye sin límites
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Escala sin compromisos. Monad combina rendimiento extremo con total compatibilidad EVM y
            una comunidad global de builders.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <FeatureCard key={card.number} number={card.number} label={card.label} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a
            href="https://docs.monad.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-6 py-2.5 text-[10px] sm:text-xs font-mono uppercase tracking-[2px] text-gray-500 hover:border-monad-primary hover:text-monad-primary hover:gap-3 transition-all duration-300"
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
          </a>
        </motion.div>
      </div>
    </section>
  );
}

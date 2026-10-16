"use client";

import { motion } from "framer-motion";

const EASING = [0.16, 1, 0.3, 1] as const;

const CARDS = [
  {
    title: "Explora el Ecosistema",
    description: "Descubre apps en vivo, protocolos y oportunidades en Monad.",
    cta: "Explorar",
    href: "https://app.monad.xyz/",
    gradient: "linear-gradient(135deg, #6E54FF 0%, #85E6FF 100%)",
  },
  {
    title: "Empieza a Construir",
    description: "Programas, recursos y comunidad para fundadores y developers.",
    cta: "Construir",
    href: "https://www.monad.xyz/build",
    gradient: "linear-gradient(135deg, #FF8EE4 0%, #FFAE45 100%)",
  },
];

export default function ExploreCards() {
  return (
    <section id="explorar" className="py-16 sm:py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mb-12"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-500 mb-4">
            {"// EXPLORAR"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-gray-900 max-w-2xl">
            Explora el mundo onchain en Monad
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARDS.map((card, i) => (
            <motion.a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                ease: EASING,
              }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative h-[280px] sm:h-[320px] lg:h-[360px] rounded-xl overflow-hidden cursor-pointer group transition-shadow duration-300 hover:shadow-xl hover:shadow-black/20"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 0.7px, transparent 0.7px), ${card.gradient}`,
                backgroundSize: "20px 20px, 100% 100%",
              }}
            >
              {/* Corner brackets (white) */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-[1.5px] border-t-[1.5px] border-white/40" />
              <div className="absolute top-4 right-4 w-6 h-6 border-r-[1.5px] border-t-[1.5px] border-white/40" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-[1.5px] border-b-[1.5px] border-white/40" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-[1.5px] border-b-[1.5px] border-white/40" />

              {/* Content - bottom left */}
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-white/70 mb-4 max-w-sm">{card.description}</p>
                <span className="inline-flex items-center border border-white/30 text-white rounded-full px-5 py-2 text-[10px] sm:text-xs font-mono uppercase tracking-[2px] group-hover:border-white group-hover:bg-white/10 transition-colors">
                  {card.cta}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

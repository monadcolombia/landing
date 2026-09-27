"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PARTNER_CATEGORIES, PAST_PARTNERS } from "@/lib/constants";
import type { PartnerCategory } from "@/lib/types";

const EASING = [0.16, 1, 0.3, 1] as const;

function PartnerRow({
  category,
  compact = false,
}: {
  category: PartnerCategory;
  compact?: boolean;
}) {
  const items = [...category.partners, ...category.partners, ...category.partners];
  const slot = compact ? "w-[120px] sm:w-[140px]" : "w-[150px] sm:w-[190px]";
  const logo = compact
    ? "h-5 sm:h-6 max-w-[100px] sm:max-w-[120px]"
    : "h-8 sm:h-10 max-w-[140px] sm:max-w-[180px]";

  return (
    <div>
      <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-white/40 text-center mb-1">
        {`// ${category.title}`}
      </p>
      {category.subtitle && (
        <p className="text-xs text-white/30 text-center mb-4 px-4">{category.subtitle}</p>
      )}
      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="marquee-track flex items-center gap-10 sm:gap-16 w-max" aria-hidden="true">
          {items.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className={`flex items-center justify-center px-4 sm:px-6 flex-shrink-0 ${slot}`}
            >
              {partner.logo ? (
                <div className={`flex items-center gap-2.5 justify-center ${slot}`}>
                  <Image
                    src={partner.logo}
                    alt=""
                    width={180}
                    height={40}
                    className={`${logo} w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 brightness-0 invert`}
                  />
                  {partner.logo.includes("ultravioleta") && (
                    <span className="text-xs font-heading font-bold text-white/50 whitespace-nowrap">
                      {partner.name}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm sm:text-base font-heading font-extrabold text-white/50 whitespace-nowrap tracking-tight">
                  {partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section id="aliados" className="py-16 sm:py-20 bg-monad-dark overflow-hidden">
      <div className="flex flex-col gap-14 sm:gap-20">
        {PARTNER_CATEGORIES.map((category, catIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: catIndex * 0.1, ease: EASING }}
          >
            <PartnerRow category={category} />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASING }}
          className="border-t border-white/10 pt-12 sm:pt-16"
        >
          <PartnerRow category={PAST_PARTNERS} compact />
        </motion.div>
      </div>
    </section>
  );
}

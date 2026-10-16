"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQ_ITEMS } from "@/lib/constants";

const EASING = [0.16, 1, 0.3, 1] as const;

function FAQAccordion({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASING }}
      className="border-b border-gray-100"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 sm:py-6 text-left group"
        aria-expanded={open}
      >
        <span className="text-base sm:text-lg font-heading font-semibold text-gray-900 pr-8 group-hover:text-monad-primary transition-colors">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 group-hover:border-monad-primary/30 transition-colors"
        >
          <svg
            className="w-3 h-3 text-gray-400 group-hover:text-monad-primary transition-colors"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASING }}
            className="overflow-hidden"
          >
            <p className="text-sm sm:text-base text-gray-500 pb-6 pr-12 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="py-16 sm:py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="text-center mb-12"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-500 mb-4">
            {"// FAQ"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-gray-900">
            Preguntas frecuentes
          </h2>
        </motion.div>

        {/* Accordion list */}
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FAQAccordion key={i} question={item.question} answer={item.answer} index={i} />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10"
        >
          <p className="text-sm text-gray-400 mb-3">¿Tienes otra pregunta?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://chat.whatsapp.com/JboPU2owNWU7ysj5TEvgyO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-6 py-2.5 text-[10px] sm:text-xs font-mono uppercase tracking-[2px] text-gray-500 hover:border-monad-primary hover:text-monad-primary transition-all duration-300"
            >
              Pregúntanos en WhatsApp
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
            <a
              href="https://t.me/monadcolombia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-6 py-2.5 text-[10px] sm:text-xs font-mono uppercase tracking-[2px] text-gray-500 hover:border-monad-primary hover:text-monad-primary transition-all duration-300"
            >
              O en Telegram
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}

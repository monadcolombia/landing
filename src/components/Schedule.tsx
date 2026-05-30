"use client";

import { motion } from "framer-motion";
import ConcentricCircles from "./ConcentricCircles";

const EASING = [0.16, 1, 0.3, 1] as const;

type ScheduleItem =
  | { type: "range"; start: string; end: string; title: string; description?: string }
  | { type: "milestone"; start: string; title: string; description?: string };

const SCHEDULE: ScheduleItem[] = [
  {
    type: "range",
    start: "09:00",
    end: "10:00",
    title: "Apertura de puertas",
    description: "Preregistro y bienvenida",
  },
  {
    type: "range",
    start: "10:00",
    end: "10:30",
    title: "Apertura oficial",
    description: "Bienvenida, reglas y Monad 101",
  },
  {
    type: "range",
    start: "10:30",
    end: "11:00",
    title: "Formacion de equipos",
    description: "Arma tu squad",
  },
  {
    type: "milestone",
    start: "11:00",
    title: "Inicio del hackathon",
    description: "Empieza el reloj. Nada en GitHub antes de esta hora",
  },
  { type: "range", start: "11:00", end: "13:00", title: "Hacking" },
  { type: "range", start: "13:00", end: "14:00", title: "Almuerzo" },
  { type: "range", start: "14:00", end: "18:00", title: "Hacking" },
  {
    type: "milestone",
    start: "18:00",
    title: "Code freeze",
    description: "No mas cambios en GitHub",
  },
  {
    type: "range",
    start: "18:00",
    end: "18:30",
    title: "Submissions",
    description: "Subida final del proyecto en la app",
  },
  {
    type: "milestone",
    start: "18:30",
    title: "Deadline",
    description: "Cierre de envios",
  },
  {
    type: "range",
    start: "19:00",
    end: "21:00",
    title: "Demos y showcase",
    description: "Presenta tu proyecto",
  },
  {
    type: "range",
    start: "21:00",
    end: "22:00",
    title: "Break + deliberacion del jurado",
  },
  {
    type: "milestone",
    start: "22:00",
    title: "Premiacion y cierre",
    description: "Anuncio de ganadores",
  },
];

const ALL_DAY = [
  { name: "Snacks", time: "10:00 - 13:00 y 14:00 - 18:00" },
  { name: "Cena", time: "18:00 - 20:00, simultanea con demos" },
  { name: "Cervezas", time: "Desde 20:00, hasta agotar" },
];

const PERKS = ["WiFi dedicado", "Swag Kit", "Mentoria"];

const PRIZES = [
  { place: "1er Lugar", amount: "$1,000 USD" },
  { place: "2do Lugar", amount: "$700 USD" },
  { place: "3er Lugar", amount: "$300 USD" },
];

export default function Schedule() {
  return (
    <section id="agenda" className="py-16 sm:py-20 px-6 bg-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute -top-[10%] -right-[8%] pointer-events-none opacity-20">
        <ConcentricCircles size={400} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mb-12"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-400 mb-4">
            {"// AGENDA"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-gray-900 max-w-2xl">
            Un dia. Sin limites. Solo construye.
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-4 max-w-xl">
            Llega, forma equipo, construye lo que quieras y shippea. Si es cool y corre en Monad,
            vale.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[112px] sm:left-[128px] top-0 bottom-0 w-px bg-gray-100" />

          {SCHEDULE.map((item, i) => {
            const isMilestone = item.type === "milestone";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: EASING }}
                className="relative flex items-start gap-5 sm:gap-6 py-3.5 group"
              >
                {/* Time */}
                <span
                  className={`text-sm font-mono whitespace-nowrap w-[104px] sm:w-[120px] text-right flex-shrink-0 pt-0.5 ${
                    isMilestone ? "font-semibold text-gray-900" : "text-gray-400"
                  }`}
                >
                  {isMilestone ? item.start : `${item.start} - ${item.end}`}
                </span>

                {/* Dot */}
                <div className="relative flex-shrink-0 mt-1.5">
                  {isMilestone ? (
                    <>
                      <span className="absolute -inset-1.5 rounded-full bg-monad-primary/15" />
                      <span className="relative block w-3 h-3 rounded-full bg-monad-primary" />
                    </>
                  ) : (
                    <span className="block w-3 h-3 rounded-full border-2 border-gray-200 bg-white group-hover:border-monad-primary group-hover:bg-monad-primary/10 transition-colors duration-300" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 pb-1 flex-1">
                  <h4
                    className={`text-base sm:text-lg font-heading font-semibold transition-colors ${
                      isMilestone ? "text-gray-900" : "text-gray-900 group-hover:text-monad-primary"
                    }`}
                  >
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-gray-400 mt-0.5">{item.description}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Durante el dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASING }}
          className="mt-12 p-6 rounded-xl border border-gray-100 bg-gray-50/50"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-400 mb-4">
            {"// DURANTE EL DIA"}
          </p>
          <div className="space-y-3">
            {ALL_DAY.map((item) => (
              <div
                key={item.name}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
              >
                <span className="text-sm font-heading font-semibold text-gray-900 sm:w-24 flex-shrink-0">
                  {item.name}
                </span>
                <span className="text-sm font-mono text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200/60 my-5" />
          <p className="text-[10px] font-mono uppercase tracking-[2px] text-gray-400 mb-3">
            {"// TAMBIEN INCLUIDO"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PERKS.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-monad-primary flex-shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8l3.5 3.5L13 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs text-gray-500">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Prizes section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mt-16"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-gray-400 mb-6">
            {"// PREMIOS"}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-gray-900 mb-2">
            $2,000 USD en premios por ciudad
          </h3>
          <p className="text-sm text-gray-500 mb-8">
            Jurado tecnico decide los ganadores. El voto de los demas participantes en la app de
            Monad cuenta como indicativo, no es decisivo.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {PRIZES.map((prize, i) => (
              <motion.div
                key={prize.place}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASING }}
                className={`text-center py-6 px-4 rounded-xl border ${
                  i === 0 ? "border-monad-primary/30 bg-monad-primary/[0.03]" : "border-gray-100"
                }`}
              >
                <span className="text-2xl sm:text-3xl font-extrabold font-heading text-gray-900">
                  {prize.amount}
                </span>
                <p className="text-xs font-mono text-gray-400 uppercase tracking-[2px] mt-2">
                  {prize.place}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-xs text-gray-300 font-mono mt-8 text-center"
        >
          * La agenda puede variar. Horarios sujetos a confirmacion final.
        </motion.p>
      </div>
    </section>
  );
}

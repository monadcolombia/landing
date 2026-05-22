"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import ConcentricCircles from "./ConcentricCircles";

const MapColombia = dynamic(() => import("./MapColombia"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />,
});

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Hero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.3], [0.03, 0]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-monad-dark"
    >
      {/* Background grid with scroll fade */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: gridOpacity,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gradient blobs - subtle, using Monad palette */}
      <motion.div
        className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #85E6FF, transparent 70%)",
          animation: "float-blob-1 12s ease-in-out infinite",
          y: blob1Y,
        }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[15%] w-[350px] h-[350px] rounded-full opacity-15 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #6E54FF, transparent 70%)",
          animation: "float-blob-2 18s ease-in-out infinite",
          y: blob2Y,
        }}
      />

      {/* Concentric circles - behind the map area */}
      <div className="absolute top-[8%] right-[-5%] pointer-events-none opacity-60">
        <ConcentricCircles size={550} dark />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-24 pb-16"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left: Text */}
          <motion.div
            className="flex-[0.6] text-center lg:text-left min-w-0"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center lg:justify-start gap-4 sm:gap-5 mb-6"
            >
              <Image
                src="/images/medellin-blockchain.svg"
                alt="Medellín Blockchain Community"
                width={300}
                height={80}
                className="h-12 sm:h-16 lg:h-20 w-auto brightness-0 invert opacity-60"
              />
              <span className="text-sm sm:text-base lg:text-lg uppercase tracking-[4px] text-monad-light/60 font-mono">
                Presenta
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-8xl xl:text-9xl font-extrabold tracking-tight leading-[1.05] mb-6 font-heading text-white"
            >
              MONAD TOUR
              <br />
              <span className="text-gradient-monad">COLOMBIA</span>
              {/* Colombian flag accent stripes */}
              <motion.div
                className="flex gap-1.5 mt-2 lg:mt-3"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
              >
                <div className="h-[3px] w-12 sm:w-16 lg:w-20 rounded-full bg-[#FCD116]" />
                <div className="h-[3px] w-12 sm:w-16 lg:w-20 rounded-full bg-[#003893]" />
                <div className="h-[3px] w-12 sm:w-16 lg:w-20 rounded-full bg-[#CE1126]" />
              </motion.div>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg text-white/60 max-w-md mx-auto lg:mx-0 mb-8 px-2 sm:px-0"
            >
              Un día. Sin límites. Solo construye. Hackathons de un día en Medellín y Bogotá. Si
              puedes shippear, este es tu lugar.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start px-2 sm:px-0"
            >
              <motion.a
                href="https://lu.ma/medellinblockchain"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-monad-primary text-white font-bold px-6 sm:px-8 py-3 rounded-full hover:brightness-110 transition-all text-center font-mono uppercase tracking-wide btn-glow text-sm sm:text-base"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Regístrate
              </motion.a>
              <motion.a
                href="https://chat.whatsapp.com/JboPU2owNWU7ysj5TEvgyO"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 text-white font-medium px-6 sm:px-8 py-3 rounded-full hover:border-monad-primary/50 transition-colors text-center font-mono text-sm sm:text-base"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Unirse a la Comunidad
              </motion.a>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start px-2 sm:px-0 mt-4"
            >
              <motion.a
                href="/apply/mentor"
                className="border border-white/20 text-white font-medium px-5 sm:px-6 py-3 rounded-full hover:border-monad-primary/50 transition-colors text-center font-mono text-xs sm:text-sm whitespace-nowrap"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Aplica como Mentor
              </motion.a>
              <motion.a
                href="/apply/judge"
                className="border border-white/20 text-white font-medium px-5 sm:px-6 py-3 rounded-full hover:border-monad-primary/50 transition-colors text-center font-mono text-xs sm:text-sm whitespace-nowrap"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Aplica como Jurado
              </motion.a>
              <motion.a
                href="/apply/volunteer"
                className="border border-white/20 text-white font-medium px-5 sm:px-6 py-3 rounded-full hover:border-monad-primary/50 transition-colors text-center font-mono text-xs sm:text-sm whitespace-nowrap"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Aplica como Voluntario
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right: Map */}
          <motion.div
            className="flex-[0.4] w-full lg:max-w-none"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
          >
            <div className="h-[350px] sm:h-[400px] lg:h-[450px] relative">
              <div className="absolute inset-0 bg-monad-primary/10 blur-[60px] rounded-full scale-75" />
              <div className="relative h-full">
                <MapColombia />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Sliding stats panel - hidden on right edge, appears on hover */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 z-20 group overflow-visible">
        <div className="translate-x-[85%] group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center">
          {/* Handle indicator */}
          <div className="w-8 h-24 flex items-center justify-center cursor-pointer flex-shrink-0 -mr-px">
            <div className="w-1 h-12 bg-gray-300 rounded-full group-hover:bg-monad-primary/60 transition-colors duration-300" />
          </div>
          <div className="bg-white border border-gray-100 rounded-l-xl divide-y divide-gray-100">
            <div className="px-5 py-4">
              <span className="text-2xl xl:text-3xl font-extrabold text-gray-900 font-heading tabular-nums">
                10,000
              </span>
              <p className="text-[9px] tracking-[2px] mt-1 font-mono uppercase text-gray-400">
                Transacciones por segundo
              </p>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl xl:text-3xl font-extrabold text-gray-900 font-heading">
                  100
                </span>
                <span className="text-xl xl:text-2xl font-bold text-gray-600 font-heading">%</span>
              </div>
              <p className="text-[9px] tracking-[2px] mt-1 font-mono uppercase text-gray-400">
                Compatible con EVM
              </p>
            </div>
            <div className="px-5 py-4">
              <span className="text-2xl xl:text-3xl font-extrabold text-gray-900 font-heading">
                0.8s
              </span>
              <p className="text-[9px] tracking-[2px] mt-1 font-mono uppercase text-gray-400">
                Finalidad
              </p>
            </div>
            <div className="px-5 py-4">
              <span className="text-2xl xl:text-3xl font-extrabold text-gray-900 font-heading">
                0.4s
              </span>
              <p className="text-[9px] tracking-[2px] mt-1 font-mono uppercase text-gray-400">
                Tiempo de bloque
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 bg-white/50 rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

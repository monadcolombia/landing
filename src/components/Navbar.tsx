"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ScrambleLink from "./ScrambleLink";
import BuildMegaMenu from "./BuildMegaMenu";
import { BUILD_MENU_COLUMNS } from "@/lib/buildMenuData";

const navLinks = [
  { label: "Eventos", href: "#eventos" },
  { label: "Explorar", href: "#explorar" },
  { label: "Aliados", href: "#aliados" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [buildMobileOpen, setBuildMobileOpen] = useState(false);
  const buildRef = useRef<HTMLDivElement>(null);
  const buildTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!buildOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (buildRef.current && !buildRef.current.contains(e.target as Node)) {
        setBuildOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [buildOpen]);

  useEffect(() => {
    if (!buildOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuildOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [buildOpen]);

  const openBuild = () => {
    if (buildTimeoutRef.current) clearTimeout(buildTimeoutRef.current);
    setBuildOpen(true);
  };

  const closeBuild = () => {
    buildTimeoutRef.current = setTimeout(() => setBuildOpen(false), 150);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ top: "var(--banner-h, 0px)" }}
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/monad/logo-mark.svg"
            alt="Monad"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-lg font-extrabold tracking-tight">
            <span className={scrolled ? "text-gray-900" : "text-white"}>MONAD</span>
            <span
              className={`ml-1 text-sm font-medium ${scrolled ? "text-gray-400" : "text-white/50"}`}
            >
              TOUR
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {/* Build dropdown trigger */}
          <div
            ref={buildRef}
            className="relative"
            onMouseEnter={openBuild}
            onMouseLeave={closeBuild}
          >
            <ScrambleLink
              text="Construir"
              className={`text-sm transition-colors font-mono flex items-center gap-1 cursor-pointer ${
                scrolled ? "text-gray-500 hover:text-gray-900" : "text-white/70 hover:text-white"
              }`}
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  buildOpen ? "rotate-180" : ""
                }`}
              />
            </ScrambleLink>

            <AnimatePresence>{buildOpen && <BuildMegaMenu />}</AnimatePresence>
          </div>

          {navLinks.map((link) => (
            <ScrambleLink
              key={link.href}
              text={link.label}
              href={link.href}
              className={`text-sm transition-colors font-mono ${
                scrolled ? "text-gray-500 hover:text-gray-900" : "text-white/70 hover:text-white"
              }`}
            />
          ))}

          <a
            href="https://lu.ma/medellinblockchain"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-monad-primary text-white text-sm font-bold px-5 py-2 rounded-full hover:brightness-110 transition-all font-mono uppercase tracking-wide btn-glow"
          >
            Regístrate
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-0.5 transition-transform ${
              scrolled ? "bg-gray-900" : "bg-white"
            } ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 transition-opacity ${
              scrolled ? "bg-gray-900" : "bg-white"
            } ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 transition-transform ${
              scrolled ? "bg-gray-900" : "bg-white"
            } ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 space-y-4 overflow-hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-sm text-gray-500 hover:text-gray-900 font-mono"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {/* Build accordion */}
            <div>
              <button
                onClick={() => setBuildMobileOpen(!buildMobileOpen)}
                className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-gray-900 font-mono"
              >
                <span>Construir</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    buildMobileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {buildMobileOpen && (
                  <motion.div
                    key="build-mobile"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-1 pl-4 space-y-3">
                      {BUILD_MENU_COLUMNS.map((column) => (
                        <div key={column.heading}>
                          <p className="text-[10px] font-bold tracking-[3px] text-gray-400 font-mono uppercase mb-2">
                            {column.heading}
                          </p>
                          {column.items.map((item) => (
                            <a
                              key={item.title}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                              onClick={() => setMenuOpen(false)}
                            >
                              <item.icon className="w-4 h-4 text-monad-primary" />
                              <span>{item.title}</span>
                            </a>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="https://lu.ma/medellinblockchain"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-monad-primary text-white text-sm font-bold px-5 py-2 rounded-full text-center font-mono uppercase tracking-wide"
              onClick={() => setMenuOpen(false)}
            >
              Regístrate
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

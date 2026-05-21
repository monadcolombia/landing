import Image from "next/image";
import Link from "next/link";
import { FOOTER_NAV, SOCIAL_LINKS } from "@/lib/constants";

const COLUMNS = ["principal", "construir", "programas", "comunidad"] as const;

export default function Footer() {
  return (
    <footer className="bg-monad-dark border-t border-white/10 py-16 sm:py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {COLUMNS.map((key) => {
            const col = FOOTER_NAV[key];
            return (
              <div key={key}>
                <h4 className="text-[10px] font-bold tracking-[3px] text-white/40 font-mono uppercase mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => {
                    const isExternal = link.href.startsWith("http");
                    return (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          {...(isExternal && {
                            target: "_blank",
                            rel: "noopener noreferrer",
                          })}
                          className="text-sm text-white/50 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block font-mono"
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/monad/logo-mark.svg"
              alt="Monad"
              width={20}
              height={20}
              className="rounded-sm"
            />
            <span className="text-sm font-extrabold tracking-tight">
              <span className="text-white">MONAD</span>
              <span className="text-white/40 ml-1 text-xs font-medium">TOUR COLOMBIA</span>
            </span>
          </div>

          {/* Social links */}
          <div className="flex gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white transition-colors font-mono uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Legal */}
          <div className="flex items-center gap-4 text-xs text-white/30 font-mono">
            <span>&copy; 2026 Monad</span>
            <Link href="/privacidad" className="hover:text-white/50 transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white/50 transition-colors">
              Términos
            </Link>
            <Link
              href="/admin/applications"
              className="text-white/20 hover:text-white/60 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

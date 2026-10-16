import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipo",
  description:
    "Organizadores, mentores, jurados y voluntarios de MonadBlitz Medellín, el Blitz de Monad Tour Colombia del 17 de octubre de 2026.",
  alternates: { canonical: "/equipo" },
};

export default function EquipoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipo - Monad Tour Colombia",
  description: "Organizadores, mentores y jurados de MonadBlitz Medellín.",
};

export default function EquipoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

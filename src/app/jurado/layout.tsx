import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jurado",
  robots: { index: false, follow: false },
};

export default function JuradoLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-monad-dark text-white">{children}</div>;
}

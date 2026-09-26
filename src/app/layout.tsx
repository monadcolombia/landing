import type { Metadata } from "next";
import { Inter, Roboto_Mono, Space_Grotesk } from "next/font/google";
import EventSchema from "@/components/EventSchema";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  metadataBase: new URL("https://monadcolombia.xyz"),
  title: "Monad Tour Colombia 2026 | Hackathons MonadBlitz",
  description:
    "Recorre Colombia con Monad. Hackathon, workshops y comunidad blockchain en Medellín.",
  keywords: [
    "Monad",
    "blockchain",
    "Colombia",
    "hackathon",
    "MonadBlitz",
    "EVM",
    "Web3",
    "crypto",
    "Medellín",
    "developers",
    "smart contracts",
  ],
  authors: [{ name: "Medellín Blockchain Community" }],
  creator: "Medellín Blockchain Community",
  publisher: "Medellín Blockchain Community",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Monad Tour Colombia 2026 | Hackathons MonadBlitz",
    description:
      "Recorre Colombia con Monad. Hackathon, workshops y comunidad blockchain en Medellín.",
    type: "website",
    locale: "es_CO",
    url: "https://monadcolombia.xyz",
    siteName: "Monad Tour Colombia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monad Tour Colombia 2026 | Hackathons MonadBlitz",
    description:
      "Recorre Colombia con Monad. Hackathon, workshops y comunidad blockchain en Medellín.",
    creator: "@monad_xyz",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <EventSchema />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} ${spaceGrotesk.variable} ${inter.className} min-h-full flex flex-col noise-overlay`}
      >
        <a href="#hero" className="skip-to-content">
          Saltar al contenido
        </a>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

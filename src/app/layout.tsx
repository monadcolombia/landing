import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono, Space_Grotesk } from "next/font/google";
import EventSchema from "@/components/EventSchema";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

const SITE_URL = "https://monadcolombia.xyz";
const TITLE = "Monad Tour Colombia 2026 | MonadBlitz Medellín";
const DESCRIPTION =
  "MonadBlitz Medellín, 17 de octubre de 2026 en Indie Universe Hotel. Un Blitz de un día para construir en Monad, la blockchain EVM de alto rendimiento. Gratis, con mentores, jurados y USD 2.000 en premios.";

export const viewport: Viewport = {
  themeColor: "#0E091C",
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | Monad Tour Colombia" },
  description: DESCRIPTION,
  applicationName: "Monad Tour Colombia",
  category: "technology",
  keywords: [
    "MonadBlitz",
    "MonadBlitz Medellín",
    "Monad Tour Colombia",
    "Monad",
    "Monad blockchain",
    "Blitz",
    "hackathon Medellín",
    "hackathon blockchain Colombia",
    "Web3 Medellín",
    "EVM",
    "smart contracts",
    "Solidity",
    "Medellín Blockchain Community",
  ],
  authors: [{ name: "Medellín Blockchain Community", url: SITE_URL }],
  creator: "Medellín Blockchain Community",
  publisher: "Medellín Blockchain Community",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
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
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: "Monad Tour Colombia",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    site: "@MedellinBlock",
    creator: "@MedellinBlock",
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

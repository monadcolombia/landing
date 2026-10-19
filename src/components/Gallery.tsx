"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GalleryImage } from "@/lib/types";
import EditionTabs from "./EditionTabs";
import { DEFAULT_EDITION, editionInfo, type EditionKey } from "@/lib/editions";

const EASING = [0.16, 1, 0.3, 1] as const;

// Photos for each edition are uploaded in /admin/contenido. These are the V1 photos that
// shipped with the site; they show until V1 photos are uploaded there.
const V1_STATIC: GalleryImage[] = [
  {
    src: "/images/gallery/medellin-v1-01.webp",
    alt: "Builders trabajando en MonadBlitz Medellín, 6 de junio de 2026",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-02.webp",
    alt: "Equipos hackeando en Indie Universe durante MonadBlitz Medellín",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-03.webp",
    alt: "Equipo revisando código en MonadBlitz Medellín",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-04.webp",
    alt: "Equipo presentando su proyecto en MonadBlitz Medellín",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-05.webp",
    alt: "Cierre de MonadBlitz Medellín con los hoodies del evento",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-06.webp",
    alt: "Equipo de MonadBlitz Medellín frente al backdrop de la ciudad",
    city: "Medellín",
  },
];

type Photo = { id: string; src: string; alt: string | null };

const INTRO: Record<EditionKey, string> = {
  v1: "Ganaron Vertex, MonadRoad y Lorentz. Mención de honor para TrustLayer.",
  v2: "Un día construyendo en Monad en Indie Universe.",
};

export default function Gallery() {
  const [edition, setEdition] = useState<EditionKey>(DEFAULT_EDITION);
  const [byEdition, setByEdition] = useState<Partial<Record<EditionKey, Photo[]>>>({});
  const loaded = edition in byEdition;
  const uploaded = byEdition[edition] ?? [];
  const photos: Photo[] =
    uploaded.length > 0 || edition !== "v1"
      ? uploaded
      : V1_STATIC.map((img, i) => ({ id: `v1-${i}`, src: img.src, alt: img.alt }));

  useEffect(() => {
    if (loaded) return;
    fetch(`/api/gallery?edition=${edition}`)
      .then((r) => r.json())
      .then((j) => setByEdition((m) => ({ ...m, [edition]: j.data || [] })))
      .catch(() => setByEdition((m) => ({ ...m, [edition]: [] })));
  }, [edition, loaded]);

  return (
    <section id="galeria" className="py-16 sm:py-20 px-6 bg-monad-dark overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mb-12"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-white/40 mb-4">
            {"// GALERÍA"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white max-w-3xl">
            Así fue Medellín
          </h2>
          <p className="text-base sm:text-lg text-white/50 mt-4 max-w-xl leading-relaxed">
            La edición del {editionInfo(edition).date}. {INTRO[edition]}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <EditionTabs value={edition} onChange={setEdition} theme="dark" />
            <a
              href="https://www.instagram.com/medellinblock"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-xs font-mono uppercase tracking-wide text-white/80 hover:border-monad-primary/60 hover:text-white"
            >
              Ver en Instagram
            </a>
            <a
              href="https://x.com/MedellinBlock"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-xs font-mono uppercase tracking-wide text-white/80 hover:border-monad-primary/60 hover:text-white"
            >
              Ver en X
            </a>
          </div>
        </motion.div>

        {loaded && photos.length === 0 && (
          <p className="text-white/50">Pronto publicamos las fotos de esta edición.</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {photos.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: Math.min(i, 6) * 0.08, ease: EASING }}
              className="relative overflow-hidden rounded-lg group aspect-[4/3]"
            >
              <Image
                src={img.src}
                alt={img.alt || `Foto de Monad Blitz Medellín ${editionInfo(edition).label}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized={img.src.startsWith("/api/")}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

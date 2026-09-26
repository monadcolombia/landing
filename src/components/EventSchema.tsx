import { CITIES, isUpcoming } from "@/lib/constants";

export default function EventSchema() {
  const confirmedEvents = CITIES.filter((c) => isUpcoming(c));

  const eventSchemas = confirmedEvents.map((city) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `MonadBlitz ${city.name}`,
    description: `MonadBlitz Hackathon en ${city.name} - Monad Tour Colombia 2026. Un dia intensivo de hacking construyendo en Monad, la blockchain EVM de alto rendimiento.`,
    startDate: city.dateISO,
    endDate: city.dateISO,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: city.venue || city.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressCountry: "CO",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Medellín Blockchain Community",
      url: "https://monadcolombia.xyz",
    },
    performer: {
      "@type": "Organization",
      name: "Monad Foundation",
      url: "https://www.monad.xyz",
    },
    offers: city.registrationUrl
      ? {
          "@type": "Offer",
          url: city.registrationUrl,
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          validFrom: "2026-01-01",
        }
      : undefined,
    image: "https://monadcolombia.xyz/og-image.png",
    url: "https://monadcolombia.xyz",
    inLanguage: "es",
    isAccessibleForFree: true,
  }));

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Necesito saber programar para participar en MonadBlitz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No necesariamente. MonadBlitz esta abierto a todos los perfiles: devs, disenadores, product managers, creadores de contenido y mas. Los equipos necesitan al menos un perfil tecnico, pero se valora la diversidad de habilidades.",
        },
      },
      {
        "@type": "Question",
        name: "El evento MonadBlitz es gratis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Si, la participacion en MonadBlitz es completamente gratuita. Solo necesitas registrarte a traves de Luma.",
        },
      },
      {
        "@type": "Question",
        name: "Que es Monad?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Monad es una blockchain Layer 1 compatible con EVM que ofrece 10,000 transacciones por segundo, finalidad en menos de 1 segundo y gas fees minimos.",
        },
      },
    ],
  };

  return (
    <>
      {eventSchemas.map((schema, i) => (
        <script
          key={`event-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

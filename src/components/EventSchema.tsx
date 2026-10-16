import { CITIES, FAQ_ITEMS, isUpcoming } from "@/lib/constants";

const SITE_URL = "https://monadcolombia.xyz";
const ORG_ID = `${SITE_URL}/#organization`;

// Structured data for search engines: the organizer, the site, each upcoming
// Blitz, and the FAQ. The FAQ comes from the same list rendered on the page,
// which Google requires for FAQ rich results.
export default function EventSchema() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Medellín Blockchain Community",
    alternateName: "Monad Tour Colombia",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    sameAs: [
      "https://x.com/MedellinBlock",
      "https://www.instagram.com/medellinblock",
      "https://www.tiktok.com/@medellinblockchain",
      "https://luma.com/medellinblockchain",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Monad Tour Colombia",
    url: SITE_URL,
    inLanguage: "es-CO",
    publisher: { "@id": ORG_ID },
  };

  const events = CITIES.filter((c) => isUpcoming(c) && c.dateISO).map((city) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `MonadBlitz ${city.name}`,
    description: `MonadBlitz ${city.name}, parte de Monad Tour Colombia 2026. Un Blitz de un día para construir en Monad, la blockchain EVM de alto rendimiento. Gratis, con mentores, jurados y premios.`,
    startDate: `${city.dateISO}T09:00:00-05:00`,
    endDate: `${city.dateISO}T22:00:00-05:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: city.venue || city.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Medellín",
        addressRegion: "Antioquia",
        addressCountry: "CO",
      },
      geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lng },
    },
    image: [`${SITE_URL}/opengraph-image`],
    organizer: { "@id": ORG_ID },
    performer: { "@type": "Organization", name: "Monad Foundation", url: "https://www.monad.xyz" },
    offers: city.registrationUrl
      ? {
          "@type": "Offer",
          url: city.registrationUrl,
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        }
      : undefined,
    url: SITE_URL,
    inLanguage: "es",
    isAccessibleForFree: true,
  }));

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const blocks = [organization, website, ...events, faq];

  return (
    <>
      {blocks.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}

import { City, Partner, PartnerCategory, FAQItem, FooterLink } from "./types";

export const CITIES: City[] = [
  {
    id: "medellin",
    name: "Medellín",
    lat: 6.2442,
    lng: -75.5812,
    date: "6 de Junio, 2026",
    dateISO: "2026-06-06",
    confirmed: true,
    registrationUrl: "https://luma.com/o56ekpyb",
    description: "La capital de la montaña abre el tour. Un día, sin límites, solo construye.",
    eventType: "MonadBlitz Hackathon",
    venue: "Medellín, Colombia",
  },
  {
    id: "bogota",
    name: "Bogotá",
    lat: 4.711,
    lng: -74.0721,
    date: null,
    dateISO: null,
    confirmed: false,
    registrationUrl: "https://luma.com/gytabj8l",
    description: "La capital se prende. Llega, construye, shippea.",
    eventType: "MonadBlitz Hackathon",
    venue: "Bogotá, Colombia",
  },
];

export const PARTNERS: Partner[] = [
  { name: "Medellín Blockchain Community", logo: "/images/medellin-blockchain.svg" },
  { name: "DevLabX3", logo: "/images/partners/sponsors/devlabx3.svg" },
  { name: "Monad Foundation", logo: "/images/partners/sponsors/monad-foundation.png" },
  { name: "Criptoprofesor", logo: "/images/partners/communities/criptoprofesor.png" },
  { name: "Ultravioleta DAO", logo: "/images/partners/communities/ultravioleta-dao.svg" },
  { name: "Platohedro", logo: "/images/partners/communities/platohedro.png" },
];

export const PARTNER_CATEGORIES: PartnerCategory[] = [
  {
    title: "APOYAN",
    subtitle: "Sponsors y aliados que hacen posible el tour",
    partners: [
      { name: "DevLabX3", logo: "/images/partners/sponsors/devlabx3.svg" },
      { name: "Monad Foundation", logo: "/images/partners/sponsors/monad-foundation.png" },
    ],
  },
  {
    title: "UNIVERSIDADES",
    subtitle: "Sedes de workshops previos al hackathon",
    partners: [
      { name: "UPB", logo: "/images/partners/universities/upb.png" },
      { name: "EAFIT", logo: "/images/partners/universities/eafit.png" },
      { name: "UdeA", logo: "/images/partners/universities/udea.png" },
      { name: "ITM", logo: "/images/partners/universities/itm.png" },
      { name: "Tecnologico de Antioquia", logo: "/images/partners/universities/tdea.png" },
      { name: "CESDE", logo: "/images/partners/universities/cesde.png" },
    ],
  },
  {
    title: "COMUNIDADES ALIADAS",
    subtitle: "Comunidades blockchain que difunden y apoyan el evento",
    partners: [
      { name: "Platohedro", logo: "/images/partners/communities/platohedro.png" },
      { name: "Criptoprofesor", logo: "/images/partners/communities/criptoprofesor.png" },
      { name: "Ultravioleta DAO", logo: "/images/partners/communities/ultravioleta-dao.svg" },
    ],
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "¿Necesito saber programar para participar?",
    answer:
      "No necesariamente. MonadBlitz está abierto a todos los perfiles: devs, diseñadores, product managers, creadores de contenido, community builders y más. Además puedes vicodear, usar herramientas de IA y no-code. Los equipos necesitan al menos un perfil técnico, pero valoramos la diversidad de habilidades. Si no programas, tu aporte en UX, estrategia, pitch o diseño es igual de importante para ganar.",
  },
  {
    question: "¿El evento es gratis?",
    answer:
      "Sí, la participación en MonadBlitz es completamente gratuita. Solo necesitas registrarte a través de Luma.",
  },
  {
    question: "¿Puedo ir solo o necesito equipo?",
    answer:
      "Puedes asistir solo. Al inicio del evento hay una dinámica de formación de equipos donde puedes encontrar compañeros. También puedes llegar con tu equipo ya formado (máximo 3 personas).",
  },
  {
    question: "¿Qué necesito llevar?",
    answer:
      "Ganas de construir, ideas y ganas de aportar. Si tienes laptop, tráela con su cargador. Nosotros proporcionamos internet de alta velocidad, brunch, almuerzo, snacks, bebidas y cerveza todo el día, más un swag kit.",
  },
  {
    question: "¿Hay premios?",
    answer:
      "Sí. Cada MonadBlitz tiene un prize pool de $2,000 USD por ciudad: $1,000 para el 1er lugar, $700 para el 2do y $300 para el 3ro.",
  },
  {
    question: "¿El evento es en español o inglés?",
    answer:
      "El evento es principalmente en español, pero los mentores pueden asistir en ambos idiomas. La documentación de Monad está en inglés.",
  },
  {
    question: "¿Qué es Monad?",
    answer:
      "Monad es una blockchain Layer 1 de alto rendimiento, compatible con EVM. Rápida, barata y pensada para builders. Si ya conoces Ethereum, ya conoces Monad.",
  },
  {
    question: "¿Cómo me preparo para el hackathon?",
    answer:
      "Llega con una idea o con ganas de unirte a una. Si quieres adelantar, explora docs.monad.xyz y únete al Discord de Monad. No hay restricciones de stack ni de herramientas: si es cool y corre en Monad, vale.",
  },
];

export const FOOTER_NAV: Record<string, { title: string; links: FooterLink[] }> = {
  principal: {
    title: "PRINCIPAL",
    links: [
      { label: "Inicio", href: "#hero" },
      { label: "Explorar Ecosistema", href: "https://app.monad.xyz/" },
      { label: "Eventos", href: "#eventos" },
    ],
  },
  construir: {
    title: "CONSTRUIR",
    links: [
      { label: "Empezar a Construir", href: "https://www.monad.xyz/build" },
      { label: "Portal de Developers", href: "https://developers.monad.xyz/" },
      { label: "Documentación", href: "https://docs.monad.xyz/" },
      { label: "Directorio de Infra", href: "https://www.monad.xyz/infra" },
      { label: "Foro de Investigación", href: "https://forum.monad.xyz/" },
    ],
  },
  programas: {
    title: "PROGRAMAS",
    links: [
      { label: "DeltaV", href: "https://deltav.monad.xyz/" },
      { label: "Monad Momentum", href: "https://momentum.monad.xyz/" },
      { label: "Monad Madness", href: "https://madness.monad.xyz/" },
      { label: "Aplicar como Mentor", href: "/apply/mentor" },
      { label: "Aplicar como Jurado", href: "/apply/judge" },
      { label: "Aplicar como Voluntario", href: "/apply/volunteer" },
    ],
  },
  comunidad: {
    title: "COMUNIDAD",
    links: [
      { label: "Monad Foundation", href: "https://www.monad.xyz/" },
      { label: "Brand & Media Kit", href: "https://www.monad.xyz/brand" },
    ],
  },
};

export const SOCIAL_LINKS = [
  { label: "X", href: "https://x.com/monad_xyz" },
  { label: "Discord", href: "https://discord.gg/monad" },
];

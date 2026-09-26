export type Organizer = {
  name: string;
  role: string;
  image: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
};

export const ORGANIZERS: Organizer[] = [
  {
    name: "Ximena Monclou",
    role: "Coordinación",
    image: "/images/organizers/ximemonclou.jpg",
    twitter: "https://x.com/ximemonclou",
  },
  {
    name: "Daniela Monclou",
    role: "Logística & Activaciones",
    image: "/images/organizers/Danimonclou.jpg",
    twitter: "https://x.com/Danimonclou",
  },
  {
    name: "Diana Monclou",
    role: "Logística & Activaciones",
    image: "/images/organizers/DianaMonclou.jpg",
    twitter: "https://x.com/DianaMonclou",
  },
];

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  date: string | null;
  dateISO: string | null;
  confirmed: boolean;
  registrationUrl: string | null;
  description: string;
  eventType?: string;
  venue?: string;
  venueUrl?: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface Partner {
  name: string;
  logo: string | null;
}

export interface PartnerCategory {
  title: string;
  subtitle?: string;
  partners: Partner[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  city?: string;
}

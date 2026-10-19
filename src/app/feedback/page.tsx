import type { Metadata } from "next";
import FeedbackForm from "./form";

export const metadata: Metadata = {
  title: "¿Cómo te fue en el Blitz?",
  description:
    "Cuéntanos en 2 minutos cómo te fue en MonadBlitz Medellín V2. Con tus respuestas armamos el próximo.",
  alternates: { canonical: "/feedback" },
};

export default function FeedbackPage() {
  return <FeedbackForm />;
}

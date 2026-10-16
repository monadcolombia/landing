import { Suspense } from "react";
import type { Metadata } from "next";
import ApplyForm from "./form";

export const metadata: Metadata = {
  title: "Colabora: mentores, jurados y voluntarios",
  description:
    "Postúlate como mentor, jurado o voluntario en MonadBlitz Medellín, el 17 de octubre de 2026.",
  alternates: { canonical: "/apply" },
};

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-monad-dark" />}>
      <ApplyForm />
    </Suspense>
  );
}

import { Suspense } from "react";
import ApplyForm from "./form";

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-monad-dark" />}>
      <ApplyForm />
    </Suspense>
  );
}

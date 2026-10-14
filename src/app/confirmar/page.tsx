import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyConfirmToken } from "@/lib/confirm-token";
import { sendConfirmationNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmar asistencia - Monad Tour Colombia",
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<string, string> = {
  mentor: "mentor",
  judge: "jurado",
  volunteer: "voluntario",
};

async function confirmAttendance(formData: FormData) {
  "use server";
  const token = String(formData.get("t") || "");
  const id = verifyConfirmToken(token);
  if (!id) return;
  const app = await prisma.application.findUnique({
    where: { id },
    select: { status: true, confirmed: true, fullName: true, role: true, email: true },
  });
  if (!app || app.status !== "approved" || app.confirmed) return;
  await prisma.application.update({ where: { id }, data: { confirmed: true } });
  sendConfirmationNotification({ fullName: app.fullName, role: app.role, email: app.email }).catch(
    (err) => console.error("[email] confirmation notification failed:", err)
  );
  revalidatePath("/confirmar");
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-monad-dark flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        {children}
        <Link
          href="/"
          className="inline-block mt-8 text-sm text-white/50 hover:text-white font-mono transition-colors"
        >
          Ir a monadcolombia.xyz
        </Link>
      </div>
    </div>
  );
}

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t = "" } = await searchParams;
  const id = verifyConfirmToken(t);
  const app = id
    ? await prisma.application.findUnique({
        where: { id },
        select: { fullName: true, role: true, status: true, confirmed: true },
      })
    : null;

  if (!app || app.status !== "approved") {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-white mb-3">Enlace no válido</h1>
        <p className="text-white/70">
          Este enlace venció o ya no está activo. Responde el correo que te enviamos y te ayudamos.
        </p>
      </Shell>
    );
  }

  const firstName = app.fullName.split(" ")[0];
  const role = ROLE_LABEL[app.role] ?? app.role;

  if (app.confirmed) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-white mb-3">¡Listo, {firstName}!</h1>
        <p className="text-white/70">
          Tu asistencia como {role} en MonadBlitz Medellín V2 está confirmada. Nos vemos el 17 de
          octubre en Indie Universe Hotel.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-white mb-3">Hola {firstName}</h1>
      <p className="text-white/70 mb-6">
        Confirma que vas como {role} a MonadBlitz Medellín V2, el 17 de octubre en Indie Universe
        Hotel.
      </p>
      <form action={confirmAttendance}>
        <input type="hidden" name="t" value={t} />
        <button
          type="submit"
          className="w-full bg-monad-primary text-white font-mono uppercase tracking-wide px-6 py-3 rounded-full hover:brightness-110 transition-all"
        >
          Confirmar mi asistencia
        </button>
      </form>
    </Shell>
  );
}

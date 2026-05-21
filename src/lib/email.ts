import nodemailer from "nodemailer";

const NOTIFY_EMAIL = "medellinblockchaincommunity@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NOTIFY_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface ApplicationData {
  role: string;
  fullName: string;
  email: string;
  phone?: string | null;
  city: string;
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  [key: string]: unknown;
}

export async function sendApplicationNotification(data: ApplicationData): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) return;

  const roleLabel =
    data.role === "mentor" ? "Mentor" : data.role === "volunteer" ? "Voluntario" : "Jurado";

  const fields = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const value = Array.isArray(v) ? v.join(", ") : String(v);
      return `${k}: ${value}`;
    })
    .join("\n");

  await transporter.sendMail({
    from: NOTIFY_EMAIL,
    to: NOTIFY_EMAIL,
    subject: `Nueva aplicacion de ${roleLabel}: ${data.fullName} (${data.city})`,
    text: `Nueva aplicacion recibida\n\nRol: ${roleLabel}\nNombre: ${data.fullName}\nEmail: ${data.email}\nCiudad: ${data.city}\n\n--- Todos los campos ---\n${fields}`,
  });
}

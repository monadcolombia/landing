import nodemailer from "nodemailer";

const SENDER_EMAIL = "monadblitzcolombia@gmail.com";
const NOTIFY_EMAIL = "monadblitzcolombia@gmail.com";
const SENDER = `MonadBlitz Colombia <${SENDER_EMAIL}>`;

const WHATSAPP_URL = "https://chat.whatsapp.com/JboPU2owNWU7ysj5TEvgyO";
const TELEGRAM_URL = "https://t.me/monadcolombia";
const X_URL = "https://x.com/MedellinBlock";
const INSTAGRAM_URL = "https://www.instagram.com/medellinblock";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: SENDER_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type AppRole = "mentor" | "judge" | "volunteer";

function roleLabel(role: string): string {
  if (role === "mentor") return "Mentor";
  if (role === "volunteer") return "Voluntario";
  return "Jurado";
}

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

  const label = roleLabel(data.role);

  const fields = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const value = Array.isArray(v) ? v.join(", ") : String(v);
      return `${k}: ${value}`;
    })
    .join("\n");

  await transporter.sendMail({
    from: SENDER,
    to: NOTIFY_EMAIL,
    subject: `Nueva aplicacion de ${label}: ${data.fullName} (${data.city})`,
    text: `Nueva aplicacion recibida\n\nRol: ${label}\nNombre: ${data.fullName}\nEmail: ${data.email}\nCiudad: ${data.city}\n\n--- Todos los campos ---\n${fields}`,
  });
}

interface ApplicantStatusEmail {
  to: string;
  fullName: string;
  role: AppRole;
  status: "approved" | "rejected";
}

const socialsHtml = `
  <p style="margin:24px 0 8px;color:#0f172a;font-size:14px;font-weight:600">Siguenos:</p>
  <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6">
    <li>X: <a href="${X_URL}" style="color:#6E54FF">${X_URL}</a></li>
    <li>Instagram: <a href="${INSTAGRAM_URL}" style="color:#6E54FF">${INSTAGRAM_URL}</a></li>
  </ul>
`;

const socialsText = `Siguenos:\n- X: ${X_URL}\n- Instagram: ${INSTAGRAM_URL}`;

const stayConnectedHtml = `
  <p style="margin:24px 0 8px;color:#0f172a;font-size:14px;font-weight:600">Sigue conectado con la comunidad:</p>
  <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6">
    <li>Telegram: <a href="${TELEGRAM_URL}" style="color:#6E54FF">${TELEGRAM_URL}</a></li>
    <li>WhatsApp: <a href="${WHATSAPP_URL}" style="color:#6E54FF">${WHATSAPP_URL}</a></li>
    <li>X: <a href="${X_URL}" style="color:#6E54FF">${X_URL}</a></li>
    <li>Instagram: <a href="${INSTAGRAM_URL}" style="color:#6E54FF">${INSTAGRAM_URL}</a></li>
  </ul>
`;

const stayConnectedText = [
  "Sigue conectado con la comunidad:",
  `- Telegram: ${TELEGRAM_URL}`,
  `- WhatsApp: ${WHATSAPP_URL}`,
  `- X: ${X_URL}`,
  `- Instagram: ${INSTAGRAM_URL}`,
].join("\n");

const joinHtml = `
  <p style="margin:24px 0 8px;color:#0f172a;font-size:14px;font-weight:600">Unete a los grupos:</p>
  <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6">
    <li>Telegram: <a href="${TELEGRAM_URL}" style="color:#6E54FF">${TELEGRAM_URL}</a></li>
    <li>WhatsApp: <a href="${WHATSAPP_URL}" style="color:#6E54FF">${WHATSAPP_URL}</a></li>
  </ul>
`;

const joinText = `Unete a los grupos:\n- Telegram: ${TELEGRAM_URL}\n- WhatsApp: ${WHATSAPP_URL}`;

function approvedTemplate(fullName: string, role: AppRole) {
  const label = roleLabel(role);
  const firstName = fullName.split(" ")[0];
  const intro =
    role === "volunteer"
      ? "Que bueno tenerte en el equipo. Tu apoyo hace posible MonadBlitz."
      : `Tu aplicacion como ${label} fue aprobada. Nos emociona contar contigo en MonadBlitz Colombia.`;

  const text = [
    `Hola ${firstName},`,
    "",
    `${intro}`,
    "",
    "Proximos pasos:",
    "1. Unete a los grupos para estar en contacto con los participantes y la comunidad.",
    "2. Confirma tu disponibilidad respondiendo a este correo.",
    "3. Comparte el evento con tu red, invita a mas personas.",
    "",
    joinText,
    "",
    socialsText,
    "",
    "Cualquier duda nos respondes este mismo correo.",
    "",
    "MonadBlitz Colombia",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff">
    <p style="margin:0 0 12px;color:#0f172a;font-size:16px">Hola ${firstName},</p>
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6">${intro}</p>
    <p style="margin:24px 0 8px;color:#0f172a;font-size:14px;font-weight:600">Proximos pasos:</p>
    <ol style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6">
      <li>Unete a los grupos para estar en contacto con los participantes y la comunidad.</li>
      <li>Confirma tu disponibilidad respondiendo a este correo.</li>
      <li>Comparte el evento con tu red, invita a mas personas.</li>
    </ol>
    ${joinHtml}
    ${socialsHtml}
    <p style="margin:24px 0 0;color:#334155;font-size:14px;line-height:1.6">Cualquier duda nos respondes este mismo correo.</p>
    <p style="margin:16px 0 0;color:#0f172a;font-size:14px;font-weight:600">MonadBlitz Colombia</p>
  </div></body></html>`;

  return {
    subject: `Tu aplicacion como ${label} fue aprobada - MonadBlitz Colombia`,
    text,
    html,
  };
}

function rejectedTemplate(fullName: string, role: AppRole) {
  const label = roleLabel(role);
  const firstName = fullName.split(" ")[0];
  const HACKER_URL = "https://lu.ma/medellinblockchain";
  const VOLUNTEER_URL = "https://monadcolombia.xyz/apply/volunteer";

  const altCtaText =
    role === "volunteer"
      ? `Si quieres asistir como hacker, registrate aqui: ${HACKER_URL}`
      : `Aun puedes aplicar como voluntario aqui: ${VOLUNTEER_URL}\nO asistir como hacker registrandote aqui: ${HACKER_URL}`;

  const altCtaHtml =
    role === "volunteer"
      ? `Si quieres asistir como hacker, <a href="${HACKER_URL}" style="color:#6E54FF">registrate aqui</a>.`
      : `Aun puedes aplicar como voluntario <a href="${VOLUNTEER_URL}" style="color:#6E54FF">aqui</a> o asistir como hacker <a href="${HACKER_URL}" style="color:#6E54FF">registrandote aqui</a>.`;

  const text = [
    `Hola ${firstName},`,
    "",
    `Gracias por aplicar como ${label} a MonadBlitz Colombia. Esta vez no pudimos avanzar con tu aplicacion, pero valoramos mucho tu interes.`,
    "",
    altCtaText,
    "",
    stayConnectedText,
    "",
    "MonadBlitz Colombia",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff">
    <p style="margin:0 0 12px;color:#0f172a;font-size:16px">Hola ${firstName},</p>
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6">
      Gracias por aplicar como ${label} a MonadBlitz Colombia. Esta vez no pudimos avanzar con tu aplicacion, pero valoramos mucho tu interes.
    </p>
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6">${altCtaHtml}</p>
    ${stayConnectedHtml}
    <p style="margin:24px 0 0;color:#0f172a;font-size:14px;font-weight:600">MonadBlitz Colombia</p>
  </div></body></html>`;

  return {
    subject: `Tu aplicacion como ${label} en MonadBlitz Colombia`,
    text,
    html,
  };
}

export async function sendApplicantStatusEmail({
  to,
  fullName,
  role,
  status,
}: ApplicantStatusEmail): Promise<void> {
  if (!process.env.GMAIL_APP_PASSWORD) return;

  const tpl =
    status === "approved" ? approvedTemplate(fullName, role) : rejectedTemplate(fullName, role);

  await transporter.sendMail({
    from: SENDER,
    to,
    bcc: NOTIFY_EMAIL,
    replyTo: NOTIFY_EMAIL,
    subject: tpl.subject,
    text: tpl.text,
    html: tpl.html,
  });
}

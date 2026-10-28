import { Resend } from "resend";
import { COMMUNITY_LINKS, registrationUrl } from "./constants";
import { confirmUrl } from "./confirm-token";

const NOTIFY_EMAIL = "monadblitzcolombia@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM || "onboarding@resend.dev";
const SENDER = `MonadBlitz Colombia <${FROM_EMAIL}>`;

const WHATSAPP_URL = COMMUNITY_LINKS.whatsapp;
const TELEGRAM_URL = COMMUNITY_LINKS.telegram;
const X_URL = "https://x.com/MedellinBlock";
const INSTAGRAM_URL = "https://www.instagram.com/medellinblock";
const TIKTOK_URL = "https://www.tiktok.com/@medellinblockchain";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
  edition?: string;
  linkedin?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  [key: string]: unknown;
}

export async function sendApplicationNotification(data: ApplicationData): Promise<void> {
  if (!resend) {
    console.error("[email] RESEND_API_KEY missing, aborting notification");
    return;
  }

  const label = roleLabel(data.role);

  const fields = Object.entries(data)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const value = Array.isArray(v) ? v.join(", ") : String(v);
      return `${k}: ${value}`;
    })
    .join("\n");

  const edition = data.edition === "v1" ? "V1" : "V2";
  const body = `Nueva aplicación recibida\n\nEdición: ${edition}\nRol: ${label}\nNombre: ${data.fullName}\nEmail: ${data.email}\nCiudad: ${data.city}\n\n--- Todos los campos ---\n${fields}`;

  const result = await resend.emails.send({
    from: SENDER,
    to: NOTIFY_EMAIL,
    subject: `Nueva aplicación ${edition} de ${label}: ${data.fullName} (${data.city})`,
    text: body,
  });
  if (result.error) {
    console.error("[email] notification send failed:", result.error);
    throw new Error(result.error.message);
  }
}

interface ApplicantStatusEmail {
  id: string;
  to: string;
  fullName: string;
  role: AppRole;
  status: "approved" | "rejected";
  edition?: "v1" | "v2";
}

const tiktokLi = TIKTOK_URL
  ? `<li>TikTok: <a href="${TIKTOK_URL}" style="color:#6E54FF">${TIKTOK_URL}</a></li>`
  : "";
const tiktokLine = TIKTOK_URL ? `\n- TikTok: ${TIKTOK_URL}` : "";

const socialsHtml = `
  <p style="margin:24px 0 8px;color:#0f172a;font-size:14px;font-weight:600">Síguenos:</p>
  <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6">
    <li>X: <a href="${X_URL}" style="color:#6E54FF">${X_URL}</a></li>
    <li>Instagram: <a href="${INSTAGRAM_URL}" style="color:#6E54FF">${INSTAGRAM_URL}</a></li>
    ${tiktokLi}
  </ul>
`;

const socialsText = `Síguenos:\n- X: ${X_URL}\n- Instagram: ${INSTAGRAM_URL}${tiktokLine}`;

const stayConnectedHtml = `
  <p style="margin:24px 0 8px;color:#0f172a;font-size:14px;font-weight:600">Sigue conectado con la comunidad:</p>
  <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6">
    <li>Telegram: <a href="${TELEGRAM_URL}" style="color:#6E54FF">${TELEGRAM_URL}</a></li>
    <li>WhatsApp: <a href="${WHATSAPP_URL}" style="color:#6E54FF">${WHATSAPP_URL}</a></li>
    <li>X: <a href="${X_URL}" style="color:#6E54FF">${X_URL}</a></li>
    <li>Instagram: <a href="${INSTAGRAM_URL}" style="color:#6E54FF">${INSTAGRAM_URL}</a></li>
    ${tiktokLi}
  </ul>
`;

const stayConnectedText = [
  "Sigue conectado con la comunidad:",
  `- Telegram: ${TELEGRAM_URL}`,
  `- WhatsApp: ${WHATSAPP_URL}`,
  `- X: ${X_URL}`,
  `- Instagram: ${INSTAGRAM_URL}`,
  ...(TIKTOK_URL ? [`- TikTok: ${TIKTOK_URL}`] : []),
].join("\n");

const joinHtml = `
  <p style="margin:24px 0 8px;color:#0f172a;font-size:14px;font-weight:600">Únete a los grupos:</p>
  <ul style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6">
    <li>Telegram: <a href="${TELEGRAM_URL}" style="color:#6E54FF">${TELEGRAM_URL}</a></li>
    <li>WhatsApp: <a href="${WHATSAPP_URL}" style="color:#6E54FF">${WHATSAPP_URL}</a></li>
  </ul>
`;

const joinText = `Únete a los grupos:\n- Telegram: ${TELEGRAM_URL}\n- WhatsApp: ${WHATSAPP_URL}`;

function eventName(edition?: "v1" | "v2"): string {
  return edition === "v1"
    ? "MonadBlitz Medellín (6 de junio de 2026)"
    : "MonadBlitz Medellín V2 (17 de octubre de 2026)";
}

function approvedTemplate(
  fullName: string,
  role: AppRole,
  edition: "v1" | "v2" | undefined,
  confirmLink: string | null
) {
  const label = roleLabel(role);
  const event = eventName(edition);
  const firstName = fullName.split(" ")[0];
  const intro =
    role === "volunteer"
      ? `¡Qué bueno contar contigo como voluntario en ${event}! Tu apoyo hace posible el Blitz. Este rol no es remunerado.`
      : `Tu postulación como ${label} para ${event} fue aprobada. Nos emociona contar contigo. Este rol no es remunerado.`;

  const text = [
    `Hola ${firstName},`,
    "",
    `${intro}`,
    "",
    "Próximos pasos:",
    confirmLink
      ? `1. Confirma tu asistencia antes del 16 de octubre en este enlace: ${confirmLink}`
      : "1. Confirma tu asistencia respondiendo a este correo.",
    "2. Únete a los grupos para estar en contacto con los participantes y la comunidad.",
    "3. Comparte el evento con tu red, invita a más personas.",
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
    ${
      confirmLink
        ? `<p style="margin:24px 0 8px">
      <a href="${confirmLink}" style="display:inline-block;background:#6E54FF;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:999px">Confirmar mi asistencia</a>
    </p>
    <p style="margin:0 0 16px;color:#64748b;font-size:13px">Puedes confirmar hasta el 16 de octubre a las 11:59 p.m.</p>`
        : ""
    }
    <p style="margin:24px 0 8px;color:#0f172a;font-size:14px;font-weight:600">Próximos pasos:</p>
    <ol style="margin:0;padding-left:18px;color:#334155;font-size:14px;line-height:1.6">
      <li>${confirmLink ? "Confirma tu asistencia con el botón de arriba." : "Confirma tu asistencia respondiendo a este correo."}</li>
      <li>Únete a los grupos para estar en contacto con los participantes y la comunidad.</li>
      <li>Comparte el evento con tu red, invita a más personas.</li>
    </ol>
    ${joinHtml}
    ${socialsHtml}
    <p style="margin:24px 0 0;color:#334155;font-size:14px;line-height:1.6">Cualquier duda nos respondes este mismo correo.</p>
    <p style="margin:16px 0 0;color:#0f172a;font-size:14px;font-weight:600">MonadBlitz Colombia</p>
  </div></body></html>`;

  return {
    subject: `Tu postulación como ${label} fue aprobada - ${event}`,
    text,
    html,
  };
}

function rejectedTemplate(fullName: string, role: AppRole, edition?: "v1" | "v2") {
  const label = roleLabel(role);
  const event = eventName(edition);
  const firstName = fullName.split(" ")[0];
  const HACKER_URL = registrationUrl();
  const VOLUNTEER_URL = "https://monadcolombia.xyz/apply?role=volunteer";

  const altCtaText =
    role === "volunteer"
      ? `Si quieres asistir como hacker, regístrate aquí: ${HACKER_URL}`
      : `Aún puedes postularte como voluntario aquí: ${VOLUNTEER_URL}\nO asistir como hacker registrándote aquí: ${HACKER_URL}`;

  const altCtaHtml =
    role === "volunteer"
      ? `Si quieres asistir como hacker, <a href="${HACKER_URL}" style="color:#6E54FF">regístrate aquí</a>.`
      : `Aún puedes postularte como voluntario <a href="${VOLUNTEER_URL}" style="color:#6E54FF">aquí</a> o asistir como hacker <a href="${HACKER_URL}" style="color:#6E54FF">registrándote aquí</a>.`;

  const text = [
    `Hola ${firstName},`,
    "",
    `Gracias por postularte como ${label} a ${event}. Esta vez no pudimos avanzar con tu postulación, pero valoramos mucho tu interés.`,
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
      Gracias por postularte como ${label} a ${event}. Esta vez no pudimos avanzar con tu postulación, pero valoramos mucho tu interés.
    </p>
    <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6">${altCtaHtml}</p>
    ${stayConnectedHtml}
    <p style="margin:24px 0 0;color:#0f172a;font-size:14px;font-weight:600">MonadBlitz Colombia</p>
  </div></body></html>`;

  return {
    subject: `Tu postulación como ${label} en ${event}`,
    text,
    html,
  };
}

export async function sendApplicantStatusEmail({
  id,
  to,
  fullName,
  role,
  status,
  edition,
}: ApplicantStatusEmail): Promise<void> {
  console.log(`[email] sendApplicantStatusEmail start to=${to} role=${role} status=${status}`);

  if (!resend) {
    console.error("[email] RESEND_API_KEY missing, aborting");
    throw new Error("RESEND_API_KEY is not configured");
  }

  const tpl =
    status === "approved"
      ? approvedTemplate(fullName, role, edition, confirmUrl(id))
      : rejectedTemplate(fullName, role, edition);

  console.log(`[email] sending via Resend from=${SENDER} subject="${tpl.subject}"`);

  const result = await resend.emails.send({
    from: SENDER,
    to,
    bcc: NOTIFY_EMAIL,
    replyTo: NOTIFY_EMAIL,
    subject: tpl.subject,
    text: tpl.text,
    html: tpl.html,
  });

  if (result.error) {
    console.error("[email] Resend send failed:", result.error);
    throw new Error(result.error.message);
  }

  console.log(`[email] sent OK id=${result.data?.id}`);
}

export async function sendConfirmationNotification(data: {
  fullName: string;
  role: string;
  email: string;
}): Promise<void> {
  if (!resend) return;
  const label = roleLabel(data.role);
  const result = await resend.emails.send({
    from: SENDER,
    to: NOTIFY_EMAIL,
    subject: `${label} confirmó asistencia: ${data.fullName}`,
    text: `${data.fullName} (${data.email}) confirmó su asistencia como ${label} desde el enlace del correo de aprobación.`,
  });
  if (result.error) throw new Error(result.error.message);
}

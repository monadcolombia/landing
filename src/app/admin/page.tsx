"use client";

import { useState, useEffect, useCallback } from "react";
import type { Application } from "@prisma/client";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

type RoleFilter = "all" | "mentor" | "judge" | "volunteer";
type StatusFilter = "all" | "pending" | "approved" | "rejected";
type ActionStatus = "approved" | "rejected";

type Stats = {
  total: number;
  status: { pending: number; approved: number; rejected: number };
  role: { mentor: number; judge: number; volunteer: number };
  confirmed: number;
  unconfirmed: number;
};

const ROLE_LABELS: Record<string, string> = {
  mentor: "Mentor",
  judge: "Jurado",
  volunteer: "Voluntario",
};

const VOLUNTEER_AVAILABILITY_LABELS: Record<string, string> = {
  event_day: "Solo dia del evento",
  pre_event: "Solo pre-evento",
  both: "Pre-evento y dia del evento",
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => res.json())
      .then((data) => setCanWrite(Boolean(data.canWrite)))
      .catch(() => setCanWrite(false));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/applications/stats");
      if (!r.ok) return;
      setStats(await r.json());
    } catch {
      // ignore
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRole !== "all") params.append("role", selectedRole);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      const response = await fetch(`/api/admin/applications?${params}`);
      if (!response.ok) throw new Error("Error al cargar aplicaciones");
      const { data } = await response.json();
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      alert("Error al cargar aplicaciones");
    } finally {
      setLoading(false);
    }
  }, [selectedRole, selectedStatus]);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [fetchApplications, fetchStats]);

  const updateStatus = async (id: string, status: ActionStatus) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Error al actualizar estado");
      await Promise.all([fetchApplications(), fetchStats()]);
      setSelectedApp(null);
      alert(`Aplicación ${STATUS_LABELS[status]?.toLowerCase() || status} exitosamente`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar estado");
    }
  };

  const setConfirmed = async (id: string, confirmed: boolean) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
      if (!response.ok) throw new Error("Error al actualizar confirmacion");
      const { data } = await response.json();
      await Promise.all([fetchApplications(), fetchStats()]);
      if (selectedApp?.id === id) setSelectedApp(data);
    } catch (error) {
      console.error("Error updating confirmed:", error);
      alert("Error al actualizar confirmacion");
    }
  };

  const resendEmail = async (id: string) => {
    setResendingId(id);
    try {
      const response = await fetch(`/api/admin/applications/${id}/resend-email`, {
        method: "POST",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Error al reenviar correo");
      alert("Correo reenviado");
    } catch (error) {
      console.error("Error resending email:", error);
      alert(error instanceof Error ? error.message : "Error al reenviar correo");
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {!canWrite && (
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-300 rounded-lg px-4 py-3 text-sm font-mono">
          Solo lectura. No tienes permisos para aprobar, rechazar, confirmar o reenviar correos.
        </div>
      )}

      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-white">Aplicaciones</h2>
        <div className="flex gap-2">
          <a
            href={`/api/admin/applications/export?${new URLSearchParams({
              ...(selectedRole !== "all" && { role: selectedRole }),
              ...(selectedStatus !== "all" && { status: selectedStatus }),
            }).toString()}`}
            className="px-4 py-2 bg-monad-primary/20 border border-monad-primary/40 text-monad-primary rounded-lg hover:bg-monad-primary/30 transition-colors text-sm font-mono uppercase tracking-wide"
          >
            Exportar Excel
          </a>
          <button
            onClick={() => {
              fetchApplications();
              fetchStats();
            }}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Tile label="Total" value={stats.total} />
          <Tile label="Pendientes" value={stats.status.pending} tone="yellow" />
          <Tile
            label="Confirmados"
            value={stats.confirmed}
            sub={`/ ${stats.status.approved} aprobados`}
            tone="green"
          />
          <Tile label="Rechazados" value={stats.status.rejected} tone="red" />
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-mono uppercase tracking-wide text-white/90 mb-2">
              Rol
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleFilter)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-monad-primary"
            >
              <option value="all">Todos {stats ? `(${stats.total})` : ""}</option>
              <option value="mentor">Mentores {stats ? `(${stats.role.mentor})` : ""}</option>
              <option value="judge">Jurados {stats ? `(${stats.role.judge})` : ""}</option>
              <option value="volunteer">
                Voluntarios {stats ? `(${stats.role.volunteer})` : ""}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-mono uppercase tracking-wide text-white/90 mb-2">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-monad-primary"
            >
              <option value="all">Todos {stats ? `(${stats.total})` : ""}</option>
              <option value="pending">Pendientes {stats ? `(${stats.status.pending})` : ""}</option>
              <option value="approved">
                Aprobados {stats ? `(${stats.status.approved})` : ""}
              </option>
              <option value="rejected">
                Rechazados {stats ? `(${stats.status.rejected})` : ""}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Aplicaciones */}
      {loading ? (
        <div className="text-center text-white/70 py-12">Cargando...</div>
      ) : applications.length === 0 ? (
        <div className="text-center text-white/70 py-12">No se encontraron aplicaciones</div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <Th>Nombre</Th>
                  <Th>Rol</Th>
                  <Th>Ciudad</Th>
                  <Th>Estado</Th>
                  <Th>Confirmado</Th>
                  <Th>Fecha</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {app.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {ROLE_LABELS[app.role] || app.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70 capitalize">
                      {app.city === "both" ? "Ambas" : app.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {app.status === "approved" ? (
                        <ConfirmedBadge confirmed={app.confirmed} />
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {new Date(app.createdAt).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="text-monad-primary hover:text-monad-primary/80"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedApp && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="bg-monad-dark border border-white/10 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedApp.fullName}</h3>
                <p className="text-white/70">
                  Aplicación de {ROLE_LABELS[selectedApp.role] || selectedApp.role}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-white/70 hover:text-white"
              >
                X
              </button>
            </div>

            <div className="space-y-6">
              {/* Contacto */}
              <div className="space-y-2">
                <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                  Contacto
                </h4>
                <p className="text-white">Email: {selectedApp.email}</p>
                {selectedApp.phone && <p className="text-white">Telefono: {selectedApp.phone}</p>}
                {selectedApp.linkedin && (
                  <p className="text-white">
                    LinkedIn:{" "}
                    <a
                      href={selectedApp.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-monad-primary hover:underline"
                    >
                      {selectedApp.linkedin}
                    </a>
                  </p>
                )}
                {selectedApp.twitter && (
                  <p className="text-white">Twitter: {selectedApp.twitter}</p>
                )}
                {selectedApp.instagram && (
                  <p className="text-white">Instagram: {selectedApp.instagram}</p>
                )}
                {selectedApp.telegram && (
                  <p className="text-white">Telegram: {selectedApp.telegram}</p>
                )}
                {selectedApp.whatsapp && (
                  <p className="text-white">WhatsApp: {selectedApp.whatsapp}</p>
                )}
              </div>

              {/* Ciudad */}
              <div className="space-y-2">
                <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">Ciudad</h4>
                <p className="text-white">
                  {selectedApp.city === "both" ? "Ambas" : selectedApp.city}
                </p>
              </div>

              {/* Campos de Mentor */}
              {selectedApp.role === "mentor" && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Habilidades y Experiencia
                    </h4>
                    <p className="text-white">
                      Técnicas: {selectedApp.mentorPrimarySkills?.join(", ") || "-"}
                    </p>
                    <p className="text-white">
                      Blockchain: {selectedApp.mentorBlockchainExperience}
                    </p>
                    {selectedApp.mentorNonTechnicalSkills?.length > 0 && (
                      <p className="text-white">
                        No técnicas: {selectedApp.mentorNonTechnicalSkills.join(", ")}
                      </p>
                    )}
                    <p className="text-white/70">
                      Experiencia Monad/EVM: {selectedApp.mentorMonadExperience ? "Si" : "No"}
                    </p>
                    {selectedApp.mentorMonadExperienceDetails && (
                      <p className="text-white">{selectedApp.mentorMonadExperienceDetails}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">Bio</h4>
                    <p className="text-white">{selectedApp.mentorBio}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Motivación
                    </h4>
                    <p className="text-white">{selectedApp.mentorWhy}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Compromiso
                    </h4>
                    <p className="text-white">Equipos: {selectedApp.mentorTeamCommitment}</p>
                    <p className="text-white/70">
                      Mentoria previa: {selectedApp.mentorPreviousExperience ? "Si" : "No"}
                    </p>
                    {selectedApp.mentorPreviousDetails && (
                      <p className="text-white">{selectedApp.mentorPreviousDetails}</p>
                    )}
                  </div>
                </>
              )}

              {/* Campos de Jurado */}
              {selectedApp.role === "judge" && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Perfil Profesional
                    </h4>
                    <p className="text-white">{selectedApp.judgeCurrentRole}</p>
                    <p className="text-white/70">
                      {selectedApp.judgeYearsBlockchain} años blockchain /{" "}
                      {selectedApp.judgeYearsTotal} años total
                    </p>
                    <p className="text-white/70">
                      Nivel técnico:{" "}
                      {selectedApp.judgeTechnicalLevel === "highly_technical"
                        ? "Altamente Técnico"
                        : selectedApp.judgeTechnicalLevel === "moderate"
                          ? "Moderado"
                          : "Enfoque en Negocios"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Areas de Expertise
                    </h4>
                    <p className="text-white">
                      {selectedApp.judgeExpertiseAreas?.join(", ") || "-"}
                    </p>
                    <p className="text-white/70">
                      Experiencia: {selectedApp.judgeSpecificExperience?.join(", ") || "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">Bio</h4>
                    <p className="text-white">{selectedApp.judgeBio}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Motivación
                    </h4>
                    <p className="text-white">{selectedApp.judgeWhy}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Conflictos de Interés
                    </h4>
                    <p className="text-white">
                      {selectedApp.judgeConflicts === "ninguno" ? "Ninguno" : "Si"}
                    </p>
                    {selectedApp.judgeOtherConflicts && (
                      <p className="text-white/70">Detalles: {selectedApp.judgeOtherConflicts}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Experiencia como Jurado
                    </h4>
                    <p className="text-white/70">
                      Jurado previo: {selectedApp.judgePreviousExperience ? "Si" : "No"}
                    </p>
                    {selectedApp.judgePreviousDetails && (
                      <p className="text-white">{selectedApp.judgePreviousDetails}</p>
                    )}
                  </div>
                </>
              )}

              {/* Campos de Voluntario */}
              {selectedApp.role === "volunteer" && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Disponibilidad
                    </h4>
                    <p className="text-white">
                      {selectedApp.volunteerAvailability
                        ? VOLUNTEER_AVAILABILITY_LABELS[selectedApp.volunteerAvailability] ||
                          selectedApp.volunteerAvailability
                        : "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-mono uppercase tracking-wide text-white/70 text-sm">
                      Motivacion
                    </h4>
                    <p className="text-white">{selectedApp.volunteerWhy || "-"}</p>
                  </div>
                </>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
                {!canWrite && (
                  <p className="w-full text-sm text-white/50 italic">
                    Solo lectura. Pide a un admin con permisos completos que realice esta accion.
                  </p>
                )}

                {canWrite && selectedApp.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedApp.id, "approved")}
                      className="flex-1 min-w-[140px] bg-green-600 text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:bg-green-700 transition-colors"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.id, "rejected")}
                      className="flex-1 min-w-[140px] bg-red-600 text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:bg-red-700 transition-colors"
                    >
                      Rechazar
                    </button>
                  </>
                )}

                {canWrite && selectedApp.status === "approved" && (
                  <>
                    <button
                      onClick={() => setConfirmed(selectedApp.id, !selectedApp.confirmed)}
                      className={`flex-1 min-w-[140px] text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide transition-colors ${
                        selectedApp.confirmed
                          ? "bg-white/10 hover:bg-white/20"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {selectedApp.confirmed ? "Marcar no confirmado" : "Marcar confirmado"}
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "¿Rechazar esta aplicacion ya aprobada? El aplicante recibira el correo de rechazo y desaparece del sitio publico."
                          )
                        ) {
                          updateStatus(selectedApp.id, "rejected");
                        }
                      }}
                      className="flex-1 min-w-[140px] bg-red-600 text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:bg-red-700 transition-colors"
                    >
                      Rechazar
                    </button>
                  </>
                )}

                {canWrite && selectedApp.status === "rejected" && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "¿Reactivar esta aplicacion? Pasa a aprobado y se le enviara el correo de aprobacion. El estado de confirmacion arranca en false."
                        )
                      ) {
                        updateStatus(selectedApp.id, "approved");
                      }
                    }}
                    className="flex-1 min-w-[140px] bg-green-600 text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:bg-green-700 transition-colors"
                  >
                    Reactivar (aprobar)
                  </button>
                )}

                {canWrite && selectedApp.status !== "pending" && (
                  <button
                    onClick={() => resendEmail(selectedApp.id)}
                    disabled={resendingId === selectedApp.id}
                    className="flex-1 min-w-[140px] bg-white/10 text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingId === selectedApp.id ? "Reenviando..." : "Reenviar correo"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/70">
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "approved"
      ? "bg-green-500/20 text-green-400"
      : status === "rejected"
        ? "bg-red-500/20 text-red-400"
        : "bg-yellow-500/20 text-yellow-400";
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${tone}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function ConfirmedBadge({ confirmed }: { confirmed: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
        confirmed
          ? "bg-green-500/20 text-green-400"
          : "bg-white/5 text-white/40 border border-white/10"
      }`}
    >
      {confirmed ? "✓ Confirmado" : "○ No confirmado"}
    </span>
  );
}

function Tile({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "neutral" | "yellow" | "green" | "red";
}) {
  const accent =
    tone === "yellow"
      ? "text-yellow-400"
      : tone === "green"
        ? "text-green-400"
        : tone === "red"
          ? "text-red-400"
          : "text-white";
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="text-[10px] font-mono uppercase tracking-wide text-white/50">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent}`}>{value}</div>
      {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}

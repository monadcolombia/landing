"use client";

import { useState, useEffect } from "react";
import type { Application } from "@prisma/client";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
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
  const [selectedRole, setSelectedRole] = useState<"all" | "mentor" | "judge" | "volunteer">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "approved" | "rejected">(
    "all"
  );
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
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
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, selectedStatus]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Error al actualizar estado");

      await fetchApplications();
      setSelectedApp(null);
      alert(`Aplicación ${STATUS_LABELS[status]?.toLowerCase() || status} exitosamente`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error al actualizar estado");
    }
  };

  const [resendingId, setResendingId] = useState<string | null>(null);

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

  const filteredCount = {
    all: applications.length,
    mentor: applications.filter((a) => a.role === "mentor").length,
    judge: applications.filter((a) => a.role === "judge").length,
    volunteer: applications.filter((a) => a.role === "volunteer").length,
    pending: applications.filter((a) => a.status === "pending").length,
  };

  return (
    <div className="space-y-6">
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
            onClick={fetchApplications}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-mono uppercase tracking-wide text-white/90 mb-2">
              Rol
            </label>
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as "all" | "mentor" | "judge" | "volunteer")
              }
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-monad-primary"
            >
              <option value="all">Todos ({filteredCount.all})</option>
              <option value="mentor">Mentores ({filteredCount.mentor})</option>
              <option value="judge">Jurados ({filteredCount.judge})</option>
              <option value="volunteer">Voluntarios ({filteredCount.volunteer})</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-mono uppercase tracking-wide text-white/90 mb-2">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as "all" | "pending" | "approved" | "rejected")
              }
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-monad-primary"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes ({filteredCount.pending})</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
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
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/70">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/70">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/70">
                    Ciudad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/70">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/70">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-white/70">
                    Acciones
                  </th>
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
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          app.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : app.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
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
              {selectedApp.status === "pending" ? (
                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={() => updateStatus(selectedApp.id, "approved")}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:bg-green-700 transition-colors"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp.id, "rejected")}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:bg-red-700 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              ) : (
                <div className="pt-6 border-t border-white/10">
                  <button
                    onClick={() => resendEmail(selectedApp.id)}
                    disabled={resendingId === selectedApp.id}
                    className="w-full bg-white/10 text-white px-6 py-3 rounded-full font-mono uppercase tracking-wide hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingId === selectedApp.id ? "Reenviando..." : "Reenviar correo"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CaseView, LeadStatus, Profile } from "@/lib/supabase/types";
import { setLeadStatus, assignCaseResponsible } from "@/lib/case-actions";
import { formatDate } from "@/lib/format";
import { WhatsAppModal } from "@/components/WhatsAppModal";
import { ContextMenu } from "@/components/ContextMenu";

interface LeadKanbanBoardProps {
  leads: CaseView[];
  currentProfile: Profile;
  profiles: Profile[];
}

const COLUMNS: { id: LeadStatus; title: string; hint: string; color: string }[] = [
  {
    id: "primer_contacto",
    title: "📥 Primer Mensaje (Ads)",
    hint: "Ingresó por publicidad · Aguarda 1ª interacción",
    color: "var(--accent)",
  },
  {
    id: "reiterado",
    title: "🔄 Re-contacto (>24hs)",
    hint: "No volvió a responder el 1er mensaje",
    color: "var(--warn)",
  },
  {
    id: "esperando_confirmacion",
    title: "💬 En Conversación",
    hint: "Asesorado · Esperando doc / confirmación",
    color: "#2563eb",
  },
  {
    id: "ingreso",
    title: "✅ Listo p/ Trámite",
    hint: "Confirmó y mandó documentación",
    color: "var(--ok)",
  },
  {
    id: "no_va",
    title: "⛔ No Va",
    hint: "Descartado / Sin interés",
    color: "var(--ink-faint)",
  },
];

export function LeadKanbanBoard({ leads, currentProfile, profiles }: LeadKanbanBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedLeadForWA, setSelectedLeadForWA] = useState<CaseView | null>(null);
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    lead: CaseView;
  } | null>(null);

  const handleStatusChange = (caseId: string, newStatus: LeadStatus) => {
    startTransition(async () => {
      await setLeadStatus(caseId, newStatus);
    });
  };

  const handleAssign = (caseId: string, profileId: string) => {
    startTransition(async () => {
      await assignCaseResponsible(caseId, profileId);
    });
  };

  return (
    <div className={`kanban-container ${isPending ? "loading" : ""}`}>
      <div className="kanban-grid">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.lead_status === col.id);
          return (
            <div className="kanban-col" key={col.id}>
              <div className="kanban-col-head" style={{ borderTopColor: col.color }}>
                <div className="title-row">
                  <span className="col-title">{col.title}</span>
                  <span className="col-count">{colLeads.length}</span>
                </div>
                <span className="col-hint">{col.hint}</span>
              </div>

              <div className="kanban-col-body">
                {colLeads.map((lead) => {
                  const daysNoResp = lead.dias_sin_respuesta ?? 0;
                  const isStalled = (col.id === "primer_contacto" || col.id === "reiterado") && daysNoResp >= 1;

                  return (
                    <div
                      className={`kanban-card ${isStalled ? "stalled" : ""}`}
                      key={lead.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenuState({ x: e.clientX, y: e.clientY, lead });
                      }}
                    >
                      <div className="card-top">
                        <span className="card-phone">{lead.phone}</span>
                        <span className="card-date">{formatDate(lead.created_at)}</span>
                      </div>

                      {lead.company_name && (
                        <div className="card-meta">
                          <span className="tag company">{lead.company_name}</span>
                          {lead.provincia && <span className="tag provincia">{lead.provincia}</span>}
                        </div>
                      )}

                      {lead.source && (
                        <div className="card-source">
                          <span className="source-label">Fuente:</span> {lead.source}
                        </div>
                      )}

                      {lead.observations && <div className="card-obs">{lead.observations}</div>}

                      <div className="card-status-bar">
                        <span className={`days-badge ${daysNoResp > 3 ? "urgent" : ""}`}>
                          ⏱️ {daysNoResp === 0 ? "Hoy" : `${daysNoResp}d sin resp.`}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedLeadForWA(lead)}
                          className="btn-wa"
                          title="Enviar mensaje por WhatsApp (Auto o a mano)"
                        >
                          💬 Mensaje WA
                        </button>
                      </div>

                      <div className="card-actions">
                        {col.id === "primer_contacto" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(lead.id, "reiterado")}
                              className="btn-action warn"
                              disabled={isPending}
                            >
                              Marcar Reiterado
                            </button>
                            <button
                              onClick={() => handleStatusChange(lead.id, "esperando_confirmacion")}
                              className="btn-action primary"
                              disabled={isPending}
                            >
                              Respondió
                            </button>
                          </>
                        )}

                        {col.id === "reiterado" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(lead.id, "esperando_confirmacion")}
                              className="btn-action primary"
                              disabled={isPending}
                            >
                              Avanzar a Asesorado
                            </button>
                            <button
                              onClick={() => handleStatusChange(lead.id, "no_va")}
                              className="btn-action danger"
                              disabled={isPending}
                            >
                              No Va
                            </button>
                          </>
                        )}

                        {col.id === "esperando_confirmacion" && (
                          <>
                            <Link href={`/tramite/nuevo?from=${lead.id}`} className="btn-action success">
                              Pasar a Trámite ➔
                            </Link>
                            <button
                              onClick={() => handleStatusChange(lead.id, "no_va")}
                              className="btn-action danger"
                              disabled={isPending}
                            >
                              No Va
                            </button>
                          </>
                        )}

                        {col.id === "ingreso" && (
                          <Link href={`/tramite/nuevo?from=${lead.id}`} className="btn-action success">
                            Ver o Crear Trámite
                          </Link>
                        )}

                        {col.id === "no_va" && (
                          <button
                            onClick={() => handleStatusChange(lead.id, "primer_contacto")}
                            className="btn-action neutral"
                            disabled={isPending}
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colLeads.length === 0 && <div className="empty-col">Sin leads en este estado</div>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedLeadForWA && (
        <WhatsAppModal
          lead={selectedLeadForWA}
          currentProfile={currentProfile}
          profiles={profiles}
          onClose={() => setSelectedLeadForWA(null)}
        />
      )}

      {contextMenuState && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          lead={contextMenuState.lead}
          profiles={profiles}
          onClose={() => setContextMenuState(null)}
          onSelectWA={(lead) => setSelectedLeadForWA(lead)}
          onSetStatus={(caseId, status) => handleStatusChange(caseId, status)}
          onAssign={(caseId, profileId) => handleAssign(caseId, profileId)}
          onViewDetail={(caseId) => router.push(`/casos/${caseId}`)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import type { CaseView, Company, Profile } from "@/lib/supabase/types";
import { setLeadStatus, createLead } from "@/lib/case-actions";
import { formatDate } from "@/lib/format";
import { LeadKanbanBoard } from "@/components/LeadKanbanBoard";

interface LeadsViewContainerProps {
  leads: CaseView[];
  companies: Company[];
  currentProfile: Profile;
  profiles: Profile[];
}

const STATUS_CHIP: Record<string, { cls: string; label: string }> = {
  primer_contacto: { cls: "warn", label: "primer contacto (ads)" },
  reiterado: { cls: "warn", label: "reiterado (>24hs)" },
  esperando_confirmacion: { cls: "warn", label: "esperando confirmación" },
  no_va: { cls: "neutral", label: "no va" },
  ingreso: { cls: "ok", label: "ingresó" },
};

export function LeadsViewContainer({
  leads,
  companies,
  currentProfile,
  profiles,
}: LeadsViewContainerProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [showInfo, setShowInfo] = useState(false);

  const sinRespuesta = leads.filter(
    (l) => (l.lead_status === "primer_contacto" || l.lead_status === "reiterado" || l.lead_status === "esperando_confirmacion") && (l.dias_sin_respuesta ?? 0) >= 1
  );

  return (
    <div>
      <div className="panel-head" style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <h2>Leads / Consultas</h2>
            <span className="hint">Bandeja de entrada y re-contacto de anuncios</span>
          </div>
          <button className="info-btn" onClick={() => setShowInfo(!showInfo)}>
            {showInfo ? "Cerrar info" : "💡 ¿Cómo funciona esto?"}
          </button>
        </div>
        
        {showInfo && (
          <div className="info-popover" style={{ left: 0, top: "100%", marginTop: 8 }}>
            <h4>Gestión de Leads (Prospectos)</h4>
            <p>Este tablero te permite organizar las consultas entrantes por publicidad y hacerles seguimiento hasta que se conviertan en casos reales.</p>
            <ul>
              <li><strong>Primer Contacto:</strong> Leads nuevos que ingresaron y aún no respondieron.</li>
              <li><strong>Reiterado:</strong> Leads a los que se les envió un segundo mensaje tras 24hs.</li>
              <li><strong>Esperando Confirmación:</strong> Leads interesados que deben enviar documentación.</li>
              <li><strong>Ingresó:</strong> Pasaron a Trámite exitosamente.</li>
            </ul>
            <p>💡 Tip: Usá el botón verde de WhatsApp en cada tarjeta para enviar plantillas automáticas usando tu nombre.</p>
          </div>
        )}

        <div className="view-switcher">
          <button
            className={`view-btn ${viewMode === "kanban" ? "active" : ""}`}
            onClick={() => setViewMode("kanban")}
          >
            📋 Tablero Kanban
          </button>
          <button
            className={`view-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
          >
            📊 Tabla Lista
          </button>
        </div>
      </div>

      {sinRespuesta.length > 0 && (
        <div className="banner warn">
          <strong>{sinRespuesta.length}</strong>&nbsp;lead(s) sin respuesta desde el primer contacto de publicidad. Usá el botón de WhatsApp en el Kanban para re-contactar.
        </div>
      )}

      <div className="form-card">
        <h3>Nuevo lead (Ingreso Manual o Anuncio)</h3>
        <form action={createLead}>
          <div className="fgrid-form">
            <div className="field-group">
              <label htmlFor="phone">Celular</label>
              <input id="phone" name="phone" placeholder="11 5544-1234" required />
            </div>
            <div className="field-group">
              <label htmlFor="provincia">Provincia</label>
              <input id="provincia" name="provincia" defaultValue="Bs. As." />
            </div>
            <div className="field-group">
              <label htmlFor="company_id">Compañía</label>
              <select id="company_id" name="company_id">
                <option value="">—</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="source">Fuente / Link Ad</label>
              <input id="source" name="source" placeholder="Link Ad · Facebook Mitos" />
            </div>
            <div className="field-group">
              <label htmlFor="lead_status">Estado inicial</label>
              <select id="lead_status" name="lead_status" defaultValue="primer_contacto">
                <option value="primer_contacto">Primer Contacto (Ads)</option>
                <option value="esperando_confirmacion">Esperando Confirmación</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="observations">Observación / Nota inicial</label>
              <input id="observations" name="observations" placeholder="Tocó link ad, enviado 1er mensaje..." />
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
              <input type="checkbox" name="asesorado" /> ya asesorado
            </label>
            <button type="submit" className="btn">
              Agregar lead
            </button>
          </div>
        </form>
      </div>

      {viewMode === "kanban" ? (
        <LeadKanbanBoard leads={leads} currentProfile={currentProfile} profiles={profiles} />
      ) : (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Celular</th>
                <th>Provincia</th>
                <th>Compañía</th>
                <th>Fuente / Ad Link</th>
                <th>Estado</th>
                <th>Días sin resp.</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const status = STATUS_CHIP[lead.lead_status] ?? STATUS_CHIP.primer_contacto;
                const urgent = (lead.dias_sin_respuesta ?? 0) >= 2;
                return (
                  <tr key={lead.id}>
                    <td className="dim">{formatDate(lead.created_at)}</td>
                    <td className="field">{lead.phone}</td>
                    <td>{lead.provincia ?? "—"}</td>
                    <td>{lead.company_name ?? "—"}</td>
                    <td className="dim">{lead.source ?? "—"}</td>
                    <td>
                      <span className={`chip ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className={`num ${urgent ? "urgent" : "dim"}`}>{lead.dias_sin_respuesta ?? "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/tramite/nuevo?from=${lead.id}`} className="btn secondary" style={{ padding: "5px 10px", fontSize: 11 }}>
                          pasar a trámite
                        </Link>
                        <form action={setLeadStatus.bind(null, lead.id, "reiterado")}>
                          <button className="btn secondary" style={{ padding: "5px 10px", fontSize: 11 }}>
                            reiterar
                          </button>
                        </form>
                        <form action={setLeadStatus.bind(null, lead.id, "no_va")}>
                          <button className="btn secondary" style={{ padding: "5px 10px", fontSize: 11 }}>
                            no va
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={8} className="dim">
                    No hay leads todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

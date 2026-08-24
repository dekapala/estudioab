"use client";

import { useState } from "react";
import type { CaseView, Profile } from "@/lib/supabase/types";
import { addFollowup } from "@/lib/case-actions";

interface WhatsAppModalProps {
  lead: CaseView;
  currentProfile: Profile;
  profiles: Profile[];
  onClose: () => void;
}

export function WhatsAppModal({ lead, currentProfile, profiles, onClose }: WhatsAppModalProps) {
  // Permitir cambiar o ver el usuario activo para simular la experiencia multi-usuario
  const [activeUser, setActiveUser] = useState<Profile>(currentProfile);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("recontacto_1");
  const [customText, setCustomText] = useState<string>("");

  const templates: Record<string, { title: string; hint: string; getText: () => string }> = {
    recontacto_1: {
      title: "📲 1er Re-contacto (Anuncio Ads)",
      hint: "Re-enganche para leads que no volvieron a responder el 1er mensaje",
      getText: () =>
        `Hola! Soy ${activeUser.full_name} (${activeUser.role === "abogada" ? "Abogada" : "Asesor/a"}) de Giuli Boga & Asoc. Te escribo por tu consulta sobre el accidente de tránsito para saber si pudiste revisar la información. ¿Cómo estás?`,
    },
    doc_incompleta: {
      title: "📄 Solicitud de Documentación",
      hint: "Para reclamar fotos, DNI, cédula verde o denuncia",
      getText: () =>
        `Hola! Te habla ${activeUser.full_name} del estudio Giuli Boga & Asoc. Te contacto respecto a tu reclamo contra ${lead.company_name ?? "la compañía"}. Necesitamos completar la documentación para avanzar. ¿Me la podés enviar por acá?`,
    },
    acuerdo_cerrado: {
      title: "💰 Notificación de Acuerdo / Cobro",
      hint: "Aviso de cierre de acuerdo o fecha estimada de pago",
      getText: () =>
        `Hola! Te saluda ${activeUser.full_name} de Giuli Boga & Asoc. Queríamos informarte que cerramos el acuerdo del caso ${lead.autos ?? "tu siniestro"}. En breve te pasamos el detalle de fechas estimadas de cobro.`,
    },
    custom: {
      title: "✍️ Escribir a mano (Mensaje personalizado)",
      hint: "Escribí un mensaje completamente a mano sin plantilla",
      getText: () => customText,
    },
  };

  const currentMessageText = selectedTemplateKey === "custom" ? customText : templates[selectedTemplateKey]?.getText() ?? "";

  const handleSend = async () => {
    const rawPhone = lead.phone.replace(/[^0-9]/g, "");
    const phone = rawPhone.startsWith("54") ? rawPhone : `549${rawPhone}`;
    const encoded = encodeURIComponent(currentMessageText);
    const waUrl = `https://wa.me/${phone}?text=${encoded}`;

    // Registrar automáticamente en la línea de tiempo el seguimiento enviado
    try {
      await addFollowup(
        lead.id,
        `WA enviado por ${activeUser.full_name} (${activeUser.role}): "${currentMessageText.slice(0, 70)}..."`
      );
    } catch {
      // Ignorar error no crítico de revalidación
    }

    // Abrir WhatsApp Web / App
    window.open(waUrl, "_blank");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Mensaje Automático / Personalizado por WhatsApp</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Identificación del usuario activo */}
          <div className="user-context-banner">
            <span className="lbl">Operando como:</span>
            <select
              value={activeUser.id}
              onChange={(e) => {
                const selected = profiles.find((p) => p.id === e.target.value);
                if (selected) setActiveUser(selected);
              }}
              className="user-select"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.role.toUpperCase()})
                </option>
              ))}
            </select>
            <span className="user-tag">{activeUser.role}</span>
          </div>

          <div className="lead-summary-bar">
            <span>
              <strong>Contacto:</strong> {lead.phone}
            </span>
            {lead.company_name && (
              <span>
                <strong>Cía:</strong> {lead.company_name}
              </span>
            )}
            {lead.source && (
              <span>
                <strong>Fuente:</strong> {lead.source}
              </span>
            )}
          </div>

          {/* Plantillas recomendadas */}
          <div className="template-section">
            <label className="section-label">Plantillas recomendadas para {activeUser.full_name}:</label>
            <div className="template-list">
              {Object.entries(templates).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  className={`template-item ${selectedTemplateKey === key ? "active" : ""}`}
                  onClick={() => setSelectedTemplateKey(key)}
                >
                  <span className="t-title">{t.title}</span>
                  <span className="t-hint">{t.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Área de texto preview / custom */}
          <div className="message-preview-box">
            <label className="section-label">
              {selectedTemplateKey === "custom" ? "Mensaje a mano:" : "Vista previa del mensaje generado:"}
            </label>
            {selectedTemplateKey === "custom" ? (
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Escribí aquí tu mensaje a mano..."
                className="custom-textarea"
                rows={4}
              />
            ) : (
              <div className="preview-text-content">{currentMessageText}</div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-wa-send"
            onClick={handleSend}
            disabled={!currentMessageText.trim()}
          >
            💬 Abrir en WhatsApp y Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

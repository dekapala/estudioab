"use client";

import { useEffect, useRef } from "react";
import type { CaseView, LeadStatus, Profile } from "@/lib/supabase/types";

interface ContextMenuProps {
  x: number;
  y: number;
  lead: CaseView;
  profiles: Profile[];
  onClose: () => void;
  onSelectWA: (lead: CaseView) => void;
  onSetStatus: (caseId: string, status: LeadStatus) => void;
  onAssign: (caseId: string, profileId: string) => void;
  onViewDetail: (caseId: string) => void;
}

export function ContextMenu({
  x,
  y,
  lead,
  profiles,
  onClose,
  onSelectWA,
  onSetStatus,
  onAssign,
  onViewDetail,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates if menu overflows window
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 260);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
    >
      <div className="menu-header">
        <span className="phone">{lead.phone}</span>
        {lead.responsible_name && <span className="resp">👤 {lead.responsible_name}</span>}
      </div>

      <div className="menu-divider" />

      <button
        className="menu-item primary"
        onClick={() => {
          onSelectWA(lead);
          onClose();
        }}
      >
        💬 Enviar WhatsApp (Auto / A mano)
      </button>

      {lead.stage === "lead" && (
        <>
          <button
            className="menu-item"
            onClick={() => {
              onSetStatus(lead.id, "reiterado");
              onClose();
            }}
          >
            🔄 Marcar Reiterado (&gt;24h)
          </button>

          <button
            className="menu-item"
            onClick={() => {
              onSetStatus(lead.id, "esperando_confirmacion");
              onClose();
            }}
          >
            💬 En Conversación / Asesorado
          </button>

          <button
            className="menu-item success"
            onClick={() => {
              onViewDetail(lead.id);
              onClose();
            }}
          >
            ➔ Pasar a Trámite
          </button>
        </>
      )}

      <div className="menu-divider" />

      <div className="menu-submenu-title">Asignar Responsable:</div>
      {profiles.map((p) => (
        <button
          key={p.id}
          className={`menu-item sub ${lead.responsible_id === p.id ? "active" : ""}`}
          onClick={() => {
            onAssign(lead.id, p.id);
            onClose();
          }}
        >
          👤 {p.full_name} ({p.role.toUpperCase()})
        </button>
      ))}

      <div className="menu-divider" />

      {lead.stage === "lead" && (
        <button
          className="menu-item danger"
          onClick={() => {
            onSetStatus(lead.id, "no_va");
            onClose();
          }}
        >
          ⛔ Marcar No Va
        </button>
      )}

      <button
        className="menu-item"
        onClick={() => {
          onViewDetail(lead.id);
          onClose();
        }}
      >
        📄 Ver Ficha Completa
      </button>
    </div>
  );
}

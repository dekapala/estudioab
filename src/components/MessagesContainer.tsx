"use client";

import { useState } from "react";

type Channel = "all" | "whatsapp" | "facebook" | "instagram";

interface Thread {
  id: string;
  name: string;
  channel: Exclude<Channel, "all">;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isFirstInteraction: boolean;
  hoursSinceFirstMessage: number;
}

// Datos de prueba (mock)
const MOCK_THREADS: Thread[] = [
  {
    id: "1",
    name: "María Laura Gómez",
    channel: "whatsapp",
    lastMessage: "Hola, necesito consultar por un despido.",
    timestamp: "10:23 AM",
    unread: 1,
    isFirstInteraction: true,
    hoursSinceFirstMessage: 26, // > 24h
  },
  {
    id: "2",
    name: "Carlos Sanchez",
    channel: "facebook",
    lastMessage: "¿Dónde están ubicados?",
    timestamp: "Ayer",
    unread: 1,
    isFirstInteraction: true,
    hoursSinceFirstMessage: 30, // > 24h
  },
  {
    id: "3",
    name: "Lucía Fernández",
    channel: "instagram",
    lastMessage: "Gracias por la información.",
    timestamp: "11:45 AM",
    unread: 0,
    isFirstInteraction: false,
    hoursSinceFirstMessage: 2,
  },
  {
    id: "4",
    name: "Diego Maradona",
    channel: "whatsapp",
    lastMessage: "Quiero iniciar la sucesión.",
    timestamp: "Lunes",
    unread: 0,
    isFirstInteraction: false,
    hoursSinceFirstMessage: 120,
  },
  {
    id: "5",
    name: "Julieta Prandi",
    channel: "instagram",
    lastMessage: "¿Me pasás el presupuesto?",
    timestamp: "09:12 AM",
    unread: 2,
    isFirstInteraction: true,
    hoursSinceFirstMessage: 4,
  },
];

const ICONS = {
  whatsapp: "💬 WA",
  facebook: "📘 FB",
  instagram: "📸 IG",
};

export function MessagesContainer() {
  const [filter, setFilter] = useState<Channel>("all");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const filteredThreads = MOCK_THREADS.filter(
    (t) => filter === "all" || t.channel === filter
  );

  const activeThread = MOCK_THREADS.find((t) => t.id === activeThreadId);

  const unattendedCount = MOCK_THREADS.filter(
    (t) => t.isFirstInteraction && t.hoursSinceFirstMessage > 24
  ).length;

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      {/* LEFT SIDEBAR: Inbox List */}
      <div
        style={{
          width: "360px",
          borderRight: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface-sunken)",
        }}
      >
        {/* Header & Filter */}
        <div style={{ padding: "20px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
          <h2 style={{ margin: "0 0 16px", fontFamily: "var(--font-display)", fontSize: 20 }}>
            Bandeja de Entrada
          </h2>

          {unattendedCount > 0 && (
            <div className="banner danger" style={{ padding: "8px 12px", marginBottom: 16, fontSize: 13, gap: 8 }}>
              ⚠️ <strong>{unattendedCount}</strong> mensajes sin respuesta (+24hs)
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
            <button
              className={`view-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
              style={{ fontSize: 11, padding: "6px 12px" }}
            >
              Todos
            </button>
            <button
              className={`view-btn ${filter === "whatsapp" ? "active" : ""}`}
              onClick={() => setFilter("whatsapp")}
              style={{ fontSize: 11, padding: "6px 12px" }}
            >
              WhatsApp
            </button>
            <button
              className={`view-btn ${filter === "instagram" ? "active" : ""}`}
              onClick={() => setFilter("instagram")}
              style={{ fontSize: 11, padding: "6px 12px" }}
            >
              Instagram
            </button>
            <button
              className={`view-btn ${filter === "facebook" ? "active" : ""}`}
              onClick={() => setFilter("facebook")}
              style={{ fontSize: 11, padding: "6px 12px" }}
            >
              Facebook
            </button>
          </div>
        </div>

        {/* Thread List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredThreads.map((thread) => {
            const isUrgent = thread.isFirstInteraction && thread.hoursSinceFirstMessage > 24;
            const isActive = activeThreadId === thread.id;

            return (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--line)",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                  cursor: "pointer",
                  borderLeft: isUrgent ? "4px solid var(--danger)" : "4px solid transparent",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12 }}>{ICONS[thread.channel]}</span>
                    <strong style={{ fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-display)" }}>
                      {thread.name}
                    </strong>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>{thread.timestamp}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: isActive ? "var(--accent)" : "var(--ink-soft)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "240px",
                      fontWeight: thread.unread > 0 ? 600 : 400,
                    }}
                  >
                    {thread.lastMessage}
                  </p>
                  {thread.unread > 0 && (
                    <span
                      style={{
                        background: "var(--accent)",
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                        padding: "2px 6px",
                        borderRadius: "10px",
                      }}
                    >
                      {thread.unread}
                    </span>
                  )}
                </div>
                {isUrgent && (
                  <span style={{ display: "inline-block", marginTop: 8, fontSize: 10, color: "var(--danger)", fontWeight: 600, background: "var(--danger-soft)", padding: "2px 6px", borderRadius: 4 }}>
                    Sin respuesta por {Math.floor(thread.hoursSinceFirstMessage)}hs
                  </span>
                )}
              </div>
            );
          })}
          {filteredThreads.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-faint)", fontSize: 14 }}>
              No hay mensajes en esta bandeja.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Chat UI */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--surface)" }}>
        {activeThread ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-display)" }}>
                  {activeThread.name}
                </h3>
                <span style={{ fontSize: 12, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
                  {ICONS[activeThread.channel]} vía {activeThread.channel}
                </span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn secondary" style={{ fontSize: 12, padding: "8px 14px" }}>
                  Resolver
                </button>
                <button className="btn" style={{ fontSize: 12, padding: "8px 14px" }}>
                  Pasar a Leads
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div style={{ flex: 1, padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24, background: "var(--paper)" }}>
              {/* Dummy conversation */}
              <div style={{ alignSelf: "flex-start", maxWidth: "70%" }}>
                <div style={{ background: "var(--surface)", padding: "14px 16px", borderRadius: "0 12px 12px 12px", border: "1px solid var(--line)", fontSize: 14, lineHeight: 1.5, color: "var(--ink)" }}>
                  {activeThread.lastMessage}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 6, marginLeft: 4 }}>
                  {activeThread.timestamp}
                </div>
              </div>

              {activeThread.isFirstInteraction && activeThread.hoursSinceFirstMessage > 24 && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <span style={{ background: "var(--danger-soft)", color: "var(--danger)", fontSize: 12, padding: "6px 12px", borderRadius: 20, fontWeight: 500 }}>
                    ⚠️ Este mensaje superó las 24hs sin ser respondido.
                  </span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div style={{ padding: "20px 32px", borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1, background: "var(--surface-sunken)", borderRadius: 12, border: "1px solid var(--line)", padding: "4px" }}>
                   <textarea
                    placeholder={`Escribí tu respuesta por ${activeThread.channel}...`}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      padding: "12px",
                      resize: "none",
                      outline: "none",
                      minHeight: "60px",
                      fontFamily: "var(--font-body)",
                      fontSize: 14
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px 8px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn secondary" style={{ padding: "4px 8px", fontSize: 12, background: "transparent", border: "none" }}>📎 Adjuntar</button>
                      <button className="btn secondary" style={{ padding: "4px 8px", fontSize: 12, background: "transparent", border: "none" }}>⚡ Plantillas</button>
                    </div>
                  </div>
                </div>
                <button className="btn" style={{ padding: "16px 24px", height: "fit-content" }}>
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, color: "var(--ink-faint)" }}>
            <div style={{ fontSize: 48 }}>📬</div>
            <p style={{ fontSize: 16 }}>Seleccioná una conversación para empezar a chatear.</p>
          </div>
        )}
      </div>
    </div>
  );
}

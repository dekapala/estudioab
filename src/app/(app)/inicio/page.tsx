import Link from "next/link";

export default function InicioPage() {
  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Panel de Inicio</h2>
          <span className="hint">Seleccioná a dónde querés ir</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 20 }}>
        
        <Link href="/mensajes" style={{ display: "block" }}>
          <div className="tile" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", borderTop: "4px solid var(--accent)" }}>
            <div style={{ fontSize: 32 }}>💬</div>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-display)", color: "var(--ink)" }}>Mensajería Central</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>Gestioná todos los chats de WhatsApp, Instagram y Facebook en un solo lugar.</p>
            </div>
          </div>
        </Link>

        <Link href="/leads" style={{ display: "block" }}>
          <div className="tile" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", borderTop: "4px solid var(--warn)" }}>
            <div style={{ fontSize: 32 }}>📥</div>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-display)", color: "var(--ink)" }}>Leads / Consultas</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>Bandeja de entrada de prospectos y leads generados por anuncios.</p>
            </div>
          </div>
        </Link>

        <Link href="/tramite" style={{ display: "block" }}>
          <div className="tile" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", borderTop: "4px solid var(--ok)" }}>
            <div style={{ fontSize: 32 }}>⚖️</div>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-display)", color: "var(--ink)" }}>Casos en Trámite</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>Seguimiento de clientes activos, documentación y etapas legales.</p>
            </div>
          </div>
        </Link>

        <Link href="/cobros" style={{ display: "block" }}>
          <div className="tile" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", borderTop: "4px solid #8b5cf6" }}>
            <div style={{ fontSize: 32 }}>💰</div>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontFamily: "var(--font-display)", color: "var(--ink)" }}>Cobros y Honorarios</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-soft)" }}>Acuerdos de pago, cuotas pendientes y liquidaciones.</p>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}

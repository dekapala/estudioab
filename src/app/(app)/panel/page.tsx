import { getDashboard } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

export default async function PanelPage() {
  const d = await getDashboard();
  const maxBucket = Math.max(d.bucketVencido, d.bucket30, d.bucket60, 1);
  const maxFuente = Math.max(...(d.fuentes.map(([, n]) => n) as number[]), 1);

  return (
    <section>
      <div className="panel-head">
        <h2>Panel de control</h2>
        <span className="hint">Lo que hoy se calculaba recorriendo pestañas</span>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="lbl">Por cobrar (total)</div>
          <div className="val">{formatCurrency(d.porCobrarTotal)}</div>
          <div className="sub">acuerdos pendientes</div>
        </div>
        <div className="tile">
          <div className="lbl">Vencido sin cobrar</div>
          <div className="val" style={{ color: "var(--danger)" }}>
            {formatCurrency(d.vencidoTotal)}
          </div>
          <div className="sub">{d.vencidosCount} caso(s)</div>
        </div>
        <div className="tile">
          <div className="lbl">Audiencias próx. 30 días</div>
          <div className="val">{d.audienciasProximas.length}</div>
          <div className="sub">{d.audienciasProximas.map((c: any) => c.autos).filter(Boolean).join(" · ") || "—"}</div>
        </div>
        <div className="tile">
          <div className="lbl">Leads sin respuesta &gt;5 días</div>
          <div className="val" style={{ color: "var(--warn)" }}>
            {d.leadsSinRespuesta.length}
          </div>
          <div className="sub">de {d.leadsActivos} leads activos</div>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-box">
          <h3>Por cobrar según vencimiento</h3>
          <div className="bars">
            <div className="bar-col">
              <span className="amt">{formatCurrency(d.bucketVencido)}</span>
              <div className="bar" style={{ height: `${(d.bucketVencido / maxBucket) * 100}%`, background: "var(--danger)" }} />
              <span className="lbl">Vencido</span>
            </div>
            <div className="bar-col">
              <span className="amt">{formatCurrency(d.bucket30)}</span>
              <div className="bar" style={{ height: `${(d.bucket30 / maxBucket) * 100}%`, background: "var(--warn)" }} />
              <span className="lbl">≤ 30 días</span>
            </div>
            <div className="bar-col">
              <span className="amt">{formatCurrency(d.bucket60)}</span>
              <div className="bar" style={{ height: `${(d.bucket60 / maxBucket) * 100}%`, background: "var(--ok)" }} />
              <span className="lbl">31–60 días</span>
            </div>
          </div>
        </div>

        <div className="chart-box">
          <h3>Leads por fuente</h3>
          <div className="hbars">
            {d.fuentes.map(([fuente, n]) => (
              <div className="hbar-row" key={fuente}>
                <span className="name">{fuente}</span>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: `${(n / maxFuente) * 100}%` }} />
                </div>
                <span className="pct">{n}</span>
              </div>
            ))}
            {d.fuentes.length === 0 && <span className="dim">Sin datos todavía.</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

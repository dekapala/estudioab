import Link from "next/link";
import { getCobros } from "@/lib/data";
import { formatCurrency, formatDate, formatPct } from "@/lib/format";

const ESTADO_CHIP: Record<string, string> = {
  pendiente: "warn",
  parcial: "warn",
  vencido: "danger",
  cobrado: "ok",
};

export default async function CobrosPage() {
  const casos = await getCobros();
  const vencidos = casos.filter((c) => c.estado_cobro === "vencido");

  return (
    <section>
      <div className="panel-head">
        <h2>Cobros</h2>
        <span className="hint">Acuerdos cerrados, pacto y honorarios</span>
      </div>

      {vencidos.length > 0 && (
        <div className="banner danger">
          <strong>{vencidos.length}</strong>&nbsp;caso(s) vencido(s) sin marcar como cobrado
        </div>
      )}

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Autos</th>
              <th>Compañía</th>
              <th>Acuerdo</th>
              <th>% pacto</th>
              <th>Monto pacto</th>
              <th>% hon.</th>
              <th>Monto hon.</th>
              <th>Pago pacto</th>
              <th>Pago hon.</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {casos.map((c) => (
              <tr key={c.id}>
                <td className="field strong">{c.autos ?? "—"}</td>
                <td>{c.company_name ?? "—"}</td>
                <td className="num">{formatCurrency(c.monto_acuerdo)}</td>
                <td className="num">{formatPct(c.pct_pacto)}</td>
                <td className="num">{formatCurrency(c.monto_pacto)}</td>
                <td className="num">{formatPct(c.pct_honorarios ?? c.default_fee_pct)}</td>
                <td className="num">{formatCurrency(c.monto_honorarios)}</td>
                <td className={`num ${c.estado_cobro === "vencido" ? "urgent" : "dim"}`}>
                  {formatDate(c.fecha_pago_real_pacto ?? c.fecha_pago_est_pacto)}
                </td>
                <td className={`num ${c.estado_cobro === "vencido" ? "urgent" : "dim"}`}>
                  {formatDate(c.fecha_pago_real_honorarios ?? c.fecha_pago_est_honorarios)}
                </td>
                <td>
                  <span className={`chip ${ESTADO_CHIP[c.estado_cobro ?? "pendiente"]}`}>{c.estado_cobro}</span>
                </td>
                <td>
                  <Link href={`/casos/${c.id}`} className="btn secondary" style={{ padding: "5px 10px", fontSize: 11 }}>
                    ver ficha
                  </Link>
                </td>
              </tr>
            ))}
            {casos.length === 0 && (
              <tr>
                <td colSpan={11} className="dim">
                  Todavía no hay acuerdos cerrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import Link from "next/link";
import { getTramite } from "@/lib/data";
import { formatDate, daysUntil } from "@/lib/format";

const CLAIM_LABEL: Record<string, string> = {
  dano_material: "Daño material",
  lesion: "Lesión",
  ambos: "Daño material + lesión",
};

export default async function TramitePage() {
  const casos = await getTramite();

  const audienciaProxima = casos.filter((c) => {
    const dias = daysUntil(c.audiencia_fecha);
    return dias !== null && dias >= 0 && dias <= 7;
  });
  const docIncompleta = casos.filter((c) => c.documental === "incompleta" && c.antiguedad_dias > 10);

  return (
    <section>
      <div className="panel-head">
        <h2>Casos en trámite</h2>
        <span className="hint">Expedientes con documentación en curso</span>
      </div>

      {(audienciaProxima.length > 0 || docIncompleta.length > 0) && (
        <div className="banner danger">
          {audienciaProxima.length > 0 && (
            <span>
              <strong>{audienciaProxima.length}</strong>&nbsp;audiencia(s) en menos de 7 días
            </span>
          )}
          {audienciaProxima.length > 0 && docIncompleta.length > 0 && " · "}
          {docIncompleta.length > 0 && (
            <span>
              <strong>{docIncompleta.length}</strong>&nbsp;documentación incompleta hace más de 10 días
            </span>
          )}
        </div>
      )}

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Autos</th>
              <th>Compañía</th>
              <th>Tipo de reclamo</th>
              <th>Documental</th>
              <th>Audiencia</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {casos.map((c) => {
              const audienciaDias = daysUntil(c.audiencia_fecha);
              return (
                <tr key={c.id}>
                  <td className="field strong">{c.autos ?? "—"}</td>
                  <td>{c.company_name ?? "—"}</td>
                  <td className="dim">{c.claim_type ? CLAIM_LABEL[c.claim_type] : "—"}</td>
                  <td>
                    <span className={`chip ${c.documental === "completa" ? "ok" : "danger"}`}>
                      {c.documental ?? "—"}
                    </span>
                  </td>
                  <td className={audienciaDias !== null && audienciaDias <= 7 ? "soon" : "dim"}>
                    {formatDate(c.audiencia_fecha)}
                  </td>
                  <td>
                    <span className="chip ok">{c.tramite_status ?? "en_tramite"}</span>
                  </td>
                  <td>
                    <Link href={`/casos/${c.id}`} className="btn secondary" style={{ padding: "5px 10px", fontSize: 11 }}>
                      ver ficha
                    </Link>
                  </td>
                </tr>
              );
            })}
            {casos.length === 0 && (
              <tr>
                <td colSpan={7} className="dim">
                  No hay casos en trámite todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

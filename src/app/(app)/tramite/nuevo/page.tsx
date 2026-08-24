import { notFound } from "next/navigation";
import { getCase } from "@/lib/data";
import { advanceToTramite } from "@/lib/case-actions";

export default async function NuevoTramitePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  if (!from) notFound();

  const lead = await getCase(from);
  if (!lead) notFound();

  return (
    <section>
      <div className="panel-head">
        <h2>Pasar a trámite</h2>
        <span className="hint">
          {lead.phone} · {lead.company_name ?? "sin compañía"}
        </span>
      </div>

      <div className="form-card">
        <h3>Folio 02 — datos del expediente</h3>
        <form action={advanceToTramite.bind(null, lead.id)}>
          <div className="fgrid-form">
            <div className="field-group">
              <label htmlFor="autos">Autos (carátula)</label>
              <input id="autos" name="autos" placeholder="Apellido Nombre c/ Compañía" required />
            </div>
            <div className="field-group">
              <label htmlFor="claim_type">Tipo de reclamo</label>
              <select id="claim_type" name="claim_type" defaultValue="dano_material">
                <option value="dano_material">Daño material</option>
                <option value="lesion">Lesión</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="documental">Documental</label>
              <select id="documental" name="documental" defaultValue="incompleta">
                <option value="incompleta">Incompleta</option>
                <option value="completa">Completa</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="mecanica">Mecánica del siniestro</label>
              <input id="mecanica" name="mecanica" />
            </div>
          </div>
          <button type="submit" className="btn" style={{ marginTop: 14 }}>
            Confirmar pase a trámite
          </button>
        </form>
      </div>
    </section>
  );
}

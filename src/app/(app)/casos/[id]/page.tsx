import { notFound } from "next/navigation";
import { getCase, getFollowups } from "@/lib/data";
import { addFollowup, advanceToCobro, registerPago, updateTramite } from "@/lib/case-actions";
import { formatCurrency, formatDate, formatPct } from "@/lib/format";

const CLAIM_LABEL: Record<string, string> = {
  dano_material: "Daño material",
  lesion: "Lesión",
  ambos: "Daño material + lesión",
};

export default async function CasoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [caso, followups] = await Promise.all([getCase(id), getFollowups(id)]);
  if (!caso) notFound();

  const stepStatus = (stage: "lead" | "tramite" | "cobro") => {
    const order = ["lead", "tramite", "cobro"];
    const current = order.indexOf(caso.stage === "cerrado" ? "cobro" : caso.stage);
    const target = order.indexOf(stage);
    if (target < current) return "done";
    if (target === current) return "active";
    return "pending";
  };

  return (
    <section>
      <div className="panel-head">
        <h2>{caso.autos ?? caso.phone}</h2>
        <span className="hint">Un caso, un registro — recorre las 3 etapas sin retipear datos</span>
      </div>

      <div className="stepper">
        <Step label="Lead" sub={formatDate(caso.created_at)} status={stepStatus("lead")} />
        <StepLine done={stepStatus("tramite") !== "pending"} />
        <Step label="Trámite" sub={caso.pacto_firmado ? `firmó ${formatDate(caso.pacto_firmado_fecha)}` : "—"} status={stepStatus("tramite")} />
        <StepLine done={stepStatus("cobro") !== "pending"} />
        <Step label="Cobro" sub={caso.estado_cobro ?? "—"} status={stepStatus("cobro")} />
      </div>

      {/* Folio 01 */}
      <div className={`fcard${caso.stage === "lead" ? " active" : ""}`}>
        <div className="fcard-head">
          <span className="t">Folio 01 — Lead</span>
          <span className="chip ok">{caso.lead_status}</span>
        </div>
        <div className="fcard-body">
          <div className="fgrid">
            <Field k="Celular" v={caso.phone} />
            <Field k="Provincia" v={caso.provincia ?? "—"} />
            <Field k="Compañía" v={caso.company_name ?? "—"} />
            <Field k="Fuente" v={caso.source ?? "—"} />
            <Field k="Habló con" v={caso.hablo_con ?? "—"} />
          </div>

          {followups.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="f k" style={{ marginBottom: 6 }}>
                Seguimiento
              </div>
              {followups.map((f) => (
                <div key={f.id} style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>
                  <span className="dim" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {formatDate(f.created_at)}
                  </span>{" "}
                  — {f.user_name ? <strong>[{f.user_name}] </strong> : ""}{f.note}
                </div>
              ))}
            </div>
          )}

          {caso.stage === "lead" && <AddFollowupForm caseId={caso.id} />}
        </div>
      </div>

      {/* Folio 02 */}
      {caso.stage !== "lead" && (
        <div className={`fcard${caso.stage === "tramite" ? " active" : ""}`}>
          <div className="fcard-head">
            <span className="t">Folio 02 — Trámite</span>
            <span className="chip ok">{caso.tramite_status ?? "en_tramite"}</span>
          </div>
          <div className="fcard-body">
            {caso.stage === "tramite" ? (
              <form action={updateTramite.bind(null, caso.id)}>
                <div className="fgrid-form">
                  <div className="field-group">
                    <label htmlFor="documental">Documental</label>
                    <select id="documental" name="documental" defaultValue={caso.documental ?? "incompleta"}>
                      <option value="incompleta">Incompleta</option>
                      <option value="completa">Completa</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="audiencia_fecha">Fecha de audiencia</label>
                    <input type="date" id="audiencia_fecha" name="audiencia_fecha" defaultValue={caso.audiencia_fecha ?? ""} />
                  </div>
                  <div className="field-group">
                    <label htmlFor="pacto_firmado_fecha">Pacto firmado el</label>
                    <input type="date" id="pacto_firmado_fecha" name="pacto_firmado_fecha" defaultValue={caso.pacto_firmado_fecha ?? ""} />
                  </div>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                    <input type="checkbox" name="pacto_firmado" defaultChecked={caso.pacto_firmado} /> pacto firmado
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                    <input type="checkbox" name="pago_cd" defaultChecked={caso.pago_cd} /> intimado por CD
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5 }}>
                    <input type="checkbox" name="reclamo_admin" defaultChecked={caso.reclamo_admin} /> reclamo admin. iniciado
                  </label>
                </div>
                <button type="submit" className="btn" style={{ marginTop: 14 }}>
                  Guardar
                </button>
              </form>
            ) : (
              <div className="fgrid">
                <Field k="Tipo de reclamo" v={caso.claim_type ? CLAIM_LABEL[caso.claim_type] : "—"} />
                <Field k="Documental" v={caso.documental ?? "—"} />
                <Field k="Pacto firmado" v={caso.pacto_firmado ? `Sí · ${formatDate(caso.pacto_firmado_fecha)}` : "No"} />
                <Field k="Reclamo administrativo" v={caso.reclamo_admin ? "Iniciado" : "No iniciado"} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Folio 03 */}
      {caso.stage === "tramite" && (
        <div className="fcard active">
          <div className="fcard-head">
            <span className="t">Folio 03 — Cerrar acuerdo</span>
          </div>
          <div className="fcard-body">
            <form action={advanceToCobro.bind(null, caso.id)}>
              <div className="fgrid-form">
                <div className="field-group">
                  <label htmlFor="monto_acuerdo">Monto acuerdo</label>
                  <input type="number" id="monto_acuerdo" name="monto_acuerdo" required />
                </div>
                <div className="field-group">
                  <label htmlFor="pct_pacto">% pacto</label>
                  <input type="number" id="pct_pacto" name="pct_pacto" defaultValue={30} />
                </div>
                <div className="field-group">
                  <label htmlFor="pct_honorarios">% honorarios</label>
                  <input type="number" id="pct_honorarios" name="pct_honorarios" defaultValue={caso.default_fee_pct ?? 10} />
                </div>
                <div className="field-group">
                  <label htmlFor="fecha_cierre">Fecha de cierre</label>
                  <input type="date" id="fecha_cierre" name="fecha_cierre" required />
                </div>
              </div>
              <button type="submit" className="btn" style={{ marginTop: 14 }}>
                Cerrar acuerdo y pasar a cobro
              </button>
            </form>
          </div>
        </div>
      )}

      {(caso.stage === "cobro" || caso.stage === "cerrado") && (
        <div className="fcard active">
          <div className="fcard-head">
            <span className="t">Folio 03 — Cobro</span>
            <span className={`chip ${caso.estado_cobro === "vencido" ? "danger" : caso.estado_cobro === "cobrado" ? "ok" : "warn"}`}>
              {caso.estado_cobro}
            </span>
          </div>
          <div className="fcard-body">
            <div className="fgrid">
              <Field k="Monto acuerdo" v={formatCurrency(caso.monto_acuerdo)} />
              <Field k="% pacto" v={formatPct(caso.pct_pacto)} />
              <Field k="Monto pacto" v={formatCurrency(caso.monto_pacto)} calc />
              <Field k="% honorarios" v={formatPct(caso.pct_honorarios ?? caso.default_fee_pct)} />
              <Field k="Monto honorarios" v={formatCurrency(caso.monto_honorarios)} calc />
              <Field k="Fecha de cierre" v={formatDate(caso.fecha_cierre)} />
              <Field k="Pago pacto est." v={formatDate(caso.fecha_pago_est_pacto)} calc />
              <Field k="Pago hon. est." v={formatDate(caso.fecha_pago_est_honorarios)} calc />
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
              {!caso.fecha_pago_real_pacto ? (
                <form action={registerPagoAction(caso.id, "pacto")} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div className="field-group">
                    <label>Marcar pacto cobrado el</label>
                    <input type="date" name="fecha" required />
                  </div>
                  <button className="btn secondary" type="submit">
                    Registrar
                  </button>
                </form>
              ) : (
                <Field k="Pacto cobrado" v={formatDate(caso.fecha_pago_real_pacto)} />
              )}

              {!caso.fecha_pago_real_honorarios ? (
                <form action={registerPagoAction(caso.id, "honorarios")} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div className="field-group">
                    <label>Marcar honorarios cobrados el</label>
                    <input type="date" name="fecha" required />
                  </div>
                  <button className="btn secondary" type="submit">
                    Registrar
                  </button>
                </form>
              ) : (
                <Field k="Honorarios cobrados" v={formatDate(caso.fecha_pago_real_honorarios)} />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function registerPagoAction(caseId: string, tipo: "pacto" | "honorarios") {
  async function action(formData: FormData) {
    "use server";
    await registerPago(caseId, tipo, String(formData.get("fecha")));
  }
  return action;
}

function AddFollowupForm({ caseId }: { caseId: string }) {
  async function action(formData: FormData) {
    "use server";
    const note = String(formData.get("note") ?? "").trim();
    if (note) await addFollowup(caseId, note);
  }
  return (
    <form action={action} className="field-group" style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
      <input name="note" placeholder="Agregar nota de seguimiento…" style={{ flex: 1 }} />
      <button className="btn secondary" type="submit">
        Agregar
      </button>
    </form>
  );
}

function Step({ label, sub, status }: { label: string; sub: string; status: "done" | "active" | "pending" }) {
  return (
    <div className={`step ${status}`}>
      <div className="node">{status === "done" ? "✓" : status === "active" ? "●" : ""}</div>
      <div className="label">
        <span className="t">{label}</span>
        <span className="s">{sub}</span>
      </div>
    </div>
  );
}

function StepLine({ done }: { done: boolean }) {
  return <div className={`step-line${done ? "" : " pending"}`} />;
}

function Field({ k, v, calc }: { k: string; v: string; calc?: boolean }) {
  return (
    <div className="f">
      <span className="k">{k}</span>
      <span className={`v${calc ? " calc" : ""}`}>{v}</span>
    </div>
  );
}

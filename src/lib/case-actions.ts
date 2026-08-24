"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import type { LeadStatus } from "@/lib/supabase/types";

export async function createLead(formData: FormData) {
  const supabase = await createClient();

  const statusInput = String(formData.get("lead_status") ?? "primer_contacto") as LeadStatus;

  const { error } = await supabase.from("cases").insert({
    stage: "lead",
    phone: String(formData.get("phone") ?? ""),
    provincia: String(formData.get("provincia") ?? "") || null,
    company_id: String(formData.get("company_id") ?? "") || null,
    source: String(formData.get("source") ?? "") || null,
    hablo_con: String(formData.get("hablo_con") ?? "") || null,
    observations: String(formData.get("observations") ?? "") || null,
    lead_status: statusInput,
    asesorado: formData.get("asesorado") === "on",
  });
  if (error) throw error;

  revalidatePath("/leads");
}

export async function addFollowup(caseId: string, note: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("followups")
    .insert({ case_id: caseId, note, user_id: user?.id ?? null });
  if (error) throw error;

  revalidatePath("/leads");
  revalidatePath(`/casos/${caseId}`);
}

export async function assignCaseResponsible(caseId: string, responsibleId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cases")
    .update({ responsible_id: responsibleId })
    .eq("id", caseId);
  if (error) throw error;

  revalidatePath("/leads");
  revalidatePath("/tramite");
  revalidatePath(`/casos/${caseId}`);
}

export async function setLeadStatus(caseId: string, status: LeadStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("cases").update({ lead_status: status }).eq("id", caseId);
  if (error) throw error;

  revalidatePath("/leads");
}

export async function advanceToTramite(caseId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cases")
    .update({
      stage: "tramite",
      lead_status: "ingreso",
      autos: String(formData.get("autos") ?? ""),
      claim_type: String(formData.get("claim_type") ?? "") || null,
      documental: String(formData.get("documental") ?? "") || null,
      tramite_status: "en_tramite",
      mecanica: String(formData.get("mecanica") ?? "") || null,
    })
    .eq("id", caseId);
  if (error) throw error;

  revalidatePath("/leads");
  revalidatePath("/tramite");
  redirect(`/casos/${caseId}`);
}

export async function updateTramite(caseId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cases")
    .update({
      pacto_firmado: formData.get("pacto_firmado") === "on",
      pacto_firmado_fecha: String(formData.get("pacto_firmado_fecha") ?? "") || null,
      pago_cd: formData.get("pago_cd") === "on",
      documental: String(formData.get("documental") ?? "") || null,
      reclamo_admin: formData.get("reclamo_admin") === "on",
      audiencia_fecha: String(formData.get("audiencia_fecha") ?? "") || null,
    })
    .eq("id", caseId);
  if (error) throw error;

  revalidatePath("/tramite");
  revalidatePath(`/casos/${caseId}`);
}

export async function advanceToCobro(caseId: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cases")
    .update({
      stage: "cobro",
      monto_acuerdo: Number(formData.get("monto_acuerdo") ?? 0),
      pct_pacto: Number(formData.get("pct_pacto") ?? 30),
      pct_honorarios: Number(formData.get("pct_honorarios") ?? 10),
      fecha_cierre: String(formData.get("fecha_cierre") ?? "") || null,
    })
    .eq("id", caseId);
  if (error) throw error;

  revalidatePath("/tramite");
  revalidatePath("/cobros");
  redirect(`/casos/${caseId}`);
}

export async function registerPago(
  caseId: string,
  tipo: "pacto" | "honorarios",
  fecha: string
) {
  const supabase = await createClient();
  const column = tipo === "pacto" ? "fecha_pago_real_pacto" : "fecha_pago_real_honorarios";

  const { error } = await supabase
    .from("cases")
    .update({ [column]: fecha })
    .eq("id", caseId);
  if (error) throw error;

  revalidatePath("/cobros");
  revalidatePath(`/casos/${caseId}`);
}

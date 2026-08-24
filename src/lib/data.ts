import { createClient } from "@/lib/supabase/server";
import type { CaseView, Company, Followup, Profile } from "@/lib/supabase/types";

export interface FollowupWithUser extends Followup {
  user_name?: string | null;
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  return data ?? [];
}

export async function getCurrentUserProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) return profile;
  }

  // Fallback para modo demo / desarrollo local
  return {
    id: "demo-giuliana-id",
    full_name: "Giuliana",
    role: "abogada",
    created_at: new Date().toISOString(),
  };
}

export async function getLeads(): Promise<CaseView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases_view")
    .select("*")
    .eq("stage", "lead")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTramite(): Promise<CaseView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases_view")
    .select("*")
    .eq("stage", "tramite")
    .order("audiencia_fecha", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCobros(): Promise<CaseView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases_view")
    .select("*")
    .eq("stage", "cobro")
    .order("fecha_cierre", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCase(id: string): Promise<CaseView | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cases_view").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFollowups(caseId: string): Promise<FollowupWithUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("followups")
    .select("*, profiles(full_name)")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (
    data?.map((f: any) => ({
      ...f,
      user_name: f.profiles?.full_name ?? null,
    })) ?? []
  );
}

export async function getCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("companies").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getDashboard() {
  const supabase = await createClient();

  const [{ data: cobros }, { data: leads }, { data: tramite }] = await Promise.all([
    supabase.from("cases_view").select("*").eq("stage", "cobro"),
    supabase.from("cases_view").select("*").eq("stage", "lead"),
    supabase.from("cases_view").select("*").eq("stage", "tramite"),
  ]);

  const cobrosList = (cobros ?? []) as CaseView[];
  const leadsList = (leads ?? []) as CaseView[];
  const tramiteList = (tramite ?? []) as CaseView[];

  const pendientes = cobrosList.filter((c) => c.estado_cobro === "pendiente" || c.estado_cobro === "vencido");
  const vencidos = cobrosList.filter((c) => c.estado_cobro === "vencido");
  const porCobrarTotal = pendientes.reduce(
    (sum: number, c: CaseView) => sum + (c.monto_pacto ?? 0) + (c.monto_honorarios ?? 0),
    0
  );
  const vencidoTotal = vencidos.reduce(
    (sum: number, c: CaseView) => sum + (c.monto_pacto ?? 0) + (c.monto_honorarios ?? 0),
    0
  );

  const en30 = pendientes.filter((c) => bucketDias(c.fecha_pago_est_pacto) === "0-30");
  const en60 = pendientes.filter((c) => bucketDias(c.fecha_pago_est_pacto) === "31-60");

  const leadsSinRespuesta = leadsList.filter(
    (l) => (l.lead_status === "primer_contacto" || l.lead_status === "esperando_confirmacion") && (l.dias_sin_respuesta ?? 0) > 3
  );

  const audienciasProximas = tramiteList.filter((c) => {
    if (!c.audiencia_fecha) return false;
    const dias = (new Date(c.audiencia_fecha).getTime() - Date.now()) / 86_400_000;
    return dias >= 0 && dias <= 30;
  });

  const fuentes = new Map<string, number>();
  for (const l of leadsList) {
    if (!l.source) continue;
    fuentes.set(l.source, (fuentes.get(l.source) ?? 0) + 1);
  }

  return {
    porCobrarTotal,
    vencidoTotal,
    vencidosCount: vencidos.length,
    leadsSinRespuesta,
    audienciasProximas,
    fuentes: [...fuentes.entries()].sort((a, b) => b[1] - a[1]),
    bucketVencido: vencidoTotal,
    bucket30: en30.reduce((s, c) => s + (c.monto_pacto ?? 0) + (c.monto_honorarios ?? 0), 0),
    bucket60: en60.reduce((s, c) => s + (c.monto_pacto ?? 0) + (c.monto_honorarios ?? 0), 0),
    leadsActivos: (leads ?? []).length,
  };
}

function bucketDias(fecha: string | null) {
  if (!fecha) return null;
  const dias = (new Date(fecha).getTime() - Date.now()) / 86_400_000;
  if (dias < 0) return "vencido";
  if (dias <= 30) return "0-30";
  if (dias <= 60) return "31-60";
  return "60+";
}

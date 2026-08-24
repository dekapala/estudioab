// Tipos escritos a mano, en espejo del esquema en supabase/migrations/0001_init.sql.
// Si el esquema cambia, lo ideal es regenerar esto con:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts

export type Role = "asesor" | "abogada" | "cobros" | "admin";
export type LeadStatus = "primer_contacto" | "esperando_confirmacion" | "reiterado" | "no_va" | "ingreso";
export type ClaimType = "dano_material" | "lesion" | "ambos";
export type Documental = "completa" | "incompleta";
export type TramiteStatus = "en_tramite" | "baja";
export type Stage = "lead" | "tramite" | "cobro" | "cerrado";
export type EstadoCobro = "pendiente" | "parcial" | "vencido" | "cobrado";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  default_payment_term_days: number;
  default_fee_pct: number;
  notes: string | null;
  created_at: string;
}

export interface CaseRow {
  id: string;
  stage: Stage;
  created_at: string;
  updated_at: string;

  phone: string;
  provincia: string | null;
  company_id: string | null;
  source: string | null;
  observations: string | null;
  asesorado: boolean;
  hablo_con: string | null;
  responsible_id: string | null;
  lead_status: LeadStatus;

  autos: string | null;
  lawyer_id: string | null;
  taken_by: string | null;
  claim_type: ClaimType | null;
  mecanica: string | null;
  tramite_observations: string | null;
  pacto_firmado: boolean;
  pacto_firmado_fecha: string | null;
  pago_cd: boolean;
  documental: Documental | null;
  documental_detalle: string | null;
  reclamo_admin: boolean;
  reclamo_admin_fecha: string | null;
  audiencia_fecha: string | null;
  tramite_status: TramiteStatus | null;

  monto_acuerdo: number | null;
  pct_pacto: number | null;
  pct_honorarios: number | null;
  fecha_cierre: string | null;
  plazo_pacto_dias_override: number | null;
  plazo_honorarios_dias_override: number | null;
  fecha_pago_real_pacto: string | null;
  fecha_pago_real_honorarios: string | null;
}

export interface CaseView extends CaseRow {
  company_name: string | null;
  default_payment_term_days: number | null;
  default_fee_pct: number | null;
  responsible_name: string | null;
  responsible_role: Role | null;
  lawyer_name: string | null;
  last_followup_at: string | null;
  dias_sin_respuesta: number | null;
  antiguedad_dias: number;
  monto_pacto: number | null;
  monto_honorarios: number | null;
  fecha_pago_est_pacto: string | null;
  fecha_pago_est_honorarios: string | null;
  estado_cobro: EstadoCobro | null;
}

export interface Followup {
  id: string;
  case_id: string;
  note: string;
  user_id: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> };
      cases: { Row: CaseRow; Insert: Partial<CaseRow>; Update: Partial<CaseRow> };
      followups: { Row: Followup; Insert: Partial<Followup>; Update: Partial<Followup> };
    };
    Views: {
      cases_view: { Row: CaseView };
    };
  };
}

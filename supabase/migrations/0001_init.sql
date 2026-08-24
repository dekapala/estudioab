-- Sistema de gestión de casos — esquema inicial (beta)
-- Un caso = un registro que atraviesa 3 etapas (lead -> tramite -> cobro)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Perfiles (uno por usuario de auth.users)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('asesor', 'abogada', 'cobros', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tabla maestra de compañías
-- ---------------------------------------------------------------------
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_payment_term_days integer not null default 60,
  default_fee_pct numeric(5,2) not null default 10,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Casos: un registro por caso, columnas de las 3 etapas en la misma fila.
-- Las columnas de una etapa quedan NULL hasta que el caso llega a ella.
-- ---------------------------------------------------------------------
create table cases (
  id uuid primary key default gen_random_uuid(),
  stage text not null default 'lead' check (stage in ('lead', 'tramite', 'cobro', 'cerrado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Folio 01 — Lead / Consulta
  phone text not null,
  provincia text,
  company_id uuid references companies(id),
  source text,
  observations text,
  asesorado boolean not null default false,
  hablo_con text,
  responsible_id uuid references profiles(id),
  lead_status text not null default 'primer_contacto'
    check (lead_status in ('primer_contacto', 'esperando_confirmacion', 'reiterado', 'no_va', 'ingreso')),

  -- Folio 02 — Caso en trámite
  autos text,
  lawyer_id uuid references profiles(id),
  taken_by text,
  claim_type text check (claim_type in ('dano_material', 'lesion', 'ambos')),
  mecanica text,
  tramite_observations text,
  pacto_firmado boolean not null default false,
  pacto_firmado_fecha date,
  pago_cd boolean not null default false,
  documental text check (documental in ('completa', 'incompleta')),
  documental_detalle text,
  reclamo_admin boolean not null default false,
  reclamo_admin_fecha date,
  audiencia_fecha date,
  tramite_status text check (tramite_status in ('en_tramite', 'baja')),

  -- Folio 03 — Acuerdo y cobro
  monto_acuerdo numeric(14,2),
  pct_pacto numeric(5,2) default 30,
  pct_honorarios numeric(5,2),
  fecha_cierre date,
  plazo_pacto_dias_override integer,
  plazo_honorarios_dias_override integer,
  fecha_pago_real_pacto date,
  fecha_pago_real_honorarios date
);

create index cases_stage_idx on cases (stage);
create index cases_company_idx on cases (company_id);
create index cases_lead_status_idx on cases (lead_status);

-- ---------------------------------------------------------------------
-- Seguimiento: reemplaza la columna de texto libre por una línea de tiempo
-- ---------------------------------------------------------------------
create table followups (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  note text not null,
  user_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index followups_case_idx on followups (case_id, created_at desc);

-- ---------------------------------------------------------------------
-- Vista con los campos calculados (Folio 01/02/03) — nunca se guardan,
-- se derivan siempre de los datos crudos para que no queden desactualizados.
-- ---------------------------------------------------------------------
create view cases_view as
select
  c.*,
  co.name as company_name,
  co.default_payment_term_days,
  co.default_fee_pct,
  pr.full_name as responsible_name,
  pr.role as responsible_role,
  pl.full_name as lawyer_name,

  -- Folio 01: seguimiento
  lf.last_followup_at,
  greatest(
    0,
    extract(day from now() - coalesce(lf.last_followup_at, c.created_at))
  )::int as dias_sin_respuesta,

  -- Folio 02: antigüedad
  extract(day from now() - c.created_at)::int as antiguedad_dias,

  -- Folio 03: montos calculados
  round(c.monto_acuerdo * coalesce(c.pct_pacto, 0) / 100, 2) as monto_pacto,
  round(c.monto_acuerdo * coalesce(c.pct_honorarios, co.default_fee_pct, 0) / 100, 2) as monto_honorarios,

  -- Folio 03: fechas estimadas de pago
  (c.fecha_cierre + make_interval(days => coalesce(c.plazo_pacto_dias_override, co.default_payment_term_days, 60)))::date
    as fecha_pago_est_pacto,
  (c.fecha_cierre + make_interval(days => coalesce(c.plazo_honorarios_dias_override, co.default_payment_term_days, 60)))::date
    as fecha_pago_est_honorarios,

  -- Folio 03: estado de cobro
  case
    when c.fecha_pago_real_pacto is not null and c.fecha_pago_real_honorarios is not null then 'cobrado'
    when c.fecha_pago_real_pacto is not null or c.fecha_pago_real_honorarios is not null then 'parcial'
    when c.monto_acuerdo is null then null
    when (c.fecha_cierre + make_interval(days => coalesce(c.plazo_pacto_dias_override, co.default_payment_term_days, 60))) < current_date
      or (c.fecha_cierre + make_interval(days => coalesce(c.plazo_honorarios_dias_override, co.default_payment_term_days, 60))) < current_date
      then 'vencido'
    else 'pendiente'
  end as estado_cobro
from cases c
left join companies co on co.id = c.company_id
left join profiles pr on pr.id = c.responsible_id
left join profiles pl on pl.id = c.lawyer_id
left join lateral (
  select max(f.created_at) as last_followup_at
  from followups f
  where f.case_id = c.id
) lf on true;

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_set_updated_at
  before update on cases
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- RLS — beta: cualquier usuario autenticado del estudio ve y edita todo.
-- El detalle de permisos por rol (asesor/abogada/cobros/admin) queda
-- para cuando el cliente apruebe la versión final.
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table companies enable row level security;
alter table cases enable row level security;
alter table followups enable row level security;

create policy "authenticated read profiles" on profiles for select to authenticated using (true);
create policy "authenticated read companies" on companies for select to authenticated using (true);
create policy "authenticated write companies" on companies for all to authenticated using (true) with check (true);
create policy "authenticated read cases" on cases for select to authenticated using (true);
create policy "authenticated write cases" on cases for all to authenticated using (true) with check (true);
create policy "authenticated read followups" on followups for select to authenticated using (true);
create policy "authenticated write followups" on followups for all to authenticated using (true) with check (true);

-- Un perfil se crea solo la primera vez que el usuario entra
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'asesor');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Datos de ejemplo para el beta — mismos casos usados en el prototipo de pantallas.
-- Todas las fechas son relativas a la fecha real en que se corre este seed,
-- así las alertas (sin respuesta, audiencia próxima, vencido) se ven correctamente
-- sin importar cuándo se ejecute.

insert into companies (name, default_payment_term_days, default_fee_pct) values
  ('La Holando', 60, 10),
  ('HDI', 45, 10),
  ('Zurich', 60, 10),
  ('San Cristóbal', 45, 10),
  ('Galicia', 30, 10),
  ('Sancor', 60, 10),
  ('Fedpat', 90, 15),
  ('La Meridional', 45, 10),
  ('Mercantil', 60, 10),
  ('Rivadavia', 60, 10),
  ('Caja', 60, 10),
  ('Mutual Rivadavia', 60, 10),
  ('La Segunda', 60, 10);

-- ---------------------------------------------------------------------
-- Folio 01 — Leads activos
-- ---------------------------------------------------------------------
insert into cases (stage, created_at, phone, provincia, company_id, source, lead_status, asesorado, observations)
values
  ('lead', now() - interval '1 day', '11 5544-1234', 'Bs. As.',
    (select id from companies where name = 'La Holando'), 'Link Ad · Facebook Mitos', 'primer_contacto', false, 'Hizo clic en anuncio. Se le envió 1er mensaje con requisitos. No volvió a responder.'),
  ('lead', now() - interval '2 days', '11 4433-9876', 'Santa Fe',
    (select id from companies where name = 'San Cristóbal'), 'Link Ad · Instagram Balcón', 'primer_contacto', false, 'Tocó link de IG. Envió texto predefinido, sin respuesta a las preguntas iniciales.'),
  ('lead', now() - interval '3 days', '11 6543-4236', 'Bs. As.',
    (select id from companies where name = 'La Holando'), 'Facebook · mitos y verdades', 'reiterado', true, 'Se envió 1er mensaje de re-contacto por WA.'),
  ('lead', now() - interval '5 days', '11 3696-2446', 'Bs. As.',
    (select id from companies where name = 'HDI'), 'Facebook · mitos y verdades', 'esperando_confirmacion', true, null),
  ('lead', now() - interval '5 days', '9 3816-14278', 'Bs. As.',
    (select id from companies where name = 'Galicia'), 'Instagram · jingle', 'esperando_confirmacion', true, null),
  ('lead', now() - interval '5 days', '11 2608-9860', 'Bs. As.',
    (select id from companies where name = 'Caja'), 'Facebook · video balcón', 'esperando_confirmacion', true, null),
  ('lead', now() - interval '6 days', '11 7623-6485', 'Bs. As.',
    (select id from companies where name = 'La Meridional'), 'Instagram · video balcón', 'no_va', true, null);

insert into followups (case_id, note, created_at)
values
  ((select id from cases where phone = '11 5544-1234'), 'Primer mensaje enviado automáticamente tras clic en ad', now() - interval '1 day'),
  ((select id from cases where phone = '11 4433-9876'), 'Link de anuncio respondido. Esperando interacción', now() - interval '2 days'),
  ((select id from cases where phone = '11 6543-4236'), 'Espera 1 sem resp de la cía. Reiterado mensaje de saludo', now() - interval '3 days'),
  ((select id from cases where phone = '11 3696-2446'), 'Reiterado 1/7', now() - interval '5 days'),
  ((select id from cases where phone = '9 3816-14278'), 'Probar en adm, conductor uber', now() - interval '5 days'),
  ((select id from cases where phone = '11 2608-9860'), 'Esperando doc completa', now() - interval '5 days'),
  ((select id from cases where phone = '11 7623-6485'), 'No continúa', now() - interval '6 days');

-- ---------------------------------------------------------------------
-- Folio 02 — Casos en trámite
-- ---------------------------------------------------------------------
insert into cases (
  stage, created_at, phone, provincia, company_id, source, lead_status,
  autos, claim_type, documental, tramite_status, audiencia_fecha
) values
  ('tramite', now() - interval '20 days', '11 6132-2480', 'Bs. As.',
    (select id from companies where name = 'Caja'), 'Facebook · mitos y verdades', 'ingreso',
    'Verga Maxi c Caja', 'dano_material', 'completa', 'en_tramite', null),
  ('tramite', now() - interval '18 days', '1160449495', 'Bs. As.',
    (select id from companies where name = 'San Cristóbal'), 'Facebook · jingle', 'ingreso',
    'Ruiz Maximiliano c San Cristóbal', 'ambos', 'completa', 'en_tramite', null),
  ('tramite', now() - interval '15 days', '3484 34-9361', 'Bs. As.',
    (select id from companies where name = 'Zurich'), 'Instagram · video de jingle', 'ingreso',
    'Zapata Martín c Zurich', 'dano_material', 'incompleta', 'en_tramite', null),
  ('tramite', now() - interval '25 days', '2944 24-1433', 'Bs. As.',
    (select id from companies where name = 'Mercantil'), 'Facebook · video balcón', 'ingreso',
    'Benitez Mariana c Mercantil', 'dano_material', 'completa', 'en_tramite', current_date + interval '4 days');

-- ---------------------------------------------------------------------
-- Folio 03 — Acuerdo y cobro
-- ---------------------------------------------------------------------
insert into cases (
  stage, created_at, phone, provincia, company_id, source, lead_status,
  autos, claim_type, documental, tramite_status,
  monto_acuerdo, pct_pacto, pct_honorarios, fecha_cierre,
  fecha_pago_real_pacto, fecha_pago_real_honorarios
) values
  ('cobro', now() - interval '90 days', '11 4155-2500', 'Bs. As.',
    (select id from companies where name = 'Rivadavia'), 'Facebook · mitos y verdades', 'ingreso',
    'Coronel Publio c Rivadavia', 'dano_material', 'completa', 'en_tramite',
    4155250, 30, 10, current_date - interval '5 days', null, null),

  ('cobro', now() - interval '150 days', '11 1750-0000', 'Bs. As.',
    (select id from companies where name = 'Caja'), 'Instagram · jingle', 'ingreso',
    'Diaz Álvaro c Caja', 'dano_material', 'completa', 'en_tramite',
    1750000, 30, 10, current_date - interval '80 days',
    current_date - interval '20 days', current_date - interval '3 days'),

  ('cobro', now() - interval '150 days', '11 3400-0000', 'Bs. As.',
    (select id from companies where name = 'Mutual Rivadavia'), 'Facebook · video balcón', 'ingreso',
    'Cangero Mauro c Mutual Rivadavia', 'dano_material', 'completa', 'en_tramite',
    3400000, 30, 10, current_date - interval '80 days', null, null),

  ('cobro', now() - interval '160 days', '11 1100-0000', 'Bs. As.',
    (select id from companies where name = 'Fedpat'), 'Facebook · video entrevista', 'ingreso',
    'Daniel Juan c Fedpat', 'lesion', 'completa', 'en_tramite',
    11000000, 30, 15, current_date - interval '97 days',
    current_date - interval '7 days', current_date - interval '7 days'),

  -- Caso de referencia para la Ficha unificada: recorrió las 3 etapas.
  ('cobro', now() - interval '40 days', '2944 24-1433', 'Bs. As.',
    (select id from companies where name = 'La Segunda'), 'Facebook · video balcón', 'ingreso',
    'Benitez Darío c La Segunda', 'dano_material', 'completa', 'en_tramite',
    1300000, 30, 10, current_date - interval '1 day', null, null);

-- El caso de referencia también completa sus campos de Folio 02, para que la
-- Ficha muestre los 3 folios con datos reales (lead -> trámite -> cobro).
update cases set
  pacto_firmado = true,
  pacto_firmado_fecha = current_date - interval '22 days',
  reclamo_admin = true,
  reclamo_admin_fecha = current_date - interval '20 days'
where autos = 'Benitez Darío c La Segunda';

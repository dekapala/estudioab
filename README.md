# Sistema de gestión de casos — beta funcional

Reemplaza las 3 planillas (Consultas, Ingreso de casos siniestros, Casos a
cobrar) por un solo sistema: un caso es un registro que atraviesa 3 etapas
(Lead → Trámite → Cobro) sin retipear datos. Ver `supabase/migrations/0001_init.sql`
para el detalle del modelo.

## 1. Crear el proyecto en Supabase

1. Entrar a [supabase.com](https://supabase.com) → **New project**.
2. Una vez creado, ir a **SQL Editor** y correr, en este orden:
   - el contenido de `supabase/migrations/0001_init.sql`
   - el contenido de `supabase/seed.sql` (carga los casos de ejemplo)
3. Ir a **Project Settings → API** y copiar:
   - `Project URL`
   - `anon public` key

## 2. Configurar el proyecto local

```bash
cp .env.local.example .env.local
```

Completar `.env.local` con la URL y la anon key del paso anterior.

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) — redirige a `/login`.

## 3. Crear los usuarios del equipo

Por ahora no hay pantalla de alta de usuarios (no hace falta para el beta).
Crearlos manualmente en Supabase:

1. **Authentication → Users → Add user** — uno por cada persona del estudio
   (Giuli, Pabli, Nahue, Micaela), con email y contraseña provisoria.
2. Al crear el usuario, se genera automáticamente su fila en `profiles` con
   rol `asesor` (ver el trigger `handle_new_user` en la migración). Para
   ajustar el rol o el nombre:

   ```sql
   update profiles set full_name = 'Giuliana', role = 'abogada'
   where id = '<uuid del usuario, visible en Authentication → Users>';
   ```

3. (Opcional) Para que los casos de ejemplo del seed muestren una abogada/
   responsable asignado en vez de "—", correr:

   ```sql
   update cases set responsible_id = '<uuid de Giuli>', lawyer_id = '<uuid de Giuli>'
   where autos = 'Benitez Darío c La Segunda';
   ```

## 4. Qué probar en el beta

- **Folio 01 · Leads** — cargar un lead nuevo, ver la alerta de "sin
  respuesta hace más de 5 días" (los del seed ya están en ese estado).
- **Pasar a trámite** — desde la fila de un lead, botón "pasar a trámite".
- **Ficha de caso** — abrir un caso desde Trámite o Cobros: muestra el
  stepper Lead → Trámite → Cobro con los folios anteriores en modo lectura.
- **Cerrar acuerdo** — desde la Ficha de un caso en trámite, completar
  monto y fecha de cierre: calcula solo el monto de pacto/honorarios y las
  fechas estimadas de pago según la compañía.
- **Panel** — totales, vencidos, audiencias próximas y leads por fuente.

## 5. Deploy para que el cliente lo vea

```bash
npx vercel
```

Seguir el asistente (pide login a Vercel) y cargar las mismas dos variables
de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en
el proyecto de Vercel cuando lo pida. Vercel da una URL pública para
compartir con el estudio.

## Qué queda fuera de este beta (a propósito)

Integración con el sistema judicial, firma digital, notificaciones
automáticas por WhatsApp/email, permisos estrictos por rol (hoy cualquier
usuario logueado ve y edita todo). Se define después de la aprobación del
cliente.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Supabase** (Postgres + Auth) — ver `supabase/migrations/0001_init.sql`
- Sin librería de estilos: CSS propio en `src/app/globals.css`, mismo
  sistema visual usado en el prototipo de pantallas mostrado al equipo.

> Nota para quien retome este proyecto: esta versión de Next.js (16) renombró
> `middleware.ts` a `proxy.ts` y otros conventions pueden diferir de lo que
> conocés — antes de tocar archivos de `src/app` o de ruteo, revisar
> `AGENTS.md` y `node_modules/next/dist/docs/`.

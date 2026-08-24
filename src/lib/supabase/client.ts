import { createBrowserClient } from "@supabase/ssr";

// Sin genérico <Database>: el esquema real se define en supabase/migrations
// y se consume vía los tipos manuales de src/lib/supabase/types.ts en cada
// función de src/lib/data.ts y src/lib/case-actions.ts. Cuando el proyecto
// Supabase exista, se puede regenerar con `supabase gen types` y volver a
// tipar el cliente si se quiere el chequeo estricto de columnas.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

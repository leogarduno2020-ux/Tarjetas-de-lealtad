import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Cliente con service role: SALTA RLS por completo.
 *
 * Solo para operaciones donde el servidor ya validó quién llama:
 * alta de negocios desde /admin, registro público de clientes, sellado
 * desde la caja y los cron jobs. Nunca se debe importar desde un
 * componente del navegador — el import de "server-only" hace que el
 * build falle si alguien lo intenta.
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

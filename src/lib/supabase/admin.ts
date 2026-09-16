import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/**
 * Client com a Secret Key: ignora RLS. Só pode ser importado em código
 * server-side (route handlers, server actions) — nunca em client components.
 */
export function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

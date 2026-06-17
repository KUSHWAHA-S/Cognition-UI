import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env.server";

// Service-role client — bypasses RLS. Server-side only.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createServiceClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

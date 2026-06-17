// Validates all required server-side environment variables at module load.
// Import this file anywhere in the server-side code path to catch
// missing config immediately instead of seeing cryptic errors at runtime.

const REQUIRED: readonly string[] = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  throw new Error(
    `[env] Missing required environment variables: ${missing.join(", ")}\n` +
      `Copy .env.example to .env.local and fill in the values.`
  );
}

export const env = {
  supabaseUrl:            process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey:        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  cronSecret:             process.env.CRON_SECRET!,
} as const;

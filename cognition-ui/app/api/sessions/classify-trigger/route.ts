import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { handleClassifySessions } from "@/features/sessions/handler";
import { NextRequest } from "next/server";

// Authenticated proxy — lets the UI trigger classify without exposing CRON_SECRET.
export async function POST(req: NextRequest) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  // Inject the secret so handleClassifySessions passes the auth check
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });

  const proxied = new NextRequest(req.url, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
  });

  return handleClassifySessions(proxied);
}

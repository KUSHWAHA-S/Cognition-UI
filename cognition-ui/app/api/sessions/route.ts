import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const trackingId = req.nextUrl.searchParams.get("tracking_id");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));

  if (!trackingId) {
    return NextResponse.json({ error: "tracking_id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: project } = await supabase
    .from("projects")
    .select("tracking_id")
    .eq("tracking_id", trackingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("sessions")
    .select(
      "id, archetype, total_events, session_start, session_end, classified_at",
      { count: "exact" }
    )
    .eq("tracking_id", trackingId)
    .not("archetype", "is", null)
    .order("session_start", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    sessions: data ?? [],
    page,
    total: count ?? 0,
    has_more: (count ?? 0) > to + 1,
  });
}

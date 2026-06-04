import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Archetype } from "@/features/sessions/types";
import type { ArchetypeCount, DayCount, OverviewData } from "./types";
import { ARCHETYPE_ORDER } from "./constants";

export async function handleGetOverview(req: NextRequest) {
  // 1. Auth check
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const trackingId = req.nextUrl.searchParams.get("tracking_id");
  if (!trackingId) {
    return NextResponse.json(
      { error: "tracking_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // 2. Verify this tracking_id belongs to the authenticated user
  const { data: project } = await supabase
    .from("projects")
    .select("tracking_id")
    .eq("tracking_id", trackingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 3. Date range — last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 4. Fetch sessions in the last 7 days
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("archetype, session_start")
    .eq("tracking_id", trackingId)
    .gte("session_start", sevenDaysAgo.toISOString())
    .not("archetype", "is", null);

  if (error) {
    console.error("[overview] Query failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const rows = sessions ?? [];

  // 5. Archetype breakdown
  const countMap: Partial<Record<Archetype, number>> = {};
  for (const row of rows) {
    const a = row.archetype as Archetype;
    countMap[a] = (countMap[a] ?? 0) + 1;
  }

  const archetype_breakdown: ArchetypeCount[] = ARCHETYPE_ORDER
    .filter((a) => countMap[a] !== undefined)
    .map((a) => ({ archetype: a, count: countMap[a]! }));

  // 6. Session trend — count per day for last 7 days
  const dayMap: Record<string, number> = {};

  // Pre-fill all 7 days with 0 so days with no sessions still appear
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = 0;
  }

  for (const row of rows) {
    const key = row.session_start.slice(0, 10);
    if (key in dayMap) dayMap[key]++;
  }

  const session_trend: DayCount[] = Object.entries(dayMap).map(
    ([date, count]) => ({ date, count })
  );

  // 7. Stat derivations
  const total_this_week = rows.length;

  const top_archetype =
    archetype_breakdown.length > 0
      ? archetype_breakdown.reduce((a, b) => (b.count > a.count ? b : a))
          .archetype
      : null;

  // "Highest drop-off" = confused archetype count as a proxy.
  // If confused exists and has sessions, it's the drop-off concern.
  const highest_dropoff =
    (countMap["confused"] ?? 0) > 0 ? ("confused" as Archetype) : top_archetype;

  const data: OverviewData = {
    archetype_breakdown,
    session_trend,
    total_this_week,
    top_archetype,
    highest_dropoff,
  };

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Archetype } from "@/features/sessions/types";
import type { RawFlow, SankeyData } from "./types";

export async function handleGetFlows(req: NextRequest) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const trackingId = req.nextUrl.searchParams.get("tracking_id");
  if (!trackingId) {
    return NextResponse.json({ error: "tracking_id is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify ownership
  const { data: project } = await supabase
    .from("projects")
    .select("tracking_id")
    .eq("tracking_id", trackingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch all classified sessions with their archetype
  const { data: sessions, error: sessErr } = await supabase
    .from("sessions")
    .select("id, archetype")
    .eq("tracking_id", trackingId)
    .not("archetype", "is", null);

  if (sessErr || !sessions?.length) {
    return NextResponse.json({ flows: [], total_sessions: 0 } satisfies SankeyData);
  }

  const sessionArchetypeMap: Record<string, Archetype> = {};
  for (const s of sessions) {
    sessionArchetypeMap[s.id] = s.archetype as Archetype;
  }

  const sessionIds = sessions.map((s) => s.id);

  // Fetch page_view events for those sessions, ordered by session + time
  const { data: events, error: evErr } = await supabase
    .from("events")
    .select("session_id, page_url, timestamp")
    .eq("tracking_id", trackingId)
    .eq("event_type", "page_view")
    .in("session_id", sessionIds)
    .order("session_id")
    .order("timestamp", { ascending: true });

  if (evErr || !events?.length) {
    return NextResponse.json({ flows: [], total_sessions: 0 } satisfies SankeyData);
  }

  // Group events by session_id
  const bySession: Record<string, string[]> = {};
  for (const ev of events) {
    if (!bySession[ev.session_id]) bySession[ev.session_id] = [];
    bySession[ev.session_id].push(ev.page_url);
  }

  // Build consecutive page-pair flows
  const flowCounts: Record<string, number> = {};

  for (const [sessionId, pages] of Object.entries(bySession)) {
    const archetype = sessionArchetypeMap[sessionId];
    if (!archetype) continue;

    // Deduplicate consecutive same-page entries (SPA re-renders)
    const deduped = pages.filter((p, i) => i === 0 || p !== pages[i - 1]);

    for (let i = 0; i < deduped.length - 1; i++) {
      const source = deduped[i];
      const target = deduped[i + 1];
      if (source === target) continue;
      const key = `${source}|||${target}|||${archetype}`;
      flowCounts[key] = (flowCounts[key] ?? 0) + 1;
    }
  }

  const flows: RawFlow[] = Object.entries(flowCounts).map(([key, value]) => {
    const [source, target, archetype] = key.split("|||");
    return { source, target, archetype: archetype as Archetype, value };
  });

  // Only keep flows with count >= 2 to reduce noise
  const filtered = flows.filter((f) => f.value >= 2);

  return NextResponse.json({
    flows: filtered,
    total_sessions: sessions.length,
  } satisfies SankeyData);
}

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SankeyDiagram } from "@/features/dashboard/components/SankeyDiagram";
import type { Archetype } from "@/features/sessions/types";
import type { RawFlow } from "@/features/dashboard/flows/types";
import { toLabel } from "@/features/dashboard/flows/utils";

interface Props {
  params: Promise<{ trackingId: string }>;
}

async function getFlowData(trackingId: string): Promise<RawFlow[]> {
  const supabase = createServiceClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, archetype")
    .eq("tracking_id", trackingId)
    .not("archetype", "is", null);

  if (!sessions?.length) return [];

  const sessionArchetypeMap: Record<string, Archetype> = {};
  for (const s of sessions) {
    sessionArchetypeMap[s.id] = s.archetype as Archetype;
  }

  const { data: events } = await supabase
    .from("events")
    .select("session_id, page_url, timestamp")
    .eq("tracking_id", trackingId)
    .eq("event_type", "page_view")
    .in("session_id", sessions.map((s) => s.id))
    .order("session_id")
    .order("timestamp", { ascending: true });

  if (!events?.length) return [];

  const bySession: Record<string, string[]> = {};
  for (const ev of events) {
    if (!bySession[ev.session_id]) bySession[ev.session_id] = [];
    bySession[ev.session_id].push(ev.page_url);
  }

  const flowCounts: Record<string, number> = {};
  for (const [sessionId, pages] of Object.entries(bySession)) {
    const archetype = sessionArchetypeMap[sessionId];
    if (!archetype) continue;
    const deduped = pages.filter((p, i) => i === 0 || p !== pages[i - 1]);
    for (let i = 0; i < deduped.length - 1; i++) {
      const source = deduped[i];
      const target = deduped[i + 1];
      if (source === target) continue;
      const key = `${source}|||${target}|||${archetype}`;
      flowCounts[key] = (flowCounts[key] ?? 0) + 1;
    }
  }

  return Object.entries(flowCounts)
    .map(([key, value]) => {
      const [source, target, archetype] = key.split("|||");
      return { source, target, archetype: archetype as Archetype, value };
    })
    .filter((f) => f.value >= 2);
}

export default async function FlowsPage({ params }: Props) {
  const { trackingId } = await params;

  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) redirect("/login");

  const flows = await getFlowData(trackingId);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Click Flow
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Page-to-page navigation paths, coloured by user archetype.
          Thicker links = more sessions took that path.
        </p>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <SankeyDiagram flows={flows} />
      </div>
    </div>
  );
}

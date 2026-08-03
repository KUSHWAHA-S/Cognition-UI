import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MousePointerClick, Eye, ArrowDown, ArrowLeft, ZapOff, Zap, MousePointer } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ArchetypeBadge } from "@/features/sessions/components/ArchetypeBadge";
import { ARCHETYPE_CONFIG } from "@/features/dashboard/constants";
import type { Archetype } from "@/features/sessions/types";
import { DEMO_TRACKING_ID, getDemoSessionDetail } from "@/features/dashboard/demoData";

interface Props {
  params: Promise<{ trackingId: string; sessionId: string }>;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  click:         <MousePointerClick size={13} />,
  page_view:     <Eye size={13} />,
  scroll:        <ArrowDown size={13} />,
  backtrack:     <ArrowLeft size={13} />,
  dead_click:    <ZapOff size={13} />,
  rage_click:    <Zap size={13} />,
  hover:         <MousePointer size={13} />,
};

const EVENT_COLORS: Record<string, string> = {
  click:         "text-indigo-700 bg-indigo-50",
  page_view:     "text-blue-700 bg-blue-50",
  scroll:        "text-stone-500 bg-stone-100",
  backtrack:     "text-amber-700 bg-amber-50",
  dead_click:    "text-orange-700 bg-orange-50",
  rage_click:    "text-red-700 bg-red-50",
  hover:         "text-purple-700 bg-purple-50",
};

function formatTs(ts: string) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function toPath(url: string) {
  try { return new URL(url).pathname || "/"; }
  catch { return url; }
}

export default async function SessionDetailPage({ params }: Props) {
  const { trackingId, sessionId } = await params;

  let session: {
    id: string;
    archetype: string;
    total_events: number;
    session_start: string;
    session_end: string;
    velocity_score: number;
    backtrack_score: number;
    hesitation_score: number;
    exploration_score: number;
  } | null;
  let events: { event_type: string; page_url: string; element_selector: string | null; x: number | null; y: number | null; duration_ms: number | null; scroll_depth: number | null; timestamp: string }[] | null;

  if (trackingId === DEMO_TRACKING_ID) {
    const detail = getDemoSessionDetail(sessionId);
    if (!detail) notFound();
    session = detail;
    events = detail.events;
  } else {
    const supabaseAuth = await createSupabaseServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) redirect("/login");

    const supabase = createServiceClient();

    // Verify session belongs to this project (which belongs to this user)
    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("id, archetype, total_events, session_start, session_end, velocity_score, backtrack_score, hesitation_score, exploration_score")
      .eq("id", sessionId)
      .eq("tracking_id", trackingId)
      .maybeSingle();

    if (!sessionRow) notFound();
    session = sessionRow;

    const { data: eventRows } = await supabase
      .from("events")
      .select("event_type, page_url, element_selector, x, y, duration_ms, scroll_depth, timestamp")
      .eq("session_id", sessionId)
      .eq("tracking_id", trackingId)
      .order("timestamp", { ascending: true });

    events = eventRows;
  }

  const archetype = session.archetype as Archetype;
  const cfg = ARCHETYPE_CONFIG[archetype];

  const scores = [
    { label: "Velocity",    value: session.velocity_score,    hint: "clicks / min" },
    { label: "Backtrack",   value: session.backtrack_score,   hint: "lost signal" },
    { label: "Hesitation",  value: session.hesitation_score,  hint: "hover before click" },
    { label: "Exploration", value: session.exploration_score, hint: "page spread" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        href={`/dashboard/${trackingId}/sessions`}
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft size={14} /> Back to sessions
      </Link>

      {/* Header */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-mono mb-1" style={{ color: "var(--text-dim)" }}>{session.id}</p>
            <ArchetypeBadge archetype={archetype} />
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{cfg.description}</p>
          </div>
          <div className="text-right text-xs space-y-0.5" style={{ color: "var(--text-muted)" }}>
            <p>{formatDuration(session.session_start, session.session_end)} session</p>
            <p>{session.total_events} events</p>
            <p>{new Date(session.session_start).toLocaleDateString("en-US", {
              weekday: "short", month: "short", day: "numeric",
            })}</p>
          </div>
        </div>

        {/* Score bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {scores.map(({ label, value, hint }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{(value ?? 0).toFixed(1)}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((value ?? 0) / 10) * 100)}%`,
                    background: cfg.color,
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Event timeline */}
      <div>
        <h2 className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>
          Event sequence ({events?.length ?? 0} events)
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-0 bottom-0 w-px" style={{ background: "var(--border-subtle)" }} />

          <div className="space-y-1">
            {(events ?? []).map((ev, i) => {
              const colorClass = EVENT_COLORS[ev.event_type] ?? "text-stone-500 bg-stone-100";
              const icon = EVENT_ICONS[ev.event_type] ?? <MousePointerClick size={13} />;

              const meta: string[] = [];
              if (ev.scroll_depth != null) meta.push(`${ev.scroll_depth}% scroll`);
              if (ev.duration_ms != null) meta.push(`${ev.duration_ms}ms hover`);
              if (ev.x != null && ev.y != null) meta.push(`(${ev.x}, ${ev.y})`);
              if (ev.element_selector) meta.push(ev.element_selector);

              return (
                <div key={i} className="flex items-start gap-3 pl-1">
                  {/* Icon node */}
                  <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${colorClass}`}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1 pt-1.5">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {ev.event_type.replace("_", " ")}
                      </span>
                      <span className="text-xs shrink-0" style={{ color: "var(--text-dim)" }}>
                        {formatTs(ev.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{toPath(ev.page_url)}</p>
                    {meta.length > 0 && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{meta.join(" · ")}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

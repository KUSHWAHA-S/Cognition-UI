import { createServiceClient } from "@/lib/supabase/service";
import type { Archetype, ClassifiedSession, RawEvent } from "./types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function cap(n: number, max = 10): number {
  return Math.min(n, max);
}

function computeScores(events: RawEvent[]) {
  const clicks = events.filter((e) => e.event_type === "click");
  const backtracks = events.filter((e) => e.event_type === "backtrack");
  const rageClicks = events.filter((e) => e.event_type === "rage_click");
  const deadClicks = events.filter((e) => e.event_type === "dead_click");

  const totalClicks = clicks.length;
  const uniquePages = new Set(events.map((e) => e.page_url)).size;

  const pageViewCounts: Record<string, number> = {};
  for (const e of events) {
    if (e.event_type === "page_view") {
      pageViewCounts[e.page_url] = (pageViewCounts[e.page_url] ?? 0) + 1;
    }
  }
  const hasRepeatedPages =
    Object.values(pageViewCounts).filter((c) => c > 1).length >= 2;

  const timestamps = events.map((e) => new Date(e.timestamp).getTime());
  const sessionStart = Math.min(...timestamps);
  const sessionEnd = Math.max(...timestamps);
  const durationMinutes = Math.max((sessionEnd - sessionStart) / 60000, 1);

  const velocityScore =
    totalClicks === 0 ? 0 : cap((totalClicks / durationMinutes) * (10 / 6));

  const backtracksScore =
    totalClicks === 0 ? 0 : cap((backtracks.length / totalClicks) * 10);

  const clicksWithHover = clicks.filter(
    (e) => e.duration_ms !== null && e.duration_ms > 0
  );
  const hesitationScore =
    clicksWithHover.length === 0
      ? 0
      : cap(
          clicksWithHover.reduce((sum, e) => sum + e.duration_ms!, 0) /
            clicksWithHover.length /
            1000
        );

  const explorationScore =
    totalClicks === 0 ? 0 : cap((uniquePages / totalClicks) * 10);

  return {
    velocityScore: round2(velocityScore),
    backtracksScore: round2(backtracksScore),
    hesitationScore: round2(hesitationScore),
    explorationScore: round2(explorationScore),
    totalClicks,
    uniquePages,
    hasRepeatedPages,
    rageClickCount: rageClicks.length,
    deadClickCount: deadClicks.length,
    sessionStart: new Date(sessionStart).toISOString(),
    sessionEnd: new Date(sessionEnd).toISOString(),
  };
}

function assignArchetype(scores: ReturnType<typeof computeScores>): Archetype {
  const {
    velocityScore,
    backtracksScore,
    hesitationScore,
    explorationScore,
    uniquePages,
    hasRepeatedPages,
    rageClickCount,
    deadClickCount,
  } = scores;

  if (velocityScore > 6 && backtracksScore < 3 && hesitationScore < 3)
    return "goal_seeker";

  if (explorationScore > 6 && backtracksScore < 4)
    return "explorer";

  if (backtracksScore > 5 || rageClickCount > 2 || deadClickCount > 3)
    return "confused";

  if (uniquePages < 4 && hesitationScore > 5 && hasRepeatedPages)
    return "comparison_shopper";

  return "explorer";
}

export async function classifySession(
  sessionId: string,
  trackingId: string
): Promise<ClassifiedSession> {
  const supabase = createServiceClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("event_type, page_url, duration_ms, timestamp")
    .eq("session_id", sessionId)
    .eq("tracking_id", trackingId)
    .order("timestamp", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to fetch events for session ${sessionId}: ${error.message}`
    );
  }

  if (!events || events.length === 0) {
    throw new Error(`No events found for session ${sessionId}`);
  }

  const scores = computeScores(events as RawEvent[]);
  const archetype = assignArchetype(scores);

  return {
    id: sessionId,
    tracking_id: trackingId,
    archetype,
    velocity_score: scores.velocityScore,
    backtrack_score: scores.backtracksScore,
    hesitation_score: scores.hesitationScore,
    exploration_score: scores.explorationScore,
    total_events: events.length,
    session_start: scores.sessionStart,
    session_end: scores.sessionEnd,
    classified_at: new Date().toISOString(),
  };
}

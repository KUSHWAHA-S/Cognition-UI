import type { OverviewData } from "@/features/dashboard/types";
import type { RawFlow } from "@/features/dashboard/flows/types";
import type { Archetype } from "@/features/sessions/types";
import type { SessionRow } from "@/features/sessions/components/SessionsTable";

export const DEMO_TRACKING_ID = "demo";
export const DEMO_PROJECT_NAME = "Acme Demo";
export const DEMO_DOMAIN = "acme-demo.com";

const SITE = `https://${DEMO_DOMAIN}`;

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function isoAt(daysAgo: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ------------------------------------------------------------------
// Overview
// ------------------------------------------------------------------

const TREND_COUNTS = [42, 58, 51, 73, 68, 91, 104];

export const DEMO_OVERVIEW: OverviewData = {
  archetype_breakdown: [
    { archetype: "goal_seeker", count: 214 },
    { archetype: "explorer", count: 156 },
    { archetype: "comparison_shopper", count: 98 },
    { archetype: "confused", count: 39 },
  ],
  session_trend: lastNDays(7).map((date, i) => ({
    date,
    count: TREND_COUNTS[i],
  })),
  total_this_week: 507,
  top_archetype: "goal_seeker",
  highest_dropoff: "confused",
};

// ------------------------------------------------------------------
// Click flow (Sankey)
// ------------------------------------------------------------------

function url(path: string) {
  return `${SITE}${path}`;
}

export const DEMO_FLOWS: RawFlow[] = [
  // Goal-seeker: straight to checkout
  { source: url("/"), target: url("/products"), archetype: "goal_seeker", value: 18 },
  { source: url("/products"), target: url("/products/shoes"), archetype: "goal_seeker", value: 14 },
  { source: url("/products/shoes"), target: url("/cart"), archetype: "goal_seeker", value: 11 },
  { source: url("/cart"), target: url("/checkout"), archetype: "goal_seeker", value: 9 },

  // Explorer: wide, curious browsing
  { source: url("/"), target: url("/blog"), archetype: "explorer", value: 10 },
  { source: url("/blog"), target: url("/pricing"), archetype: "explorer", value: 6 },
  { source: url("/"), target: url("/products"), archetype: "explorer", value: 8 },
  { source: url("/pricing"), target: url("/support"), archetype: "explorer", value: 4 },

  // Comparison-shopper: hovering between similar products
  { source: url("/products"), target: url("/products/shoes"), archetype: "comparison_shopper", value: 7 },
  { source: url("/products/shoes"), target: url("/products/jackets"), archetype: "comparison_shopper", value: 5 },
  { source: url("/products/jackets"), target: url("/products/shoes"), archetype: "comparison_shopper", value: 4 },
  { source: url("/products"), target: url("/pricing"), archetype: "comparison_shopper", value: 3 },

  // Confused: backtracking, dead ends
  { source: url("/products"), target: url("/"), archetype: "confused", value: 6 },
  { source: url("/"), target: url("/products"), archetype: "confused", value: 5 },
  { source: url("/cart"), target: url("/products"), archetype: "confused", value: 4 },
  { source: url("/checkout"), target: url("/cart"), archetype: "confused", value: 3 },
];

// ------------------------------------------------------------------
// Sessions list
// ------------------------------------------------------------------

const SESSION_PLAN: { archetype: Archetype; daysAgo: number; hour: number; minutes: number; events: number }[] = [
  { archetype: "goal_seeker", daysAgo: 0, hour: 9, minutes: 3, events: 14 },
  { archetype: "goal_seeker", daysAgo: 0, hour: 11, minutes: 2, events: 11 },
  { archetype: "explorer", daysAgo: 0, hour: 14, minutes: 9, events: 26 },
  { archetype: "confused", daysAgo: 0, hour: 16, minutes: 5, events: 19 },
  { archetype: "goal_seeker", daysAgo: 1, hour: 8, minutes: 2, events: 9 },
  { archetype: "comparison_shopper", daysAgo: 1, hour: 10, minutes: 7, events: 22 },
  { archetype: "explorer", daysAgo: 1, hour: 13, minutes: 11, events: 31 },
  { archetype: "goal_seeker", daysAgo: 1, hour: 19, minutes: 3, events: 12 },
  { archetype: "comparison_shopper", daysAgo: 2, hour: 9, minutes: 8, events: 20 },
  { archetype: "confused", daysAgo: 2, hour: 12, minutes: 4, events: 16 },
  { archetype: "goal_seeker", daysAgo: 2, hour: 15, minutes: 2, events: 10 },
  { archetype: "explorer", daysAgo: 3, hour: 10, minutes: 10, events: 28 },
  { archetype: "goal_seeker", daysAgo: 3, hour: 17, minutes: 3, events: 13 },
  { archetype: "comparison_shopper", daysAgo: 4, hour: 11, minutes: 6, events: 18 },
  { archetype: "confused", daysAgo: 4, hour: 20, minutes: 5, events: 15 },
  { archetype: "goal_seeker", daysAgo: 5, hour: 9, minutes: 2, events: 9 },
  { archetype: "explorer", daysAgo: 5, hour: 14, minutes: 12, events: 33 },
  { archetype: "comparison_shopper", daysAgo: 6, hour: 16, minutes: 7, events: 21 },
];

export const DEMO_SESSIONS: SessionRow[] = SESSION_PLAN.map((plan, i) => {
  const session_start = isoAt(plan.daysAgo, plan.hour, 0);
  const session_end = isoAt(plan.daysAgo, plan.hour, plan.minutes);
  return {
    id: `demo-session-${i + 1}`,
    archetype: plan.archetype,
    total_events: plan.events,
    session_start,
    session_end,
    classified_at: session_end,
  };
});

// ------------------------------------------------------------------
// Session detail (scores + event timeline)
// ------------------------------------------------------------------

interface ArchetypePattern {
  scores: { velocity: number; backtrack: number; hesitation: number; exploration: number };
  pages: string[];
  eventTypes: string[];
}

const PATTERNS: Record<Archetype, ArchetypePattern> = {
  goal_seeker: {
    scores: { velocity: 8.6, backtrack: 0.4, hesitation: 1.2, exploration: 2.1 },
    pages: ["/", "/products", "/products/shoes", "/cart", "/checkout"],
    eventTypes: ["page_view", "click", "click", "page_view", "click"],
  },
  explorer: {
    scores: { velocity: 3.1, backtrack: 1.8, hesitation: 4.5, exploration: 8.9 },
    pages: ["/", "/blog", "/products", "/pricing", "/support", "/blog"],
    eventTypes: ["page_view", "scroll", "hover", "page_view", "scroll", "page_view"],
  },
  confused: {
    scores: { velocity: 5.4, backtrack: 8.7, hesitation: 3.2, exploration: 4.0 },
    pages: ["/", "/products", "/", "/products", "/cart", "/products"],
    eventTypes: ["page_view", "click", "backtrack", "rage_click", "dead_click", "backtrack"],
  },
  comparison_shopper: {
    scores: { velocity: 2.8, backtrack: 2.3, hesitation: 7.6, exploration: 5.5 },
    pages: ["/products", "/products/shoes", "/products/jackets", "/products/shoes", "/pricing"],
    eventTypes: ["page_view", "hover", "hover", "click", "hover"],
  },
};

export interface DemoEvent {
  event_type: string;
  page_url: string;
  element_selector: string | null;
  x: number | null;
  y: number | null;
  duration_ms: number | null;
  scroll_depth: number | null;
  timestamp: string;
}

export interface DemoSessionDetail {
  id: string;
  archetype: Archetype;
  total_events: number;
  session_start: string;
  session_end: string;
  velocity_score: number;
  backtrack_score: number;
  hesitation_score: number;
  exploration_score: number;
  events: DemoEvent[];
}

function buildEvents(
  pattern: ArchetypePattern,
  count: number,
  startMs: number,
  endMs: number
): DemoEvent[] {
  const span = Math.max(endMs - startMs, count * 1000);
  const events: DemoEvent[] = [];

  for (let i = 0; i < count; i++) {
    const eventType = pattern.eventTypes[i % pattern.eventTypes.length];
    const page = pattern.pages[i % pattern.pages.length];
    const t = new Date(startMs + Math.round((span * i) / Math.max(count - 1, 1)));

    events.push({
      event_type: eventType,
      page_url: url(page),
      element_selector: eventType === "click" || eventType === "rage_click" || eventType === "dead_click"
        ? `button.${["add-to-cart", "nav-link", "cta-primary", "product-card"][i % 4]}`
        : null,
      x: eventType.includes("click") ? 120 + ((i * 47) % 900) : null,
      y: eventType.includes("click") ? 90 + ((i * 31) % 500) : null,
      duration_ms: eventType === "hover" ? 800 + ((i * 137) % 2200) : null,
      scroll_depth: eventType === "scroll" ? 20 + ((i * 17) % 80) : null,
      timestamp: t.toISOString(),
    });
  }

  return events;
}

export function getDemoSessionDetail(sessionId: string): DemoSessionDetail | null {
  const row = DEMO_SESSIONS.find((s) => s.id === sessionId);
  if (!row) return null;

  const pattern = PATTERNS[row.archetype];
  const startMs = new Date(row.session_start).getTime();
  const endMs = new Date(row.session_end).getTime();

  return {
    id: row.id,
    archetype: row.archetype,
    total_events: row.total_events,
    session_start: row.session_start,
    session_end: row.session_end,
    velocity_score: pattern.scores.velocity,
    backtrack_score: pattern.scores.backtrack,
    hesitation_score: pattern.scores.hesitation,
    exploration_score: pattern.scores.exploration,
    events: buildEvents(pattern, row.total_events, startMs, endMs),
  };
}

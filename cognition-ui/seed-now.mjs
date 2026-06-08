import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local
readFileSync(".env.local", "utf8").split("\n").forEach((l) => {
  const idx = l.indexOf("=");
  if (idx > -1) process.env[l.slice(0, idx).trim()] = l.slice(idx + 1).trim();
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Target the existing portfolio project ──────────────────────────────────
const TRACKING_ID = "1d22169f-1c42-4062-b3ba-c6b439a73753";

const JOURNEYS = {
  goal_seeker: [
    ["/", "/products", "/product/running-shoes", "/cart", "/checkout"],
    ["/", "/products", "/product/jacket", "/cart", "/checkout"],
    ["/products", "/product/headphones", "/cart", "/checkout"],
    ["/", "/product/sunglasses", "/cart", "/checkout"],
    ["/", "/products", "/product/watch", "/checkout"],
  ],
  explorer: [
    ["/", "/about", "/products", "/product/running-shoes", "/blog", "/contact"],
    ["/", "/products", "/product/jacket", "/products", "/product/headphones", "/about"],
    ["/blog", "/", "/products", "/product/sunglasses", "/product/watch", "/about"],
    ["/", "/about", "/blog", "/products", "/product/running-shoes", "/product/jacket"],
    ["/", "/products", "/product/headphones", "/blog", "/product/watch", "/products"],
  ],
  comparison_shopper: [
    ["/products", "/product/running-shoes", "/products", "/product/jacket", "/products", "/product/running-shoes", "/cart"],
    ["/", "/product/watch", "/product/headphones", "/product/watch", "/cart"],
    ["/products", "/product/sunglasses", "/product/jacket", "/product/sunglasses", "/cart"],
    ["/", "/products", "/product/running-shoes", "/product/headphones", "/product/running-shoes"],
    ["/products", "/product/watch", "/product/sunglasses", "/product/watch", "/products"],
  ],
  confused: [
    ["/", "/contact", "/", "/about", "/", "/products", "/"],
    ["/products", "/product/jacket", "/", "/products", "/contact", "/products"],
    ["/checkout", "/cart", "/", "/products", "/", "/cart"],
    ["/", "/blog", "/", "/contact", "/blog", "/"],
    ["/product/watch", "/", "/product/watch", "/contact", "/"],
  ],
};

const WEIGHTS = [
  { archetype: "goal_seeker",        w: 40 },
  { archetype: "explorer",           w: 25 },
  { archetype: "comparison_shopper", w: 25 },
  { archetype: "confused",           w: 10 },
];

function pickArchetype() {
  let roll = Math.random() * 100, cum = 0;
  for (const { archetype, w } of WEIGHTS) {
    cum += w;
    if (roll < cum) return archetype;
  }
  return "goal_seeker";
}

function scoreFor(a) {
  return {
    goal_seeker:        { velocity_score: 0.85, backtrack_score: 0.05, hesitation_score: 0.05, exploration_score: 0.10 },
    explorer:           { velocity_score: 0.30, backtrack_score: 0.15, hesitation_score: 0.40, exploration_score: 0.85 },
    comparison_shopper: { velocity_score: 0.40, backtrack_score: 0.45, hesitation_score: 0.75, exploration_score: 0.50 },
    confused:           { velocity_score: 0.15, backtrack_score: 0.80, hesitation_score: 0.70, exploration_score: 0.20 },
  }[a];
}

const sessions = [], events = [];

for (let day = 6; day >= 0; day--) {
  const count = 7 + Math.floor(Math.random() * 5); // 7–11 per day
  for (let i = 0; i < count; i++) {
    const archetype = pickArchetype();
    const journeys  = JOURNEYS[archetype];
    const journey   = journeys[Math.floor(Math.random() * journeys.length)];
    const sid       = crypto.randomUUID();

    const start = new Date();
    start.setDate(start.getDate() - day);
    start.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
    start.setTime(start.getTime() + i * 95_000);

    const end = new Date(start.getTime() + 60_000 + Math.random() * 360_000);

    sessions.push({
      id: sid, tracking_id: TRACKING_ID, archetype, ...scoreFor(archetype),
      total_events: journey.length,
      session_start: start.toISOString(),
      session_end:   end.toISOString(),
      classified_at: end.toISOString(),
    });

    journey.forEach((page_url, idx) => {
      events.push({
        tracking_id: TRACKING_ID, session_id: sid,
        event_type: "page_view", page_url,
        timestamp: new Date(start.getTime() + idx * 18_000).toISOString(),
      });
    });
  }
}

console.log(`Inserting ${sessions.length} sessions and ${events.length} events…`);

const { error: se } = await supabase.from("sessions").insert(sessions);
if (se) { console.error("Sessions failed:", se.message); process.exit(1); }

// chunk events into 200
for (let i = 0; i < events.length; i += 200) {
  const { error: ee } = await supabase.from("events").insert(events.slice(i, i + 200));
  if (ee) { console.error("Events failed:", ee.message); process.exit(1); }
}

console.log("✓ Done! Refresh your dashboard.");

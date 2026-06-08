import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Archetype } from "@/features/sessions/types";

// ─── Page journeys per archetype ────────────────────────────────────────────

const JOURNEYS: Record<Archetype, string[][]> = {
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

const ARCHETYPE_WEIGHTS: { archetype: Archetype; weight: number }[] = [
  { archetype: "goal_seeker",       weight: 40 },
  { archetype: "explorer",          weight: 25 },
  { archetype: "comparison_shopper",weight: 25 },
  { archetype: "confused",          weight: 10 },
];

function pickArchetype(): Archetype {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const { archetype, weight } of ARCHETYPE_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) return archetype;
  }
  return "goal_seeker";
}

function pickJourney(archetype: Archetype): string[] {
  const list = JOURNEYS[archetype];
  return list[Math.floor(Math.random() * list.length)];
}

function daysAgo(n: number, offsetMs = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
  d.setTime(d.getTime() + offsetMs);
  return d;
}

function scoreFor(archetype: Archetype) {
  switch (archetype) {
    case "goal_seeker":        return { velocity_score: 0.85, backtrack_score: 0.05, hesitation_score: 0.05, exploration_score: 0.1 };
    case "explorer":           return { velocity_score: 0.3,  backtrack_score: 0.15, hesitation_score: 0.4,  exploration_score: 0.85 };
    case "comparison_shopper": return { velocity_score: 0.4,  backtrack_score: 0.45, hesitation_score: 0.75, exploration_score: 0.5 };
    case "confused":           return { velocity_score: 0.15, backtrack_score: 0.8,  hesitation_score: 0.7,  exploration_score: 0.2 };
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const supabase = createServiceClient();

  // 1. Create demo project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: "Demo Store", domain: "demo.cognition.io" })
    .select("id, tracking_id")
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: projectError?.message ?? "project insert failed" }, { status: 500 });
  }

  const { tracking_id } = project;

  // 2. Generate sessions spread across 7 days (6–10 per day = ~56 total)
  const sessionsToInsert: object[] = [];
  const eventsToInsert:   object[] = [];

  for (let day = 6; day >= 0; day--) {
    const count = 6 + Math.floor(Math.random() * 5); // 6–10 per day
    for (let i = 0; i < count; i++) {
      const archetype  = pickArchetype();
      const journey    = pickJourney(archetype);
      const scores     = scoreFor(archetype);
      const sessionId  = crypto.randomUUID();
      const sessionStart = daysAgo(day, i * 90_000); // stagger by 1.5 min
      const sessionEnd   = new Date(sessionStart.getTime() + 60_000 + Math.random() * 300_000);

      sessionsToInsert.push({
        id:             sessionId,
        tracking_id,
        archetype,
        ...scores,
        total_events:   journey.length,
        session_start:  sessionStart.toISOString(),
        session_end:    sessionEnd.toISOString(),
        classified_at:  sessionEnd.toISOString(),
      });

      journey.forEach((page_url, idx) => {
        eventsToInsert.push({
          tracking_id,
          session_id:  sessionId,
          event_type:  "page_view",
          page_url,
          timestamp:   new Date(sessionStart.getTime() + idx * 15_000).toISOString(),
        });
      });
    }
  }

  // 3. Batch insert sessions
  const { error: sessErr } = await supabase.from("sessions").insert(sessionsToInsert);
  if (sessErr) return NextResponse.json({ error: sessErr.message }, { status: 500 });

  // 4. Batch insert events (in chunks of 200)
  for (let i = 0; i < eventsToInsert.length; i += 200) {
    const { error: evtErr } = await supabase.from("events").insert(eventsToInsert.slice(i, i + 200));
    if (evtErr) return NextResponse.json({ error: evtErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    tracking_id,
    sessions: sessionsToInsert.length,
    events:   eventsToInsert.length,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/rate-limit";
import type { EventBatch } from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_EVENT_TYPES = new Set([
  "click",
  "hover",
  "scroll",
  "backtrack",
  "dead_click",
  "rage_click",
  "page_view",
]);

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function validate(body: unknown): body is EventBatch {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;

  if (typeof b.tracking_id !== "string" || !UUID_RE.test(b.tracking_id))
    return false;
  if (typeof b.session_id !== "string" || b.session_id.trim() === "")
    return false;
  if (!Array.isArray(b.events) || b.events.length === 0) return false;
  if (b.events.length > 200) return false;

  for (const ev of b.events as unknown[]) {
    if (!ev || typeof ev !== "object") return false;
    const e = ev as Record<string, unknown>;
    if (typeof e.event_type !== "string" || !VALID_EVENT_TYPES.has(e.event_type))
      return false;
    if (typeof e.page_url !== "string" || e.page_url.trim() === "")
      return false;
    if (typeof e.timestamp !== "string") return false;
  }
  return true;
}

export async function handleIngestEvents(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!validate(body)) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { tracking_id, session_id, events } = body;

  if (!checkRateLimit(tracking_id, 100, 60_000)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: CORS_HEADERS }
    );
  }

  const supabase = createServiceClient();

  const { data: project } = await supabase
    .from("projects")
    .select("tracking_id")
    .eq("tracking_id", tracking_id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json(
      { error: "Unknown tracking_id" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const rows = events.map((ev) => ({
    tracking_id,
    session_id,
    event_type: ev.event_type,
    page_url: ev.page_url,
    element_selector: ev.element_selector ?? null,
    x: ev.x ?? null,
    y: ev.y ?? null,
    duration_ms: ev.duration_ms ?? null,
    scroll_depth: ev.scroll_depth ?? null,
    timestamp: ev.timestamp,
  }));

  const { error } = await supabase.from("events").insert(rows);

  if (error) {
    console.error("[events] Insert failed:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  return NextResponse.json(
    { ok: true, inserted: rows.length },
    { status: 200, headers: CORS_HEADERS }
  );
}

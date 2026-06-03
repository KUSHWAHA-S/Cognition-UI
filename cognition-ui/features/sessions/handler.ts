import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { classifySession } from "./classifier";

const MAX_RUNTIME_MS = 8000;

export function isAuthorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function handleClassifySessions(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const startedAt = Date.now();
  const supabase = createServiceClient();

  const { data: pending, error } = await supabase
    .from("unclassified_sessions")
    .select("session_id, tracking_id, event_count");

  if (error) {
    console.error("[classify] Failed to fetch unclassified sessions:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ classified: 0, errors: 0 });
  }

  let classified = 0;
  let errors = 0;

  for (const row of pending) {
    if (Date.now() - startedAt > MAX_RUNTIME_MS) {
      console.warn(
        `[classify] Time limit approaching — stopping after ${classified} sessions.`
      );
      break;
    }

    try {
      const result = await classifySession(row.session_id, row.tracking_id);

      const { error: upsertError } = await supabase
        .from("sessions")
        .upsert(result, { onConflict: "id" });

      if (upsertError) {
        console.error(`[classify] Upsert failed for ${row.session_id}:`, upsertError);
        errors++;
      } else {
        classified++;
      }
    } catch (err) {
      console.error(`[classify] Failed for ${row.session_id}:`, err);
      errors++;
    }
  }

  console.log(
    `[classify] Done in ${Date.now() - startedAt}ms — classified: ${classified}, errors: ${errors}`
  );

  return NextResponse.json({ classified, errors });
}

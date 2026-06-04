import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

interface Params {
  params: Promise<{ trackingId: string }>;
}

async function getAuthorisedProject(trackingId: string) {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user }, error } = await supabaseAuth.auth.getUser();
  if (error || !user) return { user: null, project: null };

  const supabase = createServiceClient();
  const { data: project } = await supabase
    .from("projects")
    .select("tracking_id, user_id")
    .eq("tracking_id", trackingId)
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, project };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { trackingId } = await params;
  const { project } = await getAuthorisedProject(trackingId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, domain } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (typeof domain !== "string" || domain.trim() === "") {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      name: name.trim(),
      domain: domain.trim().replace(/^https?:\/\//, ""),
    })
    .eq("tracking_id", trackingId)
    .select("id, tracking_id, name, domain")
    .single();

  if (error) {
    console.error("[projects] Update failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { trackingId } = await params;
  const { project } = await getAuthorisedProject(trackingId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("tracking_id", trackingId);

  if (error) {
    console.error("[projects] Delete failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

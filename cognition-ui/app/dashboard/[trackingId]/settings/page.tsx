import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { EmbedCode } from "@/features/projects/components/EmbedCode";
import { ProjectSettingsForm } from "@/features/projects/components/ProjectSettingsForm";
import { DangerZone } from "@/features/projects/components/DangerZone";

interface Props {
  params: Promise<{ trackingId: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { trackingId } = await params;

  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) redirect("/login");

  const supabase = createServiceClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, domain, tracking_id, created_at")
    .eq("tracking_id", trackingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Manage your project and get your embed code.
        </p>
      </div>

      {/* Embed code */}
      <section
        className="rounded-2xl p-6 space-y-1"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Installation
        </h2>
        <EmbedCode trackingId={project.tracking_id} />
      </section>

      {/* Project details */}
      <section
        className="rounded-2xl p-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Project details
        </h2>
        <ProjectSettingsForm
          trackingId={project.tracking_id}
          initialName={project.name}
          initialDomain={project.domain}
        />
      </section>

      {/* Danger zone */}
      <DangerZone trackingId={project.tracking_id} projectName={project.name} />
    </div>
  );
}

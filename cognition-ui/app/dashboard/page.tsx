import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SeedButton } from "@/features/dashboard/components/SeedButton";

export default async function DashboardRootPage() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) redirect("/login");

  const supabase = createServiceClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("tracking_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (projects && projects.length > 0) {
    redirect(`/dashboard/${projects[0].tracking_id}/overview`);
  }

  // No projects yet — show empty state with seed option
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl text-center space-y-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div>
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No projects yet
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Load demo data to explore the dashboard, or create a real project.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <SeedButton />
          <a
            href="/dashboard/new"
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              border: "1px solid var(--border-muted)",
              color: "var(--text-muted)",
            }}
          >
            Create a real project
          </a>
        </div>
      </div>
    </main>
  );
}

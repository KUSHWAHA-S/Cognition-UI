import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { DEMO_TRACKING_ID, DEMO_PROJECT_NAME } from "@/features/dashboard/demoData";

interface Props {
  children: React.ReactNode;
  params: Promise<{ trackingId: string }>;
}

export default async function DashboardLayout({ children, params }: Props) {
  const { trackingId } = await params;

  if (trackingId === DEMO_TRACKING_ID) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>
        <Sidebar trackingId={trackingId} projectName={DEMO_PROJECT_NAME} isDemo />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    );
  }

  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) redirect("/login");

  const supabase = createServiceClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name, tracking_id")
    .eq("tracking_id", trackingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <Sidebar trackingId={trackingId} projectName={project.name} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

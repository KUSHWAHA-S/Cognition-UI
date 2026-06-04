import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Sidebar } from "@/features/dashboard/components/Sidebar";

interface Props {
  children: React.ReactNode;
  params: Promise<{ trackingId: string }>;
}

export default async function DashboardLayout({ children, params }: Props) {
  const { trackingId } = await params;

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
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar trackingId={trackingId} projectName={project.name} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

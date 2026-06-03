import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export default async function DashboardRootPage() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) redirect("/login");

  // Load the user's first project
  const supabase = createServiceClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("tracking_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!projects || projects.length === 0) {
    redirect("/dashboard/new");
  }

  redirect(`/dashboard/${projects[0].tracking_id}/overview`);
}

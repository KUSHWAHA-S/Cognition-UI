import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { SessionsTable } from "@/features/sessions/components/SessionsTable";

interface Props {
  params: Promise<{ trackingId: string }>;
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 20;

export default async function SessionsPage({ params, searchParams }: Props) {
  const { trackingId } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) redirect("/login");

  const supabase = createServiceClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("sessions")
    .select(
      "id, archetype, total_events, session_start, session_end, classified_at",
      { count: "exact" }
    )
    .eq("tracking_id", trackingId)
    .not("archetype", "is", null)
    .order("session_start", { ascending: false })
    .range(from, to);

  const sessions = data ?? [];
  const hasMore = (count ?? 0) > to + 1;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Sessions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {count ?? 0} classified session{count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <SessionsTable
        sessions={sessions}
        trackingId={trackingId}
        page={page}
        hasMore={hasMore}
      />
    </div>
  );
}

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { ArchetypeDonut } from "@/features/dashboard/components/ArchetypeDonut";
import { SessionTrend } from "@/features/dashboard/components/SessionTrend";
import { ARCHETYPE_CONFIG } from "@/features/dashboard/constants";
import type { OverviewData } from "@/features/dashboard/types";

interface Props {
  params: Promise<{ trackingId: string }>;
}

async function getOverviewData(trackingId: string, userId: string): Promise<OverviewData | null> {
  const supabase = createServiceClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: sessions } = await supabase
    .from("sessions")
    .select("archetype, session_start")
    .eq("tracking_id", trackingId)
    .gte("session_start", sevenDaysAgo.toISOString())
    .not("archetype", "is", null);

  const rows = sessions ?? [];

  // Archetype breakdown
  const countMap: Record<string, number> = {};
  for (const row of rows) {
    countMap[row.archetype] = (countMap[row.archetype] ?? 0) + 1;
  }

  const archetype_breakdown = Object.entries(countMap)
    .map(([archetype, count]) => ({ archetype: archetype as any, count }))
    .sort((a, b) => b.count - a.count);

  // 7-day trend with zero-fill
  const dayMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of rows) {
    const key = row.session_start.slice(0, 10);
    if (key in dayMap) dayMap[key]++;
  }

  const session_trend = Object.entries(dayMap).map(([date, count]) => ({
    date,
    count,
  }));

  const total_this_week = rows.length;
  const top_archetype = archetype_breakdown[0]?.archetype ?? null;
  const highest_dropoff =
    countMap["confused"] > 0 ? "confused" as any : top_archetype;

  return {
    archetype_breakdown,
    session_trend,
    total_this_week,
    top_archetype,
    highest_dropoff,
  };
}

export default async function OverviewPage({ params }: Props) {
  const { trackingId } = await params;

  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) redirect("/login");

  const data = await getOverviewData(trackingId, user.id);
  if (!data) redirect("/dashboard");

  const topConfig = data.top_archetype
    ? ARCHETYPE_CONFIG[data.top_archetype]
    : null;

  const dropoffConfig = data.highest_dropoff
    ? ARCHETYPE_CONFIG[data.highest_dropoff]
    : null;

  // Sessions today
  const today = new Date().toISOString().slice(0, 10);
  const todayCount =
    data.session_trend.find((d) => d.date === today)?.count ?? 0;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Last 7 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sessions this week"
          value={data.total_this_week}
        />
        <StatCard
          label="Today"
          value={todayCount}
          sub="sessions"
        />
        <StatCard
          label="Top archetype"
          value={topConfig?.label ?? "—"}
          accent={topConfig ? `text-[${topConfig.color}]` : "text-gray-500"}
        />
        <StatCard
          label="Needs attention"
          value={dropoffConfig?.label ?? "—"}
          sub="highest confusion signal"
          accent="text-red-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Archetype breakdown
          </h2>
          <ArchetypeDonut data={data.archetype_breakdown} />
        </div>

        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            Sessions per day
          </h2>
          <SessionTrend data={data.session_trend} />

          {/* Legend under chart */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {data.archetype_breakdown.map(({ archetype, count }) => {
              const cfg = ARCHETYPE_CONFIG[archetype];
              const pct = data.total_this_week
                ? Math.round((count / data.total_this_week) * 100)
                : 0;
              return (
                <div key={archetype} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: cfg.color }}
                  />
                  {cfg.label} {pct}%
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

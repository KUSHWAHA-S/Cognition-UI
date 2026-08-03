import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { ArchetypeDonut } from "@/features/dashboard/components/ArchetypeDonut";
import { SessionTrend } from "@/features/dashboard/components/SessionTrend";
import { ARCHETYPE_CONFIG } from "@/features/dashboard/constants";
import { DEMO_OVERVIEW } from "@/features/dashboard/demoData";

export function DemoPreview() {
  const data = DEMO_OVERVIEW;
  const topConfig = data.top_archetype
    ? ARCHETYPE_CONFIG[data.top_archetype]
    : null;
  const dropoffConfig = data.highest_dropoff
    ? ARCHETYPE_CONFIG[data.highest_dropoff]
    : null;
  const todayCount = data.session_trend[data.session_trend.length - 1]?.count ?? 0;

  return (
    <section id="demo" className="px-6 py-20 scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
            style={{
              color: "var(--maroon-600)",
              background: "rgba(174,32,18,0.08)",
              border: "1px solid rgba(174,32,18,0.2)",
            }}
          >
            Live preview · sample data
          </span>
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            This is the real dashboard
          </h2>
          <p
            className="text-sm max-w-xl mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            Every chart below is the actual component your dashboard renders —
            just wired to sample sessions instead of a live project.
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 space-y-8"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Sessions this week"
              value={data.total_this_week}
              borderColor="var(--orange-500)"
              accent="var(--orange-300)"
            />
            <StatCard
              label="Today"
              value={todayCount}
              sub="sessions"
              borderColor="var(--maroon-400)"
              accent="var(--text-primary)"
            />
            <StatCard
              label="Top archetype"
              value={topConfig?.label ?? "—"}
              borderColor={topConfig?.color ?? "var(--border-muted)"}
              accent={topConfig?.color ?? "var(--text-muted)"}
            />
            <StatCard
              label="Needs attention"
              value={dropoffConfig?.label ?? "—"}
              sub="highest confusion signal"
              borderColor="var(--color-danger)"
              accent="var(--color-danger)"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Archetype breakdown
              </h3>
              <ArchetypeDonut data={data.archetype_breakdown} />
            </div>
            <div>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Sessions per day
              </h3>
              <SessionTrend data={data.session_trend} />
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Link
              href="/dashboard/demo/overview"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-150"
              style={{
                color: "var(--maroon-600)",
                border: "1px solid var(--border-muted)",
              }}
            >
              Open the full dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

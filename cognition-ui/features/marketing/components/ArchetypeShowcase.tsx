import { ARCHETYPE_CONFIG, ARCHETYPE_ORDER } from "@/features/dashboard/constants";

export function ArchetypeShowcase() {
  return (
    <section className="px-6 py-20" style={{ background: "var(--bg-sidebar)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Four archetypes, one classifier
          </h2>
          <p
            className="text-sm max-w-xl mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            Every session is scored on velocity, backtracking, hesitation and
            exploration, then bucketed automatically — no manual tagging.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ARCHETYPE_ORDER.map((archetype) => {
            const cfg = ARCHETYPE_CONFIG[archetype];
            return (
              <div
                key={archetype}
                className="rounded-xl p-5 flex flex-col gap-2"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: cfg.color }}
                />
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {cfg.label}
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {cfg.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

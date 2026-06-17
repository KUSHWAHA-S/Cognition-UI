export default function OverviewLoading() {
  return (
    <div className="space-y-8 max-w-5xl animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-32 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-4 w-48 rounded" style={{ background: "var(--bg-elevated)" }} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="h-3 w-24 rounded" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-8 w-16 rounded" style={{ background: "var(--bg-elevated)" }} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 space-y-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="h-3 w-36 rounded" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-48 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

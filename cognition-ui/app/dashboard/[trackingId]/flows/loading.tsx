export default function FlowsLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-28 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-4 w-56 rounded" style={{ background: "var(--bg-elevated)" }} />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-24 rounded-full" style={{ background: "var(--bg-elevated)" }} />
        ))}
      </div>

      {/* Sankey placeholder */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="h-80 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
      </div>
    </div>
  );
}

export default function SessionDetailLoading() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      {/* Back link */}
      <div className="h-4 w-32 rounded" style={{ background: "var(--bg-elevated)" }} />

      {/* Header card */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-3 w-64 rounded" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-6 w-28 rounded-full" style={{ background: "var(--bg-elevated)" }} />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <div className="h-3 w-24 rounded" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-3 w-16 rounded" style={{ background: "var(--bg-elevated)" }} />
          </div>
        </div>

        {/* Score bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 rounded" style={{ background: "var(--bg-elevated)" }} />
              <div className="h-1.5 rounded-full" style={{ background: "var(--bg-elevated)" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <div className="h-4 w-40 rounded" style={{ background: "var(--bg-elevated)" }} />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 pl-1">
            <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "var(--bg-elevated)" }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded" style={{ background: "var(--bg-elevated)" }} />
              <div className="h-3 w-48 rounded" style={{ background: "var(--bg-elevated)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

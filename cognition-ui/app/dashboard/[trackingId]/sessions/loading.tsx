export default function SessionsLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-28 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-4 w-40 rounded" style={{ background: "var(--bg-elevated)" }} />
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
      >
        {/* Header row */}
        <div
          className="grid grid-cols-5 gap-4 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 rounded" style={{ background: "var(--bg-elevated)" }} />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 px-4 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="h-4 rounded"
                style={{
                  background: "var(--bg-elevated)",
                  width: j === 0 ? "80%" : j === 4 ? "60%" : "100%",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

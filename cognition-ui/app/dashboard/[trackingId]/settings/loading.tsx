export default function SettingsLoading() {
  return (
    <div className="space-y-8 max-w-2xl animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-24 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-4 w-56 rounded" style={{ background: "var(--bg-elevated)" }} />
      </div>

      {/* Sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="h-3 w-28 rounded" style={{ background: "var(--bg-elevated)" }} />
          <div className="space-y-3">
            <div className="h-10 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-10 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
          </div>
          <div className="h-9 w-28 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
        </div>
      ))}
    </div>
  );
}

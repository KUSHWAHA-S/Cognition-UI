interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  borderColor?: string;
}

export function StatCard({
  label,
  value,
  sub,
  accent = "var(--text-primary)",
  borderColor = "var(--orange-500)",
}: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-1.5 relative overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full"
        style={{ background: borderColor }}
      />

      <span
        className="text-xs uppercase tracking-wider font-medium pl-3"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-3xl font-bold pl-3 leading-none"
        style={{ color: accent }}
      >
        {value}
      </span>
      {sub && (
        <span
          className="text-xs pl-3"
          style={{ color: "var(--text-dim)" }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

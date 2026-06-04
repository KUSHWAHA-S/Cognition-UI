interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string; // tailwind text colour class e.g. "text-indigo-400"
}

export function StatCard({ label, value, sub, accent = "text-white" }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-5 flex flex-col gap-1">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`text-3xl font-semibold ${accent}`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

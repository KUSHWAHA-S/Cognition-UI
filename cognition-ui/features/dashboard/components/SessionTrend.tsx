"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { DayCount } from "@/features/dashboard/types";

interface Props {
  data: DayCount[];
}

function formatDay(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-xl"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-muted)",
        color: "var(--text-secondary)",
      }}
    >
      <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
        {label && formatDay(label)}
      </p>
      <p style={{ color: "var(--orange-300)", fontWeight: 600 }}>
        {payload[0].value} sessions
      </p>
    </div>
  );
}

export function SessionTrend({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E05E1C" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#E05E1C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2E1A1A" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#8A7070", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#8A7070", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3D2525" }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#E05E1C"
          strokeWidth={2}
          fill="url(#orangeGrad)"
          dot={{ fill: "#E05E1C", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#F59E0B" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

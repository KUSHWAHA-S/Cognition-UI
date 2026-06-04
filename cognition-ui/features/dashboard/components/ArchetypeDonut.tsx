"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ARCHETYPE_CONFIG } from "@/features/dashboard/constants";
import type { ArchetypeCount } from "@/features/dashboard/types";
import type { Archetype } from "@/features/sessions/types";

interface Props {
  data: ArchetypeCount[];
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { archetype: Archetype; count: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const { archetype, count } = payload[0].payload;
  const config = ARCHETYPE_CONFIG[archetype];
  return (
    <div className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm shadow-lg">
      <p className="font-medium" style={{ color: config.color }}>
        {config.label}
      </p>
      <p className="text-gray-300">{count} sessions</p>
      <p className="text-gray-500 text-xs mt-0.5">{config.description}</p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  if (!payload) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-gray-400">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export function ArchetypeDonut({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
        No classified sessions yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    archetype: d.archetype,
    count: d.count,
    name: ARCHETYPE_CONFIG[d.archetype].label,
  }));

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
            dataKey="count"
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.archetype}
                fill={ARCHETYPE_CONFIG[entry.archetype].color}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
           style={{ top: "-12px" }}>
        <span className="text-2xl font-semibold text-white">{total}</span>
        <span className="text-xs text-gray-500">sessions</span>
      </div>
    </div>
  );
}

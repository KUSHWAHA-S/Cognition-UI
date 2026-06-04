"use client";

import { useMemo, useState } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  SankeyNode,
  SankeyLink,
  SankeyGraph,
} from "d3-sankey";
import { ARCHETYPE_CONFIG, ARCHETYPE_ORDER } from "@/features/dashboard/constants";
import { toLabel } from "@/features/dashboard/flows/utils";
import type { Archetype } from "@/features/sessions/types";
import type { RawFlow } from "@/features/dashboard/flows/types";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface NodeDatum { id: string; label: string }
interface LinkDatum { archetype: Archetype; value: number }

type SNode = SankeyNode<NodeDatum, LinkDatum>;
type SLink = SankeyLink<NodeDatum, LinkDatum>;

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const WIDTH = 900;
const HEIGHT = 500;
const NODE_WIDTH = 16;
const NODE_PADDING = 18;

const FILTER_OPTIONS: { value: "all" | Archetype; label: string }[] = [
  { value: "all", label: "All archetypes" },
  ...ARCHETYPE_ORDER.map((a) => ({
    value: a,
    label: ARCHETYPE_CONFIG[a].label,
  })),
];

// ------------------------------------------------------------------
// Tooltip state
// ------------------------------------------------------------------

interface TooltipState {
  x: number;
  y: number;
  content: string;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function SankeyDiagram({ flows }: { flows: RawFlow[] }) {
  const [filter, setFilter] = useState<"all" | Archetype>("all");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // 1. Filter flows by archetype
  const filteredFlows = useMemo(
    () => (filter === "all" ? flows : flows.filter((f) => f.archetype === filter)),
    [flows, filter]
  );

  // 2. Build Sankey graph from filtered flows
  const graph = useMemo<SankeyGraph<NodeDatum, LinkDatum> | null>(() => {
    if (!filteredFlows.length) return null;

    // Collect unique node IDs
    const nodeIds = Array.from(
      new Set(filteredFlows.flatMap((f) => [f.source, f.target]))
    );

    const nodeIndex = new Map(nodeIds.map((id, i) => [id, i]));

    const nodes: NodeDatum[] = nodeIds.map((id) => ({
      id,
      label: toLabel(id),
    }));

    const links: (LinkDatum & { source: number; target: number })[] =
      filteredFlows.map((f) => ({
        source: nodeIndex.get(f.source)!,
        target: nodeIndex.get(f.target)!,
        value: f.value,
        archetype: f.archetype,
      }));

    const layout = sankey<NodeDatum, LinkDatum>()
      .nodeWidth(NODE_WIDTH)
      .nodePadding(NODE_PADDING)
      .extent([
        [1, 1],
        [WIDTH - 1, HEIGHT - 6],
      ]);

    return layout({ nodes: nodes.map((n) => ({ ...n })), links: links.map((l) => ({ ...l })) });
  }, [filteredFlows]);

  // ------------------------------------------------------------------
  // Empty state
  // ------------------------------------------------------------------

  if (!flows.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-600 text-sm gap-2">
        <span>No flow data yet.</span>
        <span className="text-xs text-gray-700">
          Sessions need at least 2 page views to appear here.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">Filter by archetype</span>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map(({ value, label }) => {
            const active = filter === value;
            const color =
              value === "all" ? "#6366f1" : ARCHETYPE_CONFIG[value].color;
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? "text-white border-transparent"
                    : "text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200"
                }`}
                style={active ? { background: color, borderColor: color } : {}}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diagram */}
      <div className="relative overflow-x-auto rounded-xl bg-gray-950 border border-gray-800 p-2">
        {!graph ? (
          <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
            No flows for this archetype
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full"
            style={{ minHeight: 320 }}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Links */}
            <g>
              {(graph.links as SLink[]).map((link, i) => {
                const color = ARCHETYPE_CONFIG[link.archetype].color;
                const path = sankeyLinkHorizontal()(link) ?? "";
                const strokeWidth = Math.max(1, link.width ?? 1);
                return (
                  <path
                    key={i}
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.35}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={(e) => {
                      const src = (link.source as SNode).label;
                      const tgt = (link.target as SNode).label;
                      setTooltip({
                        x: e.clientX,
                        y: e.clientY,
                        content: `${src} → ${tgt}\n${link.value} sessions · ${ARCHETYPE_CONFIG[link.archetype].label}`,
                      });
                    }}
                    onMouseMove={(e) =>
                      setTooltip((t) =>
                        t ? { ...t, x: e.clientX, y: e.clientY } : t
                      )
                    }
                    onMouseLeave={() => setTooltip(null)}
                    style={{ filter: "url(#glow)" }}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {(graph.nodes as SNode[]).map((node, i) => {
                const x0 = node.x0 ?? 0;
                const x1 = node.x1 ?? 0;
                const y0 = node.y0 ?? 0;
                const y1 = node.y1 ?? 0;
                const nodeHeight = Math.max(y1 - y0, 4);
                const labelX = x1 + 6;
                const labelY = (y0 + y1) / 2;
                const alignRight = x0 > WIDTH / 2;

                return (
                  <g key={i}>
                    <rect
                      x={x0}
                      y={y0}
                      width={x1 - x0}
                      height={nodeHeight}
                      fill="#818cf8"
                      rx={3}
                      opacity={0.9}
                      onMouseEnter={(e) => {
                        const inflow = (node.targetLinks as SLink[]).reduce(
                          (s, l) => s + l.value,
                          0
                        );
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          content: `${node.label}\n${inflow || node.value} sessions`,
                        });
                      }}
                      onMouseMove={(e) =>
                        setTooltip((t) =>
                          t ? { ...t, x: e.clientX, y: e.clientY } : t
                        )
                      }
                      onMouseLeave={() => setTooltip(null)}
                    />
                    <text
                      x={alignRight ? x0 - 6 : labelX}
                      y={labelY}
                      textAnchor={alignRight ? "end" : "start"}
                      dominantBaseline="middle"
                      fontSize={11}
                      fill="#9ca3af"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Glow filter for links */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        )}

        {/* Floating tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 shadow-xl whitespace-pre-line"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
          >
            {tooltip.content}
          </div>
        )}
      </div>

      {/* Archetype legend */}
      <div className="flex flex-wrap gap-4">
        {ARCHETYPE_ORDER.map((a) => {
          const cfg = ARCHETYPE_CONFIG[a];
          const count = flows
            .filter((f) => f.archetype === a)
            .reduce((s, f) => s + f.value, 0);
          if (!count) return null;
          return (
            <div key={a} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ background: cfg.color }}
              />
              <span className="text-gray-400">{cfg.label}</span>
              <span>{count} paths</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

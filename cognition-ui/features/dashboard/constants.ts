import type { Archetype } from "@/features/sessions/types";

// Single source of truth for archetype colours and labels.
// Used by donut chart, Sankey diagram, session badges — everywhere.
export const ARCHETYPE_CONFIG: Record<
  Archetype,
  { label: string; color: string; description: string }
> = {
  explorer: {
    label: "Explorer",
    color: "#6366f1", // indigo
    description: "Discovering widely, slow and curious",
  },
  goal_seeker: {
    label: "Goal-seeker",
    color: "#22c55e", // green
    description: "Fast, direct, knows what they want",
  },
  confused: {
    label: "Confused",
    color: "#ef4444", // red
    description: "Lost, backtracking, rage clicking",
  },
  comparison_shopper: {
    label: "Comparison-shopper",
    color: "#f59e0b", // amber
    description: "Deciding, hovering, revisiting same pages",
  },
};

export const ARCHETYPE_ORDER: Archetype[] = [
  "goal_seeker",
  "explorer",
  "comparison_shopper",
  "confused",
];

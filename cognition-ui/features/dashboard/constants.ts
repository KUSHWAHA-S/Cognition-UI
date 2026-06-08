import type { Archetype } from "@/features/sessions/types";

// Single source of truth for archetype colours and labels.
// Used by donut chart, Sankey diagram, session badges — everywhere.
export const ARCHETYPE_CONFIG: Record<
  Archetype,
  { label: string; color: string; description: string }
> = {
  explorer: {
    label: "Explorer",
    color: "#E07B39", // warm orange — discovery energy
    description: "Discovering widely, slow and curious",
  },
  goal_seeker: {
    label: "Goal-seeker",
    color: "#22C55E", // green — achievement
    description: "Fast, direct, knows what they want",
  },
  confused: {
    label: "Confused",
    color: "#DC2626", // red — universal alert
    description: "Lost, backtracking, rage clicking",
  },
  comparison_shopper: {
    label: "Comparison-shopper",
    color: "#F59E0B", // amber — harmonizes with orange palette
    description: "Deciding, hovering, revisiting same pages",
  },
};

export const ARCHETYPE_ORDER: Archetype[] = [
  "goal_seeker",
  "explorer",
  "comparison_shopper",
  "confused",
];

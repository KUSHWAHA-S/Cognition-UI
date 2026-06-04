import type { Archetype } from "@/features/sessions/types";

export interface ArchetypeCount {
  archetype: Archetype;
  count: number;
}

export interface DayCount {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface OverviewData {
  archetype_breakdown: ArchetypeCount[];
  session_trend: DayCount[];
  total_this_week: number;
  top_archetype: Archetype | null;
  highest_dropoff: Archetype | null;
}

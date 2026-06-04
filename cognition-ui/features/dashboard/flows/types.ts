import type { Archetype } from "@/features/sessions/types";

export interface RawFlow {
  source: string;   // page URL
  target: string;   // page URL
  archetype: Archetype;
  value: number;    // count of sessions that took this path
}

export interface SankeyData {
  flows: RawFlow[];
  total_sessions: number;
}

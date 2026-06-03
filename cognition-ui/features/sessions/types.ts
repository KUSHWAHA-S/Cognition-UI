export type Archetype =
  | "explorer"
  | "goal_seeker"
  | "confused"
  | "comparison_shopper";

export interface ClassifiedSession {
  id: string;
  tracking_id: string;
  archetype: Archetype;
  velocity_score: number;
  backtrack_score: number;
  hesitation_score: number;
  exploration_score: number;
  total_events: number;
  session_start: string;
  session_end: string;
  classified_at: string;
}

export interface RawEvent {
  event_type: string;
  page_url: string;
  duration_ms: number | null;
  timestamp: string;
}

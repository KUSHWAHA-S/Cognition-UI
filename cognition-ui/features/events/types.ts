export interface IncomingEvent {
  event_type: string;
  page_url: string;
  element_selector?: string | null;
  x?: number | null;
  y?: number | null;
  duration_ms?: number | null;
  scroll_depth?: number | null;
  timestamp: string;
}

export interface EventBatch {
  tracking_id: string;
  session_id: string;
  events: IncomingEvent[];
}

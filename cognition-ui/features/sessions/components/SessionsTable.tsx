"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArchetypeBadge } from "./ArchetypeBadge";
import type { Archetype } from "@/features/sessions/types";

export interface SessionRow {
  id: string;
  archetype: Archetype;
  total_events: number;
  session_start: string;
  session_end: string;
  classified_at: string;
}

interface Props {
  sessions: SessionRow[];
  trackingId: string;
  page: number;
  hasMore: boolean;
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortId(id: string): string {
  return id.length > 16 ? id.slice(0, 8) + "…" + id.slice(-4) : id;
}

export function SessionsTable({ sessions, trackingId, page, hasMore }: Props) {
  const router = useRouter();

  function goTo(p: number) {
    router.push(`/dashboard/${trackingId}/sessions?page=${p}`);
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border-subtle)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
              <th
                className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Session ID
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Archetype
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Events
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Duration
              </th>
              <th
                className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm"
                  style={{ color: "var(--text-dim)", background: "var(--bg-base)" }}
                >
                  No sessions classified yet.
                </td>
              </tr>
            )}
            {sessions.map((s, idx) => (
              <tr
                key={s.id}
                onClick={() =>
                  router.push(`/dashboard/${trackingId}/sessions/${s.id}`)
                }
                className="cursor-pointer transition-colors duration-100 group"
                style={{
                  background: idx % 2 === 0 ? "var(--bg-base)" : "var(--bg-surface)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    idx % 2 === 0 ? "var(--bg-base)" : "var(--bg-surface)";
                }}
              >
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {shortId(s.id)}
                </td>
                <td className="px-4 py-3">
                  <ArchetypeBadge archetype={s.archetype} size="sm" />
                </td>
                <td className="px-4 py-3 text-right" style={{ color: "var(--text-secondary)" }}>
                  {s.total_events}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: "var(--text-secondary)" }}>
                  {formatDuration(s.session_start, s.session_end)}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: "var(--text-muted)" }}>
                  {formatDate(s.session_start)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-xs" style={{ color: "var(--text-dim)" }}>
          Page {page}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              border: "1px solid var(--border-muted)",
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              if (page > 1) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--maroon-600)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-muted)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <button
            onClick={() => goTo(page + 1)}
            disabled={!hasMore}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              border: "1px solid var(--border-muted)",
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              if (hasMore) {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--maroon-600)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-muted)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

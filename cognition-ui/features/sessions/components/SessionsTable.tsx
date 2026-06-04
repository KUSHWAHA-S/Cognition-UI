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
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900">
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                Session ID
              </th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                Archetype
              </th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">
                Events
              </th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">
                Duration
              </th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sessions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-600 text-sm"
                >
                  No sessions classified yet.
                </td>
              </tr>
            )}
            {sessions.map((s) => (
              <tr
                key={s.id}
                onClick={() =>
                  router.push(
                    `/dashboard/${trackingId}/sessions/${s.id}`
                  )
                }
                className="bg-gray-950 hover:bg-gray-900 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-mono text-gray-400">
                  {shortId(s.id)}
                </td>
                <td className="px-4 py-3">
                  <ArchetypeBadge archetype={s.archetype} size="sm" />
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {s.total_events}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {formatDuration(s.session_start, s.session_end)}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {formatDate(s.session_start)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 text-xs">Page {page}</span>
        <div className="flex gap-2">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <button
            onClick={() => goTo(page + 1)}
            disabled={!hasMore}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

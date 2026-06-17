"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function OverviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[overview]", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center h-64 gap-4 rounded-2xl"
      style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
    >
      <AlertTriangle size={24} style={{ color: "var(--color-warning)" }} />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Failed to load overview
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
        style={{ background: "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))" }}
      >
        Try again
      </button>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function SessionDetailError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[session-detail]", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center h-64 gap-4 rounded-2xl max-w-4xl"
      style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
    >
      <AlertTriangle size={24} style={{ color: "var(--color-warning)" }} />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Failed to load session
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <Link
        href=".."
        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
        style={{ background: "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))" }}
      >
        Back to sessions
      </Link>
    </div>
  );
}

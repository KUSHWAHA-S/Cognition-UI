"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

export function ClassifyButton() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<{ classified: number; errors: number } | null>(null);

  async function handleClassify() {
    setStatus("running");
    setResult(null);
    try {
      const res = await fetch("/api/sessions/classify-trigger", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ classified: data.classified, errors: data.errors });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Classify pending sessions
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Analyses unclassified sessions and assigns archetypes. Run this after new visitors arrive.
        </p>
      </div>
      <button
        onClick={handleClassify}
        disabled={status === "running"}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))",
          boxShadow: "0 2px 8px rgba(174,32,18,0.35)",
        }}
        onMouseEnter={(e) => {
          if (status !== "running")
            (e.currentTarget as HTMLElement).style.background =
              "linear-gradient(135deg, var(--maroon-500), var(--orange-500))";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))";
        }}
      >
        <Zap size={14} />
        {status === "running" ? "Classifying…" : "Run classification"}
      </button>
      {status === "done" && result && (
        <p className="text-xs" style={{ color: "var(--color-success)" }}>
          ✓ {result.classified} session{result.classified !== 1 ? "s" : ""} classified
          {result.errors > 0 && `, ${result.errors} error${result.errors !== 1 ? "s" : ""}`}
        </p>
      )}
      {status === "error" && (
        <p className="text-xs" style={{ color: "var(--color-danger)" }}>
          Failed — check that CRON_SECRET is set and the server is running.
        </p>
      )}
    </div>
  );
}

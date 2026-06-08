"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";

interface Props {
  trackingId: string;
  projectName: string;
}

export function DangerZone({ trackingId, projectName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");

    const res = await fetch(`/api/projects/${trackingId}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to delete");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        border: "1px solid rgba(220,38,38,0.25)",
        background: "rgba(220,38,38,0.04)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(220,38,38,0.12)" }}
        >
          <AlertTriangle size={15} style={{ color: "var(--color-danger)" }} />
        </div>
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--color-danger)" }}
          >
            Danger zone
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Deleting this project removes all its events and sessions permanently.
            This cannot be undone.
          </p>
        </div>
      </div>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150"
          style={{
            border: "1px solid rgba(220,38,38,0.35)",
            color: "var(--color-danger)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,38,38,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,38,38,0.35)";
          }}
        >
          <Trash2 size={14} />
          Delete project
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Delete{" "}
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {projectName}
            </span>
            ? All data will be permanently lost.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-150 disabled:opacity-50"
              style={{ background: "var(--color-danger)" }}
              onMouseEnter={(e) => {
                if (!deleting) {
                  (e.currentTarget as HTMLElement).style.opacity = "0.85";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="px-3 py-2 rounded-lg text-sm transition-all duration-150"
              style={{
                border: "1px solid var(--border-muted)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-muted)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              }}
            >
              Cancel
            </button>
          </div>
          {error && (
            <p className="text-xs" style={{ color: "var(--color-danger)" }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

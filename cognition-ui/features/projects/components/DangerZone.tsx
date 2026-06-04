"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

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
    <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-red-400">Danger zone</h3>
        <p className="text-xs text-gray-500 mt-1">
          Deleting this project removes all its events and sessions permanently. This
          cannot be undone.
        </p>
      </div>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-800 text-red-400 hover:bg-red-950 text-sm transition-colors"
        >
          <Trash2 size={14} />
          Delete project
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Delete{" "}
            <span className="font-medium text-white">{projectName}</span>?
            All data will be lost.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
    </div>
  );
}

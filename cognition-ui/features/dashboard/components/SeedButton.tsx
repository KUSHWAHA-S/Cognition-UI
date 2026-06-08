"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export function SeedButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSeed() {
    setStatus("loading");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
      setTimeout(() => { window.location.href = `/dashboard/${data.tracking_id}/overview`; }, 800);
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      onClick={handleSeed}
      disabled={status === "loading" || status === "done"}
      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-70"
      style={{
        background: "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))",
        boxShadow: "0 2px 12px rgba(174,32,18,0.4)",
      }}
      onMouseEnter={(e) => {
        if (status === "idle") {
          (e.currentTarget as HTMLElement).style.background =
            "linear-gradient(135deg, var(--maroon-500), var(--orange-500))";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))";
      }}
    >
      <Sparkles size={15} />
      {status === "idle"    && "Load demo data"}
      {status === "loading" && "Seeding…"}
      {status === "done"    && "Done! Redirecting…"}
      {status === "error"   && "Failed — try again"}
    </button>
  );
}

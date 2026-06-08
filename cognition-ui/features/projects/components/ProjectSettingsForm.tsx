"use client";

import { useState } from "react";

interface Props {
  trackingId: string;
  initialName: string;
  initialDomain: string;
}

export function ProjectSettingsForm({ trackingId, initialName, initialDomain }: Props) {
  const [name, setName] = useState(initialName);
  const [domain, setDomain] = useState(initialDomain);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const res = await fetch(`/api/projects/${trackingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain }),
    });

    if (res.ok) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? "Failed to save");
      setStatus("error");
    }
  }

  const inputStyle = {
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-muted)",
  };

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--orange-500)";
    e.target.style.boxShadow = "0 0 0 3px rgba(224,94,28,0.12)";
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--border-muted)";
    e.target.style.boxShadow = "none";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm mb-1.5 font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Project name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div>
        <label
          className="block text-sm mb-1.5 font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Domain
        </label>
        <input
          type="text"
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="mycompany.com"
        />
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={status === "saving"}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-150 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))",
            boxShadow: "0 2px 8px rgba(174,32,18,0.35)",
          }}
          onMouseEnter={(e) => {
            if (status !== "saving") {
              (e.currentTarget as HTMLElement).style.background =
                "linear-gradient(135deg, var(--maroon-500), var(--orange-500))";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))";
          }}
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && (
          <span className="text-sm font-medium" style={{ color: "var(--color-success)" }}>
            Saved
          </span>
        )}
        {status === "error" && (
          <span className="text-sm" style={{ color: "var(--color-danger)" }}>
            {errorMsg}
          </span>
        )}
      </div>
    </form>
  );
}

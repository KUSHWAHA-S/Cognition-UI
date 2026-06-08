"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(`/dashboard/${data.tracking_id}/settings`);
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
    <div
      className="w-full max-w-lg p-8 rounded-2xl"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Brand mark */}
      <div className="flex items-center gap-2.5 mb-8">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--maroon-600), var(--orange-500))",
          }}
        >
          <Activity size={16} color="#fff" />
        </div>
        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          Cognition UI
        </span>
      </div>

      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        New project
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Each project tracks one website. You can create more later.
      </p>

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
            placeholder="My Company Website"
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
          <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            No need to include https://
          </p>
        </div>

        {error && (
          <p
            className="text-sm px-3 py-2 rounded-lg"
            style={{
              color: "var(--color-danger)",
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-150 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))",
            boxShadow: "0 2px 12px rgba(174,32,18,0.4)",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.currentTarget as HTMLElement).style.background =
                "linear-gradient(135deg, var(--maroon-500), var(--orange-500))";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))";
          }}
        >
          {loading ? "Creating…" : "Create project"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createAnonClient } from "@/lib/supabase/client";
import { Activity, CheckCircle } from "lucide-react";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createAnonClient();
    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div
        className="w-full max-w-md p-8 rounded-2xl text-center"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex justify-center mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(224,94,28,0.12)" }}
          >
            <CheckCircle size={24} style={{ color: "var(--orange-400)" }} />
          </div>
        </div>
        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Check your email
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          We sent a confirmation link to{" "}
          <span style={{ color: "var(--text-secondary)" }}>{email}</span>. Click
          it to activate your account, then{" "}
          <Link
            href="/login"
            className="font-medium"
            style={{ color: "var(--orange-400)" }}
          >
            sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-md p-8 rounded-2xl"
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
        <span
          className="font-semibold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          Cognition UI
        </span>
      </div>

      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        Create your account
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Already have one?{" "}
        <Link
          href="/login"
          className="font-medium transition-colors"
          style={{ color: "var(--orange-400)" }}
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm mb-1.5 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-muted)",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "var(--orange-500)";
              (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(224,94,28,0.12)";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "var(--border-muted)";
              (e.target as HTMLInputElement).style.boxShadow = "none";
            }}
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label
            className="block text-sm mb-1.5 font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-muted)",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "var(--orange-500)";
              (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(224,94,28,0.12)";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "var(--border-muted)";
              (e.target as HTMLInputElement).style.boxShadow = "none";
            }}
            placeholder="At least 8 characters"
          />
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}

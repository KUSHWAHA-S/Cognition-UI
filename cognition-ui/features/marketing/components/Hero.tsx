import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div className="max-w-4xl mx-auto text-center">
        <span
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6"
          style={{
            color: "var(--orange-600)",
            background: "rgba(224,94,28,0.1)",
            border: "1px solid rgba(224,94,28,0.25)",
          }}
        >
          Behavioral analytics, not just click maps
        </span>

        <h1
          className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Know when a visitor is{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--maroon-600), var(--orange-500))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            exploring, deciding, or lost
          </span>{" "}
          — before they leave.
        </h1>

        <p
          className="text-lg max-w-2xl mx-auto mb-10"
          style={{ color: "var(--text-muted)" }}
        >
          Cognition UI drops a single script into your site, scores every session on
          velocity, hesitation and backtracking, and classifies it into an archetype —
          Explorer, Goal-seeker, Confused, or Comparison-shopper — automatically.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/demo/overview"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-lg transition-all duration-150"
            style={{
              background:
                "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))",
              boxShadow: "0 4px 20px rgba(174,32,18,0.4)",
            }}
          >
            <PlayCircle size={18} />
            See live demo
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg transition-all duration-150"
            style={{
              color: "var(--text-primary)",
              border: "1px solid var(--border-muted)",
            }}
          >
            Get started free
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

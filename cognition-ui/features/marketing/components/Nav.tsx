import Link from "next/link";
import { Activity } from "lucide-react";

export function Nav() {
  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--maroon-600), var(--orange-500))",
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
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard/demo/overview"
            className="hidden sm:inline-block text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Live demo
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all duration-150"
            style={{
              background:
                "linear-gradient(135deg, var(--maroon-600), var(--maroon-500))",
              boxShadow: "0 2px 12px rgba(174,32,18,0.35)",
            }}
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

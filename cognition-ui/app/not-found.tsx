import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="text-center space-y-5 px-4">
        <p
          className="text-8xl font-bold tracking-tight"
          style={{ color: "var(--border-muted)" }}
        >
          404
        </p>
        <div className="space-y-1">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Page not found
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            The page you&apos;re looking for doesn&apos;t exist or was moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "var(--maroon-600)" }}
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

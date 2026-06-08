"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  trackingId: string;
}

export function EmbedCode({ trackingId }: Props) {
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="https://cognition-ui.vercel.app/sdk.js" data-id="${trackingId}" defer></script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently fail
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: "var(--text-secondary)" }}
        >
          Embed snippet
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Paste this into the{" "}
          <code
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{
              color: "var(--orange-300)",
              background: "rgba(245,158,11,0.08)",
            }}
          >
            &lt;head&gt;
          </code>{" "}
          or before the closing{" "}
          <code
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{
              color: "var(--orange-300)",
              background: "rgba(245,158,11,0.08)",
            }}
          >
            &lt;/body&gt;
          </code>{" "}
          tag of every page you want to track.
        </p>
      </div>

      <div className="relative group">
        <pre
          className="rounded-xl px-4 py-3.5 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed"
          style={{
            background: "var(--bg-base)",
            border: "1px solid var(--border-subtle)",
            color: "var(--orange-300)",
          }}
        >
          {snippet}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-muted)",
            color: "var(--text-muted)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--maroon-600)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-muted)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
        >
          {copied ? (
            <>
              <Check size={12} style={{ color: "var(--color-success)" }} />
              <span style={{ color: "var(--color-success)" }}>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium" style={{ color: "var(--text-dim)" }}>
          Tracking ID:
        </span>
        <code
          className="font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {trackingId}
        </code>
      </div>
    </div>
  );
}

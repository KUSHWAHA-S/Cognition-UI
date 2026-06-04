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
        <p className="text-sm text-gray-300 font-medium mb-1">Embed snippet</p>
        <p className="text-xs text-gray-500">
          Paste this into the{" "}
          <code className="text-gray-400 bg-gray-800 px-1 py-0.5 rounded text-xs">
            &lt;head&gt;
          </code>{" "}
          or before the closing{" "}
          <code className="text-gray-400 bg-gray-800 px-1 py-0.5 rounded text-xs">
            &lt;/body&gt;
          </code>{" "}
          tag of every page you want to track.
        </p>
      </div>

      <div className="relative group">
        <pre className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3.5 text-xs text-indigo-300 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
          {snippet}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-xs"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="font-medium text-gray-500">Tracking ID:</span>
        <code className="font-mono text-gray-500">{trackingId}</code>
      </div>
    </div>
  );
}

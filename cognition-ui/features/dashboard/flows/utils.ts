// Shorten a full URL to a readable path label for Sankey nodes.
// "https://mysite.com/products/shoes/red-sneakers" → "/products/shoes/…"
export function toLabel(url: string, maxLength = 28): string {
  try {
    const path = new URL(url).pathname || "/";
    if (path.length <= maxLength) return path;
    const parts = path.split("/").filter(Boolean);
    let label = "";
    for (const part of parts) {
      const next = label + "/" + part;
      if (next.length > maxLength - 1) return label + "/…";
      label = next;
    }
    return label || "/";
  } catch {
    // Not a valid URL — just truncate the raw string
    return url.length > maxLength ? url.slice(0, maxLength - 1) + "…" : url;
  }
}

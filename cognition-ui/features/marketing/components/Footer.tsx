export function Footer() {
  return (
    <footer
      className="px-6 py-8"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div
        className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        style={{ color: "var(--text-dim)" }}
      >
        <span>Cognition UI — behavioral analytics for teams who ship fast.</span>
        <a
          href="https://github.com/KUSHWAHA-S/Cognition-UI"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          View on GitHub
        </a>
      </div>
    </footer>
  );
}

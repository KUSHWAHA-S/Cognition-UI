const STEPS = [
  {
    n: "01",
    title: "Drop in one script",
    body: "Add the sdk.js snippet to your site. It tracks clicks, hovers, scroll depth, backtracking, dead clicks and rage clicks per session.",
  },
  {
    n: "02",
    title: "Events stream in",
    body: "Every event posts to /api/events and lands in your project, scoped by a public tracking ID — no PII, no cookies to manage.",
  },
  {
    n: "03",
    title: "Sessions get classified",
    body: "A cron job scores velocity, hesitation, backtrack and exploration every 30 minutes and assigns an archetype to each session.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ color: "var(--text-primary)" }}
        >
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.n}>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--orange-500)" }}
              >
                {step.n}
              </span>
              <h3
                className="text-lg font-semibold mt-2 mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

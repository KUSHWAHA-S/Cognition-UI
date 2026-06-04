import { ARCHETYPE_CONFIG } from "@/features/dashboard/constants";
import type { Archetype } from "@/features/sessions/types";

interface Props {
  archetype: Archetype;
  size?: "sm" | "md";
}

export function ArchetypeBadge({ archetype, size = "md" }: Props) {
  const cfg = ARCHETYPE_CONFIG[archetype];
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
      style={{
        background: cfg.color + "22",
        color: cfg.color,
        border: `1px solid ${cfg.color}44`,
      }}
    >
      {cfg.label}
    </span>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createAnonClient } from "@/lib/supabase/client";
import { LayoutDashboard, GitFork, List, Settings, LogOut, Activity } from "lucide-react";

const NAV = [
  { label: "Overview",   href: "overview",  Icon: LayoutDashboard },
  { label: "Click Flow", href: "flows",     Icon: GitFork },
  { label: "Sessions",   href: "sessions",  Icon: List },
  { label: "Settings",   href: "settings",  Icon: Settings },
];

interface Props {
  trackingId: string;
  projectName: string;
  isDemo?: boolean;
}

export function Sidebar({ trackingId, projectName, isDemo = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createAnonClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-screen"
      style={{
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, var(--maroon-600), var(--orange-500))" }}
          >
            <Activity size={14} color="#fff" />
          </div>
          <span
            className="font-semibold text-sm tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            Cognition UI
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 pl-0.5">
          <p
            className="text-xs truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {projectName}
          </p>
          {isDemo && (
            <span
              className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{
                color: "var(--orange-600)",
                background: "rgba(224,94,28,0.12)",
                border: "1px solid rgba(224,94,28,0.3)",
              }}
            >
              Demo
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href, Icon }) => {
          const fullHref = `/dashboard/${trackingId}/${href}`;
          const active = pathname === fullHref;
          return (
            <Link
              key={href}
              href={fullHref}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
              style={
                active
                  ? {
                      background: "linear-gradient(90deg, var(--maroon-600), var(--maroon-500))",
                      color: "#fff",
                      boxShadow: "0 1px 8px rgba(174,32,18,0.35)",
                    }
                  : { color: "var(--text-muted)" }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Divider + sign out */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        {isDemo ? (
          <Link
            href="/"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-dim)";
            }}
          >
            <LogOut size={15} />
            Exit demo
          </Link>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-dim)";
            }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}

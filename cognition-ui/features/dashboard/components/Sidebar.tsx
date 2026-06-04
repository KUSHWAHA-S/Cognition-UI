"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createAnonClient } from "@/lib/supabase/client";
import { LayoutDashboard, GitFork, List, Settings, LogOut } from "lucide-react";

const NAV = [
  { label: "Overview",   href: "overview",  Icon: LayoutDashboard },
  { label: "Click Flow", href: "flows",     Icon: GitFork },
  { label: "Sessions",   href: "sessions",  Icon: List },
  { label: "Settings",   href: "settings",  Icon: Settings },
];

interface Props {
  trackingId: string;
  projectName: string;
}

export function Sidebar({ trackingId, projectName }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createAnonClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-white font-semibold text-sm tracking-wide">
          Cognition UI
        </span>
        <p className="text-gray-500 text-xs mt-0.5 truncate">{projectName}</p>
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
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

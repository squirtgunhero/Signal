import type { Route } from "next";
import Link from "next/link";
import { BarChart3, FileCheck2, FileText, ScanSearch, Settings, Target, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/server/actions/auth-actions";
import type { WorkspaceSnapshot } from "@/lib/data/workspace";

const navItems = [
  { href: "/dashboard" as Route, label: "Dashboard", icon: BarChart3 },
  { href: "/prompts" as Route, label: "Prompts", icon: FileText },
  { href: "/runs" as Route, label: "Runs", icon: ScanSearch },
  { href: "/competitors" as Route, label: "Competitors", icon: Trophy },
  { href: "/sources" as Route, label: "Sources", icon: Target },
  { href: "/actions" as Route, label: "Actions", icon: FileCheck2 },
  { href: "/reports" as Route, label: "Reports", icon: FileText },
  { href: "/settings" as Route, label: "Settings", icon: Settings },
];

type AppShellProps = {
  snapshot: Extract<WorkspaceSnapshot, { status: "ready" | "needs-organization" | "schema-missing" }>;
  children: React.ReactNode;
};

export function AppShell({ snapshot, children }: AppShellProps) {
  const organizationName = snapshot.status === "ready" ? snapshot.organization.name : "New workspace";

  return (
    <div className="page-frame">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="brand-dark-panel sticky top-5 hidden h-[calc(100vh-2.5rem)] flex-col p-5 lg:flex">
          <div className="space-y-3 border-b border-white/10 pb-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#b5b0a3]">A Jersey Proper Product</p>
            <Link href="/dashboard" className="text-xl font-semibold uppercase tracking-[0.14em] text-[#f7f1e4]">
              Signal
            </Link>
            <p className="text-sm text-[#b5b0a3]">{organizationName}</p>
          </div>
          <nav className="mt-5 flex flex-1 flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm uppercase tracking-[0.1em] text-[#d3cdbc] transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full border-white/20 bg-transparent text-[#f7f1e4] hover:bg-white/8 hover:text-white">
              Sign out
            </Button>
          </form>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, NotebookPen, BarChart3, LogOut, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/CommandPalette";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { mode: "login", redirect: location.href } });
    }
  },
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

function AuthenticatedLayout() {
  const { user, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 aurora-bg opacity-40" />
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />

      <aside className="relative z-10 flex w-[240px] shrink-0 flex-col border-r border-border/60 bg-sidebar/60 backdrop-blur-xl">
        <div className="px-5 py-5">
          <Link to="/dashboard">
            <Logo />
          </Link>
        </div>

        <button
          onClick={() => setPaletteOpen(true)}
          className="mx-3 mb-4 flex items-center gap-2 rounded-lg border border-border bg-white/5 px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-border-strong hover:bg-white/10"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search…</span>
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/80">
            ⌘K
          </kbd>
        </button>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((item) => {
            const active = path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-white/10 ring-1 ring-border-strong"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <item.icon className="relative h-4 w-4" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-xs font-medium text-primary-glow">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{user?.email}</div>
              <div className="text-[10px] text-muted-foreground">Workspace</div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 min-w-0 flex-1">
        <Outlet />
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <Link
        to="/notes"
        search={{ new: 1 }}
        className="fixed bottom-6 right-6 z-20 grid h-12 w-12 place-items-center rounded-full text-white shadow-[var(--shadow-glow)] transition-all hover:scale-105 active:scale-95 md:hidden"
        style={{ background: "var(--gradient-primary)" }}
        aria-label="New note"
      >
        <Plus className="h-5 w-5" />
      </Link>
    </div>
  );
}

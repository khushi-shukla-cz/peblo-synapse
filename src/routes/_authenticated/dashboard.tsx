import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Sparkles, Activity, TrendingUp, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { listNotes, getAnalytics } from "@/lib/notes.functions";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Peblo Synapse" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: notes = [] } = useQuery({ queryKey: ["notes"], queryFn: () => listNotes() });
  const { data: analytics } = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalytics() });

  const days = Array.from({ length: 14 }, (_, i) => startOfDay(subDays(new Date(), 13 - i)));
  const trend = days.map((d) => {
    const day = format(d, "MMM d");
    const edits = (analytics?.acts ?? []).filter((a) => {
      const t = new Date(a.created_at);
      return t >= d && t < new Date(d.getTime() + 86400000);
    }).length;
    const ai = (analytics?.ai ?? []).filter((a) => {
      const t = new Date(a.created_at);
      return t >= d && t < new Date(d.getTime() + 86400000);
    }).length;
    return { day, edits, ai };
  });

  const recent = notes.slice(0, 6);
  const aiCount = analytics?.ai.length ?? 0;
  const score = Math.min(100, Math.round((notes.length * 6 + aiCount * 4) / 1.5));

  return (
    <div className="mx-auto max-w-7xl px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome back, <span className="text-aurora">{user?.email?.split("@")[0]}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's moving in your Synapse.</p>
        </div>
        <Link
          to="/notes"
          search={{ new: 1 }}
          className="rounded-xl px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02]"
          style={{ background: "var(--gradient-primary)" }}
        >
          New note
        </Link>
      </motion.div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric icon={FileText} label="Total notes" value={notes.length} sub="all-time" />
        <Metric icon={Activity} label="Edits (14d)" value={trend.reduce((a, b) => a + b.edits, 0)} sub="actions logged" />
        <Metric icon={Sparkles} label="AI runs" value={aiCount} sub="generations" />
        <Metric icon={TrendingUp} label="Productivity" value={score} sub="composite score" suffix="/100" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Activity</p>
              <h2 className="mt-1 font-medium">Edits & AI runs · last 14 days</h2>
            </div>
          </div>
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.66 0.21 282)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.66 0.21 282)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 220)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="oklch(0.72 0.02 270)" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.02 270 / 0.9)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="edits" stroke="oklch(0.66 0.21 282)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="ai" stroke="oklch(0.78 0.16 220)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Recent notes</p>
          <ul className="mt-4 space-y-1">
            {recent.map((n) => (
              <li key={n.id}>
                <Link
                  to="/notes"
                  search={{ id: n.id }}
                  className="group flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{n.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{n.category}</div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="px-3 py-8 text-center text-xs text-muted-foreground">No notes yet</li>
            )}
          </ul>
        </GlassPanel>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
  suffix,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  sub: string;
  suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassPanel className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </GlassPanel>
    </motion.div>
  );
}

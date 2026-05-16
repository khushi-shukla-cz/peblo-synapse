import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { getAnalytics, listNotes } from "@/lib/notes.functions";
import { GlassPanel } from "@/components/ui/glass-panel";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Peblo Synapse" }] }),
  component: Analytics,
});

const COLORS = ["oklch(0.66 0.21 282)", "oklch(0.78 0.16 220)", "oklch(0.62 0.20 268)", "oklch(0.74 0.18 195)", "oklch(0.66 0.22 296)"];

function Analytics() {
  const { data: a } = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalytics() });
  const { data: notes = [] } = useQuery({ queryKey: ["notes"], queryFn: () => listNotes() });

  const days = Array.from({ length: 14 }, (_, i) => startOfDay(subDays(new Date(), 13 - i)));
  const trend = days.map((d) => {
    const day = format(d, "MMM d");
    const next = new Date(d.getTime() + 86400000);
    const edits = (a?.acts ?? []).filter((x) => {
      const t = new Date(x.created_at);
      return t >= d && t < next;
    }).length;
    return { day, edits };
  });

  const tagCount: Record<string, number> = {};
  notes.forEach((n) => n.tags.forEach((t) => (tagCount[t] = (tagCount[t] ?? 0) + 1)));
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const aiByType: Record<string, number> = {};
  (a?.ai ?? []).forEach((x) => (aiByType[x.type] = (aiByType[x.type] ?? 0) + 1));
  const aiData = Object.entries(aiByType).map(([name, value]) => ({ name, value }));

  const score = Math.min(100, Math.round((notes.length * 6 + (a?.ai.length ?? 0) * 4) / 1.5));

  return (
    <div className="mx-auto max-w-7xl px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">How your Synapse is moving.</p>
      </motion.div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="Notes" value={notes.length} />
        <Stat label="Weekly edits" value={trend.slice(-7).reduce((a, b) => a + b.edits, 0)} />
        <Stat label="AI generations" value={a?.ai.length ?? 0} />
        <Stat label="Productivity" value={`${score}/100`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Activity trend</p>
          <h2 className="mt-1 font-medium">Edits · last 14 days</h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="day" stroke="oklch(0.72 0.02 270)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.02 270)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.18 0.02 270 / 0.9)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 10, fontSize: 12 }}
                />
                <Bar dataKey="edits" fill="oklch(0.66 0.21 282)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">AI usage</p>
          <h2 className="mt-1 font-medium">By generation type</h2>
          <div className="mt-6 h-64">
            {aiData.length === 0 ? (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">No AI runs yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={aiData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                    {aiData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "oklch(0.18 0.02 270 / 0.9)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 10, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="mt-6 p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Top tags</p>
        <h2 className="mt-1 font-medium">Most-used taxonomy</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {topTags.map((t, i) => (
            <span
              key={t.name}
              className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs"
              style={{ color: COLORS[i % COLORS.length] }}
            >
              #{t.name} <span className="text-muted-foreground">· {t.value}</span>
            </span>
          ))}
          {topTags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet.</span>}
        </div>
      </GlassPanel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <GlassPanel className="p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </GlassPanel>
  );
}

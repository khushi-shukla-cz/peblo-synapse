import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Share2,
  BarChart3,
  Command,
  Lock,
  GitBranch,
  Check,
  Star,
} from "lucide-react";
import { AuroraBackdrop } from "@/components/visual/AuroraBackdrop";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Peblo Synapse — AI Collaborative Notes Workspace" },
      {
        name: "description",
        content:
          "The AI-native, cinematic notes workspace for high-agency teams. Capture, summarize, share — instantly.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Sparkles,
    title: "AI that thinks with you",
    body: "Summaries, action items, smart titles, and insight analysis — streamed in line with your thinking.",
  },
  {
    icon: Zap,
    title: "Fluid, autosaved editing",
    body: "Markdown, slash commands, optimistic updates, and version history that never gets in your way.",
  },
  {
    icon: Share2,
    title: "Zero-config sharing",
    body: "One toggle to publish a note as a beautiful, read-only public page. No accounts required.",
  },
  {
    icon: BarChart3,
    title: "Workspace analytics",
    body: "Productivity score, top tags, AI usage and activity trends — at a glance, gorgeously rendered.",
  },
  {
    icon: Command,
    title: "Keyboard-first",
    body: "A ⌘K palette to move at the speed of thought. Every action, one keystroke away.",
  },
  {
    icon: GitBranch,
    title: "Versioning, built-in",
    body: "Every change is captured. Restore a paragraph, a page, or a whole train of thought.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "Row-level security at the database. Your notes are your notes — until you decide otherwise.",
  },
  {
    icon: Star,
    title: "Cinematic, calm UI",
    body: "Liquid glass, aurora gradients, and motion that respects you. Built like a product, not a tool.",
  },
];

const stats = [
  { value: "180ms", label: "median AI latency" },
  { value: "1.5s", label: "autosave debounce" },
  { value: "99.99%", label: "Cloud uptime" },
  { value: "0", label: "lock-in. ever." },
];

const logos = ["Linear", "Notion", "Vercel", "Framer", "Arc", "Superhuman"];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AuroraBackdrop dense />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-1.5">
          <a href="#features" className="hidden px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground md:inline-block">
            Features
          </a>
          <a href="#pricing" className="hidden px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground md:inline-block">
            Pricing
          </a>
          <ThemeToggle className="mr-1" />
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/login" search={{ mode: "signup" }}>
            <Button variant="hero" size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-14 pb-32">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            New · Streaming insights with Gemini 3 Flash
          </span>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            <span className="text-foreground">A second brain that </span>
            <span className="text-aurora">moves at your speed</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Peblo Synapse is the AI-native collaborative workspace for product teams who treat
            notes as infrastructure. Capture, distill, share — without friction.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" search={{ mode: "signup" }}>
              <Button variant="hero" size="lg" className="rounded-xl px-6">
                Start writing free <ArrowRight className="ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="glass" size="lg" className="rounded-xl px-6">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Free forever for individuals · No credit card · Cancel any time
          </p>
        </motion.div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <GlassPanel strong className="overflow-hidden p-2">
            <div className="rounded-xl border border-border bg-surface/60 p-6">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/10" />
                <span className="ml-3 text-xs text-muted-foreground">
                  synapse.app — Sprint Planning, Week 24
                </span>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Engineering
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    Sprint Planning — Week 24
                  </h3>
                  <div className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/85">
                    <p>
                      Ship onboarding v2. Cut p95 latency by 30%. Realtime presence under load is
                      our top risk this cycle.
                    </p>
                    <p className="text-muted-foreground">
                      Owners: <span className="text-foreground">@khushi</span> on editor,{" "}
                      <span className="text-foreground">@aman</span> on infra.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <GlassPanel className="p-4">
                    <div className="text-[10px] uppercase tracking-widest text-primary-glow">
                      AI Summary
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                      Two-week sprint focused on onboarding and latency. Realtime presence is the
                      load-bearing risk; clear owners assigned.
                    </p>
                  </GlassPanel>
                  <GlassPanel className="p-4">
                    <div className="text-[10px] uppercase tracking-widest text-cyan">
                      Action items
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs text-foreground/80">
                      <li>☐ Ship onboarding v2</li>
                      <li>☐ Cut p95 latency 30%</li>
                      <li>☐ Load-test presence</li>
                    </ul>
                  </GlassPanel>
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Logo strip */}
        <div className="mt-20">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            Built to the standard of
          </p>
          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {logos.map((l) => (
              <span key={l} className="text-sm font-medium tracking-tight text-foreground/70">
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border-strong bg-border-strong md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-background/80 px-6 py-8 text-center backdrop-blur">
              <div className="text-3xl font-semibold tracking-tight text-aurora md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <section id="features" className="mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Every detail, <span className="text-aurora">considered</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              The small things you'd build yourself — already there, polished, and out of your way.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassPanel className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-glow)]">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary-glow transition-transform duration-300 group-hover:scale-110">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 font-medium tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="mt-28">
          <GlassPanel strong className="mx-auto max-w-4xl p-10 md:p-14">
            <div className="flex items-center gap-1 text-primary-glow">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-5 text-balance text-2xl font-medium leading-snug tracking-tight md:text-3xl">
              "Synapse replaced three tools on day one. The AI summaries are
              <span className="text-aurora"> uncannily good</span> — it's like pair-thinking with a
              senior PM."
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                MR
              </div>
              <div>
                <div className="text-sm font-medium">Maya Rao</div>
                <div className="text-xs text-muted-foreground">Head of Product, Northwind</div>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* Pricing teaser */}
        <section id="pricing" className="mt-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Start free. <span className="text-aurora">Scale when ready.</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Generous free tier. Pro unlocks unlimited AI, version history depth, and team sharing.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
            {[
              {
                name: "Free",
                price: "$0",
                tag: "For individuals",
                perks: ["Unlimited notes", "50 AI actions / month", "Public sharing", "Version history (7d)"],
                cta: "Get started",
                variant: "glass" as const,
              },
              {
                name: "Pro",
                price: "$12",
                tag: "Per user / month",
                perks: ["Unlimited AI", "Realtime collaboration", "Workspace analytics", "Version history (∞)"],
                cta: "Start free trial",
                variant: "hero" as const,
                highlight: true,
              },
            ].map((p) => (
              <GlassPanel
                key={p.name}
                strong={p.highlight}
                className={`p-7 ${p.highlight ? "shadow-[var(--shadow-glow)]" : ""}`}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                  <div className="text-right">
                    <div className="text-3xl font-semibold tracking-tight">{p.price}</div>
                    <div className="text-xs text-muted-foreground">{p.tag}</div>
                  </div>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm text-foreground/85">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary-glow" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link to="/login" search={{ mode: "signup" }}>
                  <Button variant={p.variant} className="mt-7 w-full rounded-xl">
                    {p.cta}
                  </Button>
                </Link>
              </GlassPanel>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-28">
          <GlassPanel strong className="relative overflow-hidden p-12 text-center md:p-16">
            <div className="aurora-bg pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative">
              <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Your next thought, <span className="text-aurora">organized for you</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Join writers, founders, and engineers using Synapse to think clearer, ship faster.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/login" search={{ mode: "signup" }}>
                  <Button variant="hero" size="lg" className="rounded-xl px-7">
                    Start free <ArrowRight className="ml-1" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="glass" size="lg" className="rounded-xl px-7">
                    I already have an account
                  </Button>
                </Link>
              </div>
            </div>
          </GlassPanel>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted-foreground">
          <Logo size={22} />
          <div className="flex items-center gap-5">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
          </div>
          <span>© {new Date().getFullYear()} Peblo Synapse. Crafted with intention.</span>
        </div>
      </footer>
    </div>
  );
}

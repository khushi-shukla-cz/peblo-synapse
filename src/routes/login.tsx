import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AuroraBackdrop } from "@/components/visual/AuroraBackdrop";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/ui/glass-panel";

const schema = z.object({
  email: z.string().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s.mode === "signup" ? "signup" : "login",
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Peblo Synapse" },
      { name: "description", content: "Sign in to your Peblo Synapse workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(search.mode);
  const [busy, setBusy] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && session) navigate({ to: search.redirect || "/dashboard" });
  }, [loading, session, navigate, search.redirect]);

  const onSubmit = async (values: FormVals) => {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created", {
          description: "Check your email to confirm, then sign in.",
        });
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: search.redirect || "/dashboard" });
      }
    } catch (e) {
      toast.error(mode === "signup" ? "Sign up failed" : "Sign in failed", {
        description: (e as Error).message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4">
      <AuroraBackdrop dense />
      <Link
        to="/"
        className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <Logo size={32} />
        </div>

        <GlassPanel strong className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <h1 className="text-2xl font-semibold tracking-tight">
                {mode === "signup" ? "Create your workspace" : "Welcome back"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Spin up your Synapse in seconds."
                  : "Sign in to continue to your Synapse."}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@studio.com"
                  className="h-11 pl-9 bg-white/5 border-border-strong focus-visible:ring-ring"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  className="h-11 pl-9 bg-white/5 border-border-strong"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" variant="hero" className="h-11 w-full rounded-xl" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Synapse?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}

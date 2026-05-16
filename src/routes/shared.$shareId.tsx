import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { getSharedNote } from "@/lib/notes.functions";
import { Logo } from "@/components/brand/Logo";
import { AuroraBackdrop } from "@/components/visual/AuroraBackdrop";

export const Route = createFileRoute("/shared/$shareId")({
  head: ({ params }) => ({
    meta: [
      { title: `Shared note — Peblo Synapse` },
      { name: "description", content: `A note shared via Peblo Synapse (${params.shareId}).` },
    ],
  }),
  component: SharedPage,
});

function SharedPage() {
  const { shareId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["shared", shareId],
    queryFn: () => getSharedNote({ data: { shareId } }),
  });

  return (
    <div className="relative min-h-screen bg-background">
      <AuroraBackdrop />
      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link to="/"><Logo /></Link>
        <Link to="/login" search={{ mode: "signup" }} className="text-xs text-muted-foreground hover:text-foreground">
          Make your own →
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-6">
        {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && !data && (
          <div className="glass-strong rounded-2xl p-10 text-center">
            <h1 className="text-xl font-semibold">This note isn't available.</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The link may be private or expired.
            </p>
          </div>
        )}
        {data && (
          <article>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{data.category}</p>
            <h1 className="mt-2 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              {data.title}
            </h1>
            <p className="mt-3 text-xs text-muted-foreground">
              Updated {format(new Date(data.updated_at), "MMM d, yyyy")}
            </p>
            <div className="prose prose-invert mt-8 max-w-none prose-headings:tracking-tight prose-p:leading-relaxed prose-pre:bg-white/5 prose-code:text-cyan">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
            </div>
            <div className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">
              Shared with <span className="text-aurora">Peblo Synapse</span>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

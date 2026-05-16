import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import { toast } from "sonner";
import {
  Sparkles, ListChecks, Wand2, Lightbulb, Archive, Copy, Trash2,
  Globe, Link as LinkIcon, Download, History, Loader2, Plus, Search,
} from "lucide-react";
import {
  listNotes, createNote, updateNote, deleteNote, duplicateNote, listVersions, restoreVersion,
  type NoteRow,
} from "@/lib/notes.functions";
import { runAi } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/notes")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : undefined,
    new: s.new === 1 || s.new === "1" ? 1 : undefined,
  }),
  head: () => ({ meta: [{ title: "Notes — Peblo Synapse" }] }),
  component: NotesPage,
});

type AiKind = "summary" | "title" | "actions" | "insights";

function NotesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: notes = [] } = useQuery({ queryKey: ["notes"], queryFn: () => listNotes() });
  const [filter, setFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const visible = useMemo(() => {
    const q = filter.toLowerCase();
    return notes.filter(
      (n) =>
        n.archived === showArchived &&
        (!q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))),
    );
  }, [notes, filter, showArchived]);

  const selected = useMemo(
    () => notes.find((n) => n.id === search.id) ?? visible[0],
    [notes, visible, search.id],
  );

  const create = useMutation({
    mutationFn: () => createNote({ data: {} }),
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      navigate({ to: "/notes", search: { id: n.id } });
    },
  });

  useEffect(() => {
    if (search.new) {
      create.mutate();
      navigate({ to: "/notes", search: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.new]);

  return (
    <div className="grid h-screen grid-cols-[300px_1fr_360px]">
      <aside className="flex min-h-0 flex-col border-r border-border/60 bg-sidebar/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <h2 className="text-sm font-medium tracking-tight">Notes</h2>
          <span className="text-xs text-muted-foreground">{visible.length}</span>
          <div className="ml-auto">
            <Button
              size="icon"
              variant="glass"
              className="h-7 w-7 rounded-md"
              onClick={() => create.mutate()}
              disabled={create.isPending}
            >
              {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="h-8 border-border bg-white/5 pl-8 text-xs"
            />
          </div>
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            {showArchived ? "← Active notes" : "View archived →"}
          </button>
        </div>
        <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4 scrollbar-thin">
          {visible.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => navigate({ to: "/notes", search: { id: n.id } })}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left transition-all",
                  selected?.id === n.id
                    ? "bg-white/10 ring-1 ring-border-strong"
                    : "hover:bg-white/5",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 truncate text-sm font-medium">{n.title || "Untitled"}</div>
                  {n.is_public && <Globe className="h-3 w-3 text-cyan" />}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {n.category} · {formatDistanceToNow(new Date(n.updated_at), { addSuffix: true })}
                </div>
              </button>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="px-3 py-12 text-center text-xs text-muted-foreground">
              {showArchived ? "Nothing archived." : "No notes — create one to begin."}
            </li>
          )}
        </ul>
      </aside>

      {selected ? <Editor key={selected.id} note={selected} /> : <EmptyEditor />}
    </div>
  );
}

function EmptyEditor() {
  return (
    <div className="col-span-2 grid place-items-center text-sm text-muted-foreground">
      Select or create a note.
    </div>
  );
}

function Editor({ note }: { note: NoteRow }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [preview, setPreview] = useState(false);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("saved");
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI panel state
  const [ai, setAi] = useState<Record<AiKind, { text: string; loading: boolean }>>({
    summary: { text: "", loading: false },
    title: { text: "", loading: false },
    actions: { text: "", loading: false },
    insights: { text: "", loading: false },
  });
  const [showHistory, setShowHistory] = useState(false);

  type UpdatePatch = {
    id: string;
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
    archived?: boolean;
    is_public?: boolean;
    snapshot?: boolean;
  };
  const update = useMutation({
    mutationFn: (patch: UpdatePatch) =>
      updateNote({ data: patch as never }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
  const del = useMutation({
    mutationFn: () => deleteNote({ data: { id: note.id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
  const dup = useMutation({
    mutationFn: () => duplicateNote({ data: { id: note.id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note duplicated");
    },
  });

  // autosave
  useEffect(() => {
    if (!dirty.current) return;
    setSavingState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await update.mutateAsync({ id: note.id, title, content });
      setSavingState("saved");
      dirty.current = false;
    }, 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  const onChange = (fn: () => void) => {
    dirty.current = true;
    setSavingState("saving");
    fn();
  };

  const runKind = async (kind: AiKind) => {
    setAi((s) => ({ ...s, [kind]: { text: "", loading: true } }));
    try {
      const res = await runAi({ data: { kind, noteId: note.id, title, content } });
      setAi((s) => ({ ...s, [kind]: { text: res.output, loading: false } }));
      if (kind === "title" && res.output) {
        onChange(() => setTitle(res.output.replace(/^["']|["']$/g, "")));
      }
    } catch (e) {
      setAi((s) => ({ ...s, [kind]: { text: "", loading: false } }));
      toast.error("AI request failed", { description: (e as Error).message });
    }
  };

  const togglePublic = async () => {
    await update.mutateAsync({ id: note.id, is_public: !note.is_public });
    toast.success(note.is_public ? "Sharing disabled" : "Note is now public");
  };

  const copyShareLink = async () => {
    if (!note.share_id) return;
    const url = `${window.location.origin}/shared/${note.share_id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  };

  const exportMd = () => {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "note"}.md`;
    a.click();
  };
  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(20); doc.text(title || "Untitled", 48, 64);
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(content || "", 500);
    doc.text(lines, 48, 96);
    doc.save(`${title || "note"}.pdf`);
  };

  return (
    <>
      <section className="flex min-h-0 flex-col">
        <header className="flex items-center gap-2 border-b border-border/60 px-6 py-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {note.category}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {savingState === "saving" ? "Saving…" : savingState === "saved" ? "Saved" : ""}
          </span>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setPreview((p) => !p)} title="Toggle preview">
              <Wand2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowHistory(true)} title="Version history">
              <History className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => dup.mutate()} title="Duplicate">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={exportMd} title="Export Markdown">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={exportPdf} title="Export PDF">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={cn("h-8 w-8", note.is_public && "text-cyan")}
              onClick={togglePublic}
              title="Toggle public"
            >
              <Globe className="h-3.5 w-3.5" />
            </Button>
            {note.is_public && (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyShareLink} title="Copy share link">
                <LinkIcon className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => update.mutate({ id: note.id, archived: !note.archived })}
              title={note.archived ? "Restore" : "Archive"}
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => {
                if (confirm("Delete this note permanently?")) del.mutate();
              }}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-12 py-10 scrollbar-thin">
          <div className="mx-auto max-w-3xl">
            <input
              value={title}
              onChange={(e) => onChange(() => setTitle(e.target.value))}
              placeholder="Untitled"
              className="w-full bg-transparent text-4xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/50"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })} · v{note.version}
            </div>

            {preview ? (
              <article className="prose prose-invert prose-sm mt-8 max-w-none prose-headings:tracking-tight prose-p:leading-relaxed prose-pre:bg-white/5 prose-code:text-cyan">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </article>
            ) : (
              <textarea
                value={content}
                onChange={(e) => onChange(() => setContent(e.target.value))}
                placeholder="Start writing — markdown supported. Try /summary in the AI panel →"
                className="mt-8 min-h-[60vh] w-full resize-none bg-transparent font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50"
              />
            )}
          </div>
        </div>
      </section>

      <aside className="flex min-h-0 flex-col border-l border-border/60 bg-sidebar/40 backdrop-blur-xl">
        <div className="border-b border-border/60 px-5 py-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Assistant</p>
          <h3 className="mt-1 text-sm font-medium">Synthesize this note</h3>
        </div>
        <div className="space-y-3 overflow-y-auto p-4 scrollbar-thin">
          <AiButton kind="summary" icon={Sparkles} label="Summary" ai={ai.summary} run={runKind} />
          <AiButton kind="title" icon={Wand2} label="Smart title" ai={ai.title} run={runKind} />
          <AiButton kind="actions" icon={ListChecks} label="Action items" ai={ai.actions} run={runKind} />
          <AiButton kind="insights" icon={Lightbulb} label="Insight analysis" ai={ai.insights} run={runKind} />
        </div>
      </aside>

      <AnimatePresence>
        {showHistory && (
          <VersionDrawer noteId={note.id} onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function AiButton({
  kind, icon: Icon, label, ai, run,
}: {
  kind: AiKind;
  icon: typeof Sparkles;
  label: string;
  ai: { text: string; loading: boolean };
  run: (k: AiKind) => void;
}) {
  return (
    <div>
      <button
        onClick={() => run(kind)}
        disabled={ai.loading}
        className="group flex w-full items-center gap-3 rounded-lg border border-border bg-white/5 px-3 py-2.5 text-sm transition-all hover:border-border-strong hover:bg-white/10 disabled:opacity-60"
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-md text-primary-glow"
          style={{ background: "oklch(0.66 0.21 282 / 0.15)" }}
        >
          {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
        </span>
        <span className="flex-1 text-left text-sm">{label}</span>
        <span className="text-[10px] text-muted-foreground group-hover:text-foreground">Run</span>
      </button>
      <AnimatePresence>
        {ai.text && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <GlassPanel className="mt-2 p-3">
              <div className="prose prose-invert prose-xs max-w-none text-xs leading-relaxed prose-p:my-1 prose-ul:my-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{ai.text}</ReactMarkdown>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VersionDrawer({ noteId, onClose }: { noteId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["versions", noteId],
    queryFn: () => listVersions({ data: { noteId } }),
  });
  const restore = useMutation({
    mutationFn: (versionId: string) => restoreVersion({ data: { noteId, versionId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Version restored");
      onClose();
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong absolute right-0 top-0 h-full w-[420px] overflow-y-auto p-6"
      >
        <h3 className="text-sm font-medium">Version history</h3>
        <p className="text-xs text-muted-foreground">Restore any prior snapshot.</p>
        <ul className="mt-6 space-y-2">
          {data.map((v) => (
            <li key={v.id} className="rounded-lg border border-border bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">v{v.version}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-1 truncate text-sm">{v.title}</div>
              <Button
                size="sm"
                variant="glass"
                className="mt-2 h-7 text-xs"
                onClick={() => restore.mutate(v.id)}
              >
                Restore
              </Button>
            </li>
          ))}
          {data.length === 0 && (
            <li className="py-8 text-center text-xs text-muted-foreground">No snapshots yet.</li>
          )}
        </ul>
      </motion.div>
    </motion.div>
  );
}

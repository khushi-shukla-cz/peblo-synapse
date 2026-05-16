import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, LayoutDashboard, BarChart3, Plus, Hash } from "lucide-react";
import { listNotes } from "@/lib/notes.functions";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: () => listNotes(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const go = (fn: () => void) => {
    onOpenChange(false);
    setTimeout(fn, 50);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 grid place-items-start bg-background/60 px-4 pt-[12vh] backdrop-blur-md"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-xl overflow-hidden rounded-2xl"
          >
            <Command label="Command Palette" className="bg-transparent">
              <div className="border-b border-border px-4 py-3">
                <Command.Input
                  autoFocus
                  value={q}
                  onValueChange={setQ}
                  placeholder="Search notes, jump anywhere…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Command.List className="max-h-[55vh] overflow-y-auto p-2 scrollbar-thin">
                <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Nothing matches — try a different query.
                </Command.Empty>

                <Command.Group heading="Navigate" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                  <Item icon={LayoutDashboard} label="Dashboard" onSelect={() => go(() => navigate({ to: "/dashboard" }))} />
                  <Item icon={FileText} label="Notes workspace" onSelect={() => go(() => navigate({ to: "/notes" }))} />
                  <Item icon={BarChart3} label="Analytics" onSelect={() => go(() => navigate({ to: "/analytics" }))} />
                  <Item icon={Plus} label="New note" onSelect={() => go(() => navigate({ to: "/notes", search: { new: 1 } }))} />
                </Command.Group>

                {notes.length > 0 && (
                  <Command.Group heading="Notes" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest">
                    {notes.slice(0, 30).map((n) => (
                      <Command.Item
                        key={n.id}
                        value={`${n.title} ${n.content} ${n.tags.join(" ")} ${n.category}`}
                        onSelect={() => go(() => navigate({ to: "/notes", search: { id: n.id } }))}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-white/10"
                      >
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">{n.category}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Item({
  icon: Icon,
  label,
  onSelect,
}: {
  icon: typeof FileText;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-white/10"
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{label}</span>
    </Command.Item>
  );
}

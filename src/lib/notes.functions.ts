import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  archived: boolean;
  is_public: boolean;
  share_id: string | null;
  version: number;
  created_at: string;
  updated_at: string;
};

export const listNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as NoteRow[];
  });

export const createNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().max(200).optional(),
        content: z.string().max(200000).optional(),
        category: z.string().max(80).optional(),
        tags: z.array(z.string().max(40)).max(20).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("notes")
      .insert({
        user_id: context.userId,
        title: data.title ?? "Untitled",
        content: data.content ?? "",
        category: data.category ?? "General",
        tags: data.tags ?? [],
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_log").insert({
      user_id: context.userId,
      action: "note.created",
      meta: { note_id: row.id },
    });
    return row as NoteRow;
  });

export const updateNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().max(200).optional(),
        content: z.string().max(200000).optional(),
        category: z.string().max(80).optional(),
        tags: z.array(z.string().max(40)).max(20).optional(),
        archived: z.boolean().optional(),
        is_public: z.boolean().optional(),
        snapshot: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, snapshot, ...patch } = data;

    if (snapshot) {
      const { data: prev } = await context.supabase
        .from("notes")
        .select("title, content, version")
        .eq("id", id)
        .single();
      if (prev) {
        await context.supabase.from("note_versions").insert({
          note_id: id,
          user_id: context.userId,
          title: prev.title,
          content: prev.content,
          version: prev.version,
        });
      }
    }

    const { data: row, error } = await context.supabase
      .from("notes")
      .update({ ...patch, ...(snapshot ? { version: undefined } : {}) })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    if (snapshot) {
      await context.supabase
        .from("notes")
        .update({ version: (row.version ?? 1) + 1 })
        .eq("id", id);
    }

    return row as NoteRow;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const duplicateNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: src, error: srcErr } = await context.supabase
      .from("notes")
      .select("title, content, category, tags")
      .eq("id", data.id)
      .single();
    if (srcErr) throw new Error(srcErr.message);
    const { data: row, error } = await context.supabase
      .from("notes")
      .insert({
        user_id: context.userId,
        title: `${src!.title} (copy)`,
        content: src!.content,
        category: src!.category,
        tags: src!.tags,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as NoteRow;
  });

export const listVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ noteId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("note_versions")
      .select("*")
      .eq("note_id", data.noteId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const restoreVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ noteId: z.string().uuid(), versionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: v, error: ve } = await context.supabase
      .from("note_versions")
      .select("title, content")
      .eq("id", data.versionId)
      .single();
    if (ve) throw new Error(ve.message);
    const { data: row, error } = await context.supabase
      .from("notes")
      .update({ title: v!.title, content: v!.content })
      .eq("id", data.noteId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as NoteRow;
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: notes }, { data: ai }, { data: acts }] = await Promise.all([
      context.supabase.from("notes").select("id,tags,updated_at,created_at,archived"),
      context.supabase.from("ai_usage").select("type,created_at"),
      context.supabase.from("activity_log").select("action,created_at").limit(500),
    ]);
    return {
      notes: notes ?? [],
      ai: ai ?? [],
      acts: acts ?? [],
    };
  });

// Public share — no auth, uses admin client filtered by share_id + is_public
export const getSharedNote = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ shareId: z.string().min(4).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("notes")
      .select("title, content, category, tags, updated_at, is_public")
      .eq("share_id", data.shareId)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return row;
  });

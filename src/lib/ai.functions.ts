import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AiKind = "summary" | "title" | "actions" | "insights";

const PROMPTS: Record<AiKind, string> = {
  summary:
    "You write crisp executive summaries (3-5 sentences) of a markdown note. Plain prose, no headings, no bullets.",
  title:
    "You generate a single, sharp 3-7 word title for the note. Title-case. No quotes. No trailing punctuation. Output only the title.",
  actions:
    "Extract concrete action items as a markdown checklist. One item per line, starting with '- [ ] '. Each item is a verb-led, specific task. Max 8.",
  insights:
    "Surface 3-5 non-obvious insights from the note: tensions, second-order effects, risks, or strategic implications. Markdown bullet list, one sentence each.",
};

export const runAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        kind: z.enum(["summary", "title", "actions", "insights"]),
        noteId: z.string().uuid(),
        title: z.string().max(200),
        content: z.string().max(60000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) throw new Error("AI Gateway not configured (set LLM_API_KEY)");

    const gateway = process.env.LLM_GATEWAY_URL || "https://api.openai.com/v1/chat/completions";

    const res = await fetch(gateway, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: PROMPTS[data.kind as AiKind] },
          {
            role: "user",
            content: `Title: ${data.title}\n\n---\n\n${data.content || "(empty note)"}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };
    const output = json.choices?.[0]?.message?.content?.trim() ?? "";
    const tokens = json.usage?.total_tokens ?? 0;

    await context.supabase.from("ai_usage").insert({
      user_id: context.userId,
      note_id: data.noteId,
      type: data.kind,
      token_count: tokens,
    });

    return { output, tokens };
  });

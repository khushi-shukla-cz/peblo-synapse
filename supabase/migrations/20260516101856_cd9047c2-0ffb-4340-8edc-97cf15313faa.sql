create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;

  insert into public.notes (user_id, title, content, category, tags) values
  (new.id, 'Sprint Planning — Week 24', E'## Goals\n- Ship onboarding v2\n- Cut p95 latency by 30%\n\n## Risks\n- Realtime presence under load\n\n## Owners\n- @khushi → editor\n- @aman → infra', 'Engineering', array['sprint','planning']),
  (new.id, 'Product Strategy Memo', E'# North Star\n\nBecome the default workspace for high-agency product teams.\n\n## Bets\n1. AI-native editing\n2. Cinematic collaboration\n3. Zero-config sharing', 'Strategy', array['memo','vision']),
  (new.id, 'UX Review — Editor Surface', E'## Findings\n- Slash commands need keyboard hint chip\n- Sidebar density too high on 13"\n- Save indicator timing feels off by ~200ms\n\n## Recs\n- Add ⌘K affordance in empty state', 'Design', array['ux','review']),
  (new.id, 'AI Architecture Draft', E'## Layers\n- Inference gateway\n- Streaming response handler\n- Token accounting\n\n## Open\n- Cache key for summary refresh?\n- Per-note model selection', 'AI', array['architecture','draft']),
  (new.id, 'Weekly Research Summary', E'## Themes\n- Notion vs Linear collab gap\n- Glassmorphism re-emerging in pro tools\n\n## Quotes\n> "Speed is the feature." — internal interview', 'Research', array['weekly','research']);
  return new;
end; $$;
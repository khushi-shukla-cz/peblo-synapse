
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles self select" on public.profiles for select using (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- notes
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  content text not null default '',
  category text not null default 'General',
  tags text[] not null default '{}',
  archived boolean not null default false,
  is_public boolean not null default false,
  share_id text unique default encode(gen_random_bytes(9),'hex'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "notes owner select" on public.notes for select using (auth.uid() = user_id);
create policy "notes public select" on public.notes for select using (is_public = true);
create policy "notes owner insert" on public.notes for insert with check (auth.uid() = user_id);
create policy "notes owner update" on public.notes for update using (auth.uid() = user_id);
create policy "notes owner delete" on public.notes for delete using (auth.uid() = user_id);
create index notes_user_idx on public.notes(user_id, updated_at desc);
create index notes_share_idx on public.notes(share_id) where is_public = true;

-- versions
create table public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  version integer not null,
  created_at timestamptz not null default now()
);
alter table public.note_versions enable row level security;
create policy "versions owner select" on public.note_versions for select using (auth.uid() = user_id);
create policy "versions owner insert" on public.note_versions for insert with check (auth.uid() = user_id);
create index note_versions_note_idx on public.note_versions(note_id, created_at desc);

-- ai usage
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid references public.notes(id) on delete cascade,
  type text not null,
  token_count integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.ai_usage enable row level security;
create policy "ai owner select" on public.ai_usage for select using (auth.uid() = user_id);
create policy "ai owner insert" on public.ai_usage for insert with check (auth.uid() = user_id);

-- activity log
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.activity_log enable row level security;
create policy "activity owner select" on public.activity_log for select using (auth.uid() = user_id);
create policy "activity owner insert" on public.activity_log for insert with check (auth.uid() = user_id);
create index activity_user_idx on public.activity_log(user_id, created_at desc);

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger notes_updated_at before update on public.notes
for each row execute function public.tg_set_updated_at();
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.tg_set_updated_at();

-- new user: profile + seed notes
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));

  insert into public.notes (user_id, title, content, category, tags) values
  (new.id, 'Sprint Planning — Week 24', E'## Goals\n- Ship onboarding v2\n- Cut p95 latency by 30%\n\n## Risks\n- Realtime presence under load\n\n## Owners\n- @khushi → editor\n- @aman → infra', 'Engineering', array['sprint','planning']),
  (new.id, 'Product Strategy Memo', E'# North Star\n\nBecome the default workspace for high-agency product teams.\n\n## Bets\n1. AI-native editing\n2. Cinematic collaboration\n3. Zero-config sharing', 'Strategy', array['memo','vision']),
  (new.id, 'UX Review — Editor Surface', E'## Findings\n- Slash commands need keyboard hint chip\n- Sidebar density too high on 13"\n- Save indicator timing feels off by ~200ms\n\n## Recs\n- Add ⌘K affordance in empty state', 'Design', array['ux','review']),
  (new.id, 'AI Architecture Draft', E'## Layers\n- Gateway (Lovable AI)\n- Streaming response handler\n- Token accounting\n\n## Open\n- Cache key for summary refresh?\n- Per-note model selection', 'AI', array['architecture','draft']),
  (new.id, 'Weekly Research Summary', E'## Themes\n- Notion vs Linear collab gap\n- Glassmorphism re-emerging in pro tools\n\n## Quotes\n> "Speed is the feature." — internal interview', 'Research', array['weekly','research']);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- realtime
alter publication supabase_realtime add table public.notes;

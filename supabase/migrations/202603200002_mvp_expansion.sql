create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  website_url text,
  business_category text,
  target_markets jsonb not null default '[]'::jsonb,
  preferred_engines text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (organization_id)
);

create table if not exists public.prompt_tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  color text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (organization_id, slug)
);

create table if not exists public.prompt_tag_links (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  tag_id uuid not null references public.prompt_tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (prompt_id, tag_id)
);

create table if not exists public.prompt_engines (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  engine_provider_id uuid not null references public.engine_providers(id) on delete cascade,
  frequency text not null default 'manual',
  is_active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (prompt_id, engine_provider_id)
);

create table if not exists public.prompt_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  engine_provider_id uuid not null references public.engine_providers(id) on delete cascade,
  prompt_run_job_id uuid references public.prompt_run_jobs(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  queued_at timestamptz not null default timezone('utc'::text, now()),
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.engine_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prompt_run_id uuid not null references public.prompt_runs(id) on delete cascade,
  result_document_id uuid references public.result_documents(id) on delete set null,
  engine_name text,
  model_name text,
  raw_response text not null,
  response_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.result_mentions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  engine_result_id uuid not null references public.engine_results(id) on delete cascade,
  mention_type text not null check (mention_type in ('brand', 'competitor')),
  competitor_id uuid references public.competitors(id) on delete set null,
  mentioned_name text not null,
  rank_order integer,
  tone text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  domain text not null,
  url text,
  title text,
  source_type text not null default 'other',
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.recommendation_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  result_document_id uuid references public.result_documents(id) on delete set null,
  title text not null,
  description text,
  category text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  impact_score integer check (impact_score between 1 and 10),
  effort_score integer check (effort_score between 1 and 10),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  week_start_date date not null,
  week_end_date date not null,
  title text not null,
  summary text,
  report_state text not null default 'draft' check (report_state in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (organization_id, week_start_date, week_end_date)
);

create table if not exists public.report_sections (
  id uuid primary key default gen_random_uuid(),
  weekly_report_id uuid not null references public.weekly_reports(id) on delete cascade,
  section_type text not null,
  section_title text not null,
  section_body text not null,
  position integer not null default 1,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.prompts add column if not exists schedule_frequency text not null default 'manual';
alter table public.prompts add column if not exists last_run_at timestamptz;
alter table public.prompts add column if not exists last_result_status text;

alter table public.recommendations add column if not exists category text;
alter table public.recommendations add column if not exists impact_score integer check (impact_score between 1 and 10);
alter table public.recommendations add column if not exists effort_score integer check (effort_score between 1 and 10);

create index if not exists business_profiles_organization_id_idx on public.business_profiles(organization_id);
create index if not exists prompt_tags_organization_id_idx on public.prompt_tags(organization_id);
create index if not exists prompt_engines_prompt_id_idx on public.prompt_engines(prompt_id);
create index if not exists prompt_runs_organization_id_idx on public.prompt_runs(organization_id);
create index if not exists engine_results_organization_id_idx on public.engine_results(organization_id);
create index if not exists result_mentions_organization_id_idx on public.result_mentions(organization_id);
create index if not exists sources_organization_id_idx on public.sources(organization_id);
create index if not exists recommendation_actions_organization_id_idx on public.recommendation_actions(organization_id);
create index if not exists weekly_reports_organization_id_idx on public.weekly_reports(organization_id);
create index if not exists activity_logs_organization_id_idx on public.activity_logs(organization_id);

alter table public.business_profiles enable row level security;
alter table public.prompt_tags enable row level security;
alter table public.prompt_tag_links enable row level security;
alter table public.prompt_engines enable row level security;
alter table public.prompt_runs enable row level security;
alter table public.engine_results enable row level security;
alter table public.result_mentions enable row level security;
alter table public.sources enable row level security;
alter table public.recommendation_actions enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.report_sections enable row level security;
alter table public.activity_logs enable row level security;

create policy "business_profiles_all" on public.business_profiles
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "prompt_tags_all" on public.prompt_tags
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "prompt_tag_links_all" on public.prompt_tag_links
for all
using (
  exists (
    select 1 from public.prompts prompt
    join public.prompt_tags tag on tag.id = prompt_tag_links.tag_id
    where prompt.id = prompt_tag_links.prompt_id
      and public.is_member(prompt.organization_id)
      and tag.organization_id = prompt.organization_id
  )
)
with check (
  exists (
    select 1 from public.prompts prompt
    join public.prompt_tags tag on tag.id = prompt_tag_links.tag_id
    where prompt.id = prompt_tag_links.prompt_id
      and public.is_member(prompt.organization_id)
      and tag.organization_id = prompt.organization_id
  )
);

create policy "prompt_engines_all" on public.prompt_engines
for all
using (
  exists (
    select 1 from public.prompts prompt
    where prompt.id = prompt_engines.prompt_id
      and public.is_member(prompt.organization_id)
  )
)
with check (
  exists (
    select 1 from public.prompts prompt
    where prompt.id = prompt_engines.prompt_id
      and public.is_member(prompt.organization_id)
  )
);

create policy "prompt_runs_all" on public.prompt_runs
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "engine_results_all" on public.engine_results
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "result_mentions_all" on public.result_mentions
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "sources_all" on public.sources
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "recommendation_actions_all" on public.recommendation_actions
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "weekly_reports_all" on public.weekly_reports
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "report_sections_all" on public.report_sections
for all
using (
  exists (
    select 1 from public.weekly_reports weekly_report
    where weekly_report.id = report_sections.weekly_report_id
      and public.is_member(weekly_report.organization_id)
  )
)
with check (
  exists (
    select 1 from public.weekly_reports weekly_report
    where weekly_report.id = report_sections.weekly_report_id
      and public.is_member(weekly_report.organization_id)
  )
);

create policy "activity_logs_all" on public.activity_logs
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

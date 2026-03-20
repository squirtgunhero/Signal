create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sector text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (organization_id, user_id)
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  city text,
  region text,
  country_code text,
  service_radius_miles integer,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  website_url text,
  market_scope text,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  objective text,
  prompt_text text not null,
  audience text,
  funnel_stage text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.engine_providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  kind text not null check (kind in ('openai', 'anthropic', 'perplexity', 'custom')),
  model text,
  base_url text,
  credential_ref text,
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (organization_id, slug)
);

create table if not exists public.prompt_run_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  engine_provider_id uuid not null references public.engine_providers(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'scheduled', 'running', 'completed', 'failed')),
  scheduled_for timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  raw_request jsonb,
  raw_response text,
  error_message text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.prompt_run_competitors (
  id uuid primary key default gen_random_uuid(),
  run_job_id uuid not null references public.prompt_run_jobs(id) on delete cascade,
  competitor_id uuid not null references public.competitors(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (run_job_id, competitor_id)
);

create table if not exists public.result_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  run_job_id uuid not null references public.prompt_run_jobs(id) on delete cascade,
  engine_response_text text not null,
  normalized_summary text,
  model_name text,
  prompt_version_snapshot text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.citations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  result_document_id uuid not null references public.result_documents(id) on delete cascade,
  label text not null,
  source_url text not null,
  source_title text,
  source_domain text generated always as (regexp_replace(coalesce(split_part(source_url, '/', 3), ''), '^www\.', '')) stored,
  excerpt text,
  rank_position integer,
  sentiment text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  result_document_id uuid not null references public.result_documents(id) on delete cascade,
  title text not null,
  recommendation_type text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  rationale text,
  action_payload jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  period_label text,
  summary text,
  report_state text not null default 'draft' check (report_state in ('draft', 'published', 'archived')),
  generated_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.report_items (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  result_document_id uuid references public.result_documents(id) on delete set null,
  recommendation_id uuid references public.recommendations(id) on delete set null,
  section_title text not null,
  section_body text not null,
  position integer not null default 1,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists locations_organization_id_idx on public.locations(organization_id);
create index if not exists competitors_organization_id_idx on public.competitors(organization_id);
create index if not exists prompts_organization_id_idx on public.prompts(organization_id);
create index if not exists engine_providers_organization_id_idx on public.engine_providers(organization_id);
create index if not exists prompt_run_jobs_organization_id_idx on public.prompt_run_jobs(organization_id);
create index if not exists result_documents_organization_id_idx on public.result_documents(organization_id);
create index if not exists citations_organization_id_idx on public.citations(organization_id);
create index if not exists recommendations_organization_id_idx on public.recommendations(organization_id);
create index if not exists reports_organization_id_idx on public.reports(organization_id);
create index if not exists report_items_report_id_idx on public.report_items(report_id);

create or replace function public.is_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships membership
    where membership.organization_id = target_org
      and membership.user_id = auth.uid()
  );
$$;

create or replace function public.can_access_run_job(target_run_job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.prompt_run_jobs run_job
    where run_job.id = target_run_job
      and public.is_member(run_job.organization_id)
  );
$$;

create or replace function public.can_access_report(target_report uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reports report
    where report.id = target_report
      and public.is_member(report.organization_id)
  );
$$;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.locations enable row level security;
alter table public.competitors enable row level security;
alter table public.prompts enable row level security;
alter table public.engine_providers enable row level security;
alter table public.prompt_run_jobs enable row level security;
alter table public.prompt_run_competitors enable row level security;
alter table public.result_documents enable row level security;
alter table public.citations enable row level security;
alter table public.recommendations enable row level security;
alter table public.reports enable row level security;
alter table public.report_items enable row level security;

create policy "organizations_select" on public.organizations
for select using (public.is_member(id));

create policy "organizations_insert" on public.organizations
for insert with check (auth.uid() is not null);

create policy "organizations_update" on public.organizations
for update using (public.is_member(id)) with check (public.is_member(id));

create policy "memberships_select" on public.memberships
for select using (user_id = auth.uid() or public.is_member(organization_id));

create policy "memberships_insert" on public.memberships
for insert with check (user_id = auth.uid());

create policy "memberships_update" on public.memberships
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "locations_all" on public.locations
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "competitors_all" on public.competitors
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "prompts_all" on public.prompts
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "engine_providers_all" on public.engine_providers
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "prompt_run_jobs_all" on public.prompt_run_jobs
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "prompt_run_competitors_all" on public.prompt_run_competitors
for all using (public.can_access_run_job(run_job_id)) with check (public.can_access_run_job(run_job_id));

create policy "result_documents_all" on public.result_documents
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "citations_all" on public.citations
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "recommendations_all" on public.recommendations
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "reports_all" on public.reports
for all using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "report_items_all" on public.report_items
for all using (public.can_access_report(report_id)) with check (public.can_access_report(report_id));
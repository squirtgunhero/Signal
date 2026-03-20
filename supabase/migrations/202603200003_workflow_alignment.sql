create table if not exists public.prompt_locations (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (prompt_id, location_id)
);

alter table public.recommendation_actions
  add column if not exists prompt_id uuid references public.prompts(id) on delete set null,
  add column if not exists competitor_id uuid references public.competitors(id) on delete set null,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());

create index if not exists prompt_locations_prompt_id_idx on public.prompt_locations(prompt_id);
create index if not exists prompt_locations_location_id_idx on public.prompt_locations(location_id);
create index if not exists recommendation_actions_prompt_id_idx on public.recommendation_actions(prompt_id);
create index if not exists recommendation_actions_competitor_id_idx on public.recommendation_actions(competitor_id);

alter table public.prompt_locations enable row level security;

create policy "prompt_locations_all" on public.prompt_locations
for all
using (
  exists (
    select 1
    from public.prompts prompt
    join public.locations location on location.id = prompt_locations.location_id
    where prompt.id = prompt_locations.prompt_id
      and prompt.organization_id = location.organization_id
      and public.is_member(prompt.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.prompts prompt
    join public.locations location on location.id = prompt_locations.location_id
    where prompt.id = prompt_locations.prompt_id
      and prompt.organization_id = location.organization_id
      and public.is_member(prompt.organization_id)
  )
);
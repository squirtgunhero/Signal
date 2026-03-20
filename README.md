# Jersey Proper Signal

Jersey Proper Signal is a premium AI visibility intelligence SaaS for local businesses, real estate brands, and service-area companies. The product is built around real user-created operational records instead of seeded analytics or placeholder dashboards.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- shadcn-compatible UI primitives
- Supabase SSR auth and Postgres

## Product Model

The application is structured around real workspace entities:

- organizations
- memberships
- business profiles
- prompts
- prompt tags and prompt engines
- competitors
- locations
- engine providers
- prompt run jobs and prompt runs
- result documents and engine results
- result mentions
- citations
- sources
- recommendations
- recommendation actions
- reports, weekly reports, report sections, and report items
- activity logs

When data does not exist, the UI renders guided premium empty states and setup flows instead of fake metrics.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`

4. Apply the database schema in Supabase using:

   - `supabase/migrations/202603200001_initial_schema.sql`
   - `supabase/migrations/202603200002_mvp_expansion.sql`

5. Start the app:

   ```bash
   npm run dev
   ```

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Architecture Notes

- `src/app/(marketing)` contains the public entry and auth handoff.
- `src/app/auth/sign-in` and `src/app/auth/sign-up` contain dedicated auth entry points.
- `src/app/onboarding` contains the first-run organization setup wizard.
- `src/app/(workspace)` contains the authenticated operational product.
- `src/server/actions` contains mutation workflows for all core entities.
- `src/lib/data/workspace.ts` centralizes server-side workspace reads.
- `src/lib/providers` contains the provider abstraction used to normalize run envelopes for future engine execution.
- `supabase/migrations` contains the production schema and RLS setup.

## Current Integration Boundaries

- Authentication is implemented with Supabase email magic links and onboarding-first redirect flow.
- Engine providers are real user-created records with adapter-backed envelope generation; execution workers can be attached by consuming queued run jobs and writing back result documents/engine results.
- Prompt run ingestion is manual by default, so captured responses, citations, and recommendations stay tied to real user-provided outputs instead of simulated analytics.
- Future live integrations should plug into the existing adapter and queue architecture:
   - Poll queued records from `prompt_run_jobs`.
   - Execute against provider-specific clients using normalized request envelopes.
   - Persist raw output to `result_documents` and `engine_results`.
   - Derive mentions into `result_mentions` and source intelligence into `citations` and `sources`.
   - Upsert next-best-work items into `recommendations` or `recommendation_actions`.
import Link from "next/link";

import { EmptyState } from "@/components/app/empty-state";
import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { queuePromptRunsAction } from "@/server/actions/workspace-actions";

export default async function RunsPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="run jobs" />;
  }

  const prerequisitesReady =
    snapshot.collections.prompts.length > 0 &&
    snapshot.collections.locations.length > 0 &&
    snapshot.collections.providers.length > 0;

  const promptMap = new Map(snapshot.collections.prompts.map((item) => [item.id, item.title]));
  const locationMap = new Map(snapshot.collections.locations.map((item) => [item.id, item.name]));
  const providerMap = new Map(snapshot.collections.providers.map((item) => [item.id, item.name]));
  const runJobById = new Map(snapshot.collections.runJobs.map((job) => [job.id, job]));

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Runs"
        title="Prompt run queue"
        description="Queue one or multiple prompts across a selected location and engine. Runs are persisted with real statuses for execution tracking."
      />

      {!prerequisitesReady ? (
        <EmptyState
          title="Runs need prompts, locations, and engines"
          description="This section executes real prompt runs. Add at least one prompt, location, and engine in your workspace first."
          actionLabel="Open setup"
          actionHref="/setup"
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="bg-[#fffaf0]">
            <CardHeader>
              <p className="brand-kicker">Queue runs</p>
              <CardTitle>Create prompt runs</CardTitle>
              <CardDescription>Select prompts and create queued run records. No external response is fabricated.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={queuePromptRunsAction} className="grid gap-4">
                <fieldset className="grid gap-2 rounded-[20px] border border-border bg-background p-4">
                  <legend className="px-2 text-sm font-medium">Prompts</legend>
                  {snapshot.collections.prompts.map((prompt) => (
                    <label key={prompt.id} className="flex items-center gap-3 text-sm">
                      <input name="promptIds" type="checkbox" value={prompt.id} className="size-4 accent-[hsl(var(--primary))]" />
                      {prompt.title}
                    </label>
                  ))}
                </fieldset>
                <Field label="Location">
                  <Select name="locationId" required defaultValue="">
                    <option value="">Select location</option>
                    {snapshot.collections.locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="AI engine">
                  <Select name="engineProviderId" required defaultValue="">
                    <option value="">Select engine</option>
                    {snapshot.collections.providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Schedule time" hint="Optional. Leave blank to queue immediately.">
                  <input
                    name="scheduledFor"
                    type="datetime-local"
                    className="flex h-11 w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                  />
                </Field>
                <fieldset className="grid gap-2 rounded-[20px] border border-border bg-background p-4">
                  <legend className="px-2 text-sm font-medium">Competitors in scope (optional)</legend>
                  {snapshot.collections.competitors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No competitors added yet.</p>
                  ) : (
                    snapshot.collections.competitors.map((competitor) => (
                      <label key={competitor.id} className="flex items-center gap-3 text-sm">
                        <input name="competitorIds" type="checkbox" value={competitor.id} className="size-4 accent-[hsl(var(--primary))]" />
                        {competitor.name}
                      </label>
                    ))
                  )}
                </fieldset>
                <SubmitButton className="w-full">Queue runs</SubmitButton>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-[#fffaf0]">
            <CardHeader>
              <p className="brand-kicker">Run history</p>
              <CardTitle>Prompt runs</CardTitle>
              <CardDescription>Each run shows its real status and linked run job metadata.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {snapshot.collections.promptRuns.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                  This section tracks run execution. No runs are recorded yet. Queue prompts to start tracking status over time.
                </div>
              ) : (
                snapshot.collections.promptRuns.map((run) => {
                  const runJob = run.prompt_run_job_id ? runJobById.get(run.prompt_run_job_id) : null;
                  return (
                    <div key={run.id} className="rounded-[24px] border border-border bg-background p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl">{promptMap.get(run.prompt_id) ?? "Prompt"}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {locationMap.get(run.location_id ?? "") ?? "No location"} · {providerMap.get(run.engine_provider_id) ?? "No engine"}
                          </p>
                        </div>
                        <Badge variant={run.status === "completed" ? "default" : "outline"}>{run.status}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">Queued at: {run.created_at}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Run job status: {runJob?.status ?? "not linked"}</p>
                      <Link href={"#"} className="mt-3 inline-block text-sm underline underline-offset-4">
                        View run details
                      </Link>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
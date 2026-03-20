import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { createPromptAction, deletePromptAction, updatePromptAction } from "@/server/actions/workspace-actions";

type PromptsPageProps = {
  searchParams?: Promise<{ q?: string; status?: string }>;
};

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  const params = (await searchParams) ?? {};
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="prompts" />;
  }

  const query = (params.q ?? "").trim().toLowerCase();
  const statusFilter = (params.status ?? "all").toLowerCase();

  const tagByPromptId = new Map<string, string>();
  snapshot.collections.promptTagLinks.forEach((link) => {
    const tag = snapshot.collections.promptTags.find((item) => item.id === link.tag_id);
    if (tag) {
      tagByPromptId.set(link.prompt_id, tag.name);
    }
  });

  const enginesByPromptId = new Map<string, string[]>();
  snapshot.collections.promptEngines.forEach((engineLink) => {
    const provider = snapshot.collections.providers.find((item) => item.id === engineLink.engine_provider_id);
    if (!provider) {
      return;
    }

    enginesByPromptId.set(engineLink.prompt_id, [...(enginesByPromptId.get(engineLink.prompt_id) ?? []), provider.name]);
  });

  const locationsByPromptId = new Map<string, string[]>();
  snapshot.collections.promptLocations.forEach((locationLink) => {
    const location = snapshot.collections.locations.find((item) => item.id === locationLink.location_id);
    if (!location) {
      return;
    }

    locationsByPromptId.set(locationLink.prompt_id, [...(locationsByPromptId.get(locationLink.prompt_id) ?? []), location.name]);
  });

  const prompts = snapshot.collections.prompts.filter((prompt) => {
    const matchesQuery =
      !query ||
      prompt.title.toLowerCase().includes(query) ||
      prompt.prompt_text.toLowerCase().includes(query) ||
      (prompt.objective ?? "").toLowerCase().includes(query);

    const promptStatus = prompt.is_active ? "active" : "paused";
    const matchesStatus = statusFilter === "all" || promptStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Prompts"
        title="Prompt strategy"
        description="Define the prompts that matter in your market, assign coverage by location and engine, and keep each prompt active or paused as priorities shift."
      />

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Filters</p>
          <CardTitle>Find prompt records fast</CardTitle>
          <CardDescription>Search by title or text, then filter by status.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]" method="get">
            <Input name="q" defaultValue={params.q ?? ""} placeholder="Search prompts" />
            <Select name="status" defaultValue={params.status ?? "all"}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </Select>
            <SubmitButton className="md:w-fit">Apply filters</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">New prompt</p>
            <CardTitle>Create prompt</CardTitle>
            <CardDescription>Create a real tracking prompt with status, tag, engines, and location assignments.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createPromptAction} className="grid gap-4">
              <Field label="Title">
                <Input name="title" placeholder="Best real estate agents in Hoboken" required />
              </Field>
              <Field label="Objective">
                <Input name="objective" placeholder="Measure mention share and source quality." />
              </Field>
              <Field label="Audience">
                <Input name="audience" placeholder="Home buyers and sellers" />
              </Field>
              <Field label="Funnel stage">
                <Input name="funnelStage" placeholder="Decision" />
              </Field>
              <Field label="Category tag">
                <Input name="tag" placeholder="Buyer Intent" />
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue="active">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </Select>
              </Field>
              <Field label="Prompt text">
                <Textarea
                  name="promptText"
                  placeholder="Who are the top real estate teams for waterfront condos in Hoboken, and why? Include sources."
                  required
                />
              </Field>
              <fieldset className="grid gap-2 rounded-[20px] border border-border bg-background p-4">
                <legend className="px-2 text-sm font-medium">Assign locations</legend>
                {snapshot.collections.locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add locations first to assign market coverage.</p>
                ) : (
                  snapshot.collections.locations.map((location) => (
                    <label key={location.id} className="flex items-center gap-3 text-sm">
                      <input name="locationIds" type="checkbox" value={location.id} className="size-4 accent-[hsl(var(--primary))]" />
                      {location.name}
                    </label>
                  ))
                )}
              </fieldset>
              <fieldset className="grid gap-2 rounded-[20px] border border-border bg-background p-4">
                <legend className="px-2 text-sm font-medium">Assign engines</legend>
                {snapshot.collections.providers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add AI engines first to assign execution coverage.</p>
                ) : (
                  snapshot.collections.providers.map((provider) => (
                    <label key={provider.id} className="flex items-center gap-3 text-sm">
                      <input name="engineProviderIds" type="checkbox" value={provider.id} className="size-4 accent-[hsl(var(--primary))]" />
                      {provider.name}
                    </label>
                  ))
                )}
              </fieldset>
              <SubmitButton className="w-full">Create prompt</SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Prompt library</p>
            <CardTitle>Manage prompts</CardTitle>
            <CardDescription>Edit, pause, or remove prompt records as your strategy evolves.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {prompts.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                This section tracks your market prompts. No prompt data matches this filter yet. Create a prompt or clear filters to continue.
              </div>
            ) : (
              prompts.map((prompt) => {
                const promptTag = tagByPromptId.get(prompt.id);
                const engineNames = enginesByPromptId.get(prompt.id) ?? [];
                const locationNames = locationsByPromptId.get(prompt.id) ?? [];

                return (
                  <form key={prompt.id} action={updatePromptAction} className="grid gap-3 rounded-[24px] border border-border bg-background p-5">
                    <input type="hidden" name="promptId" value={prompt.id} />
                    <Field label="Title">
                      <Input name="title" defaultValue={prompt.title} required />
                    </Field>
                    <Field label="Objective">
                      <Input name="objective" defaultValue={prompt.objective ?? ""} />
                    </Field>
                    <Field label="Prompt text">
                      <Textarea name="promptText" defaultValue={prompt.prompt_text} required />
                    </Field>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Status">
                        <Select name="status" defaultValue={prompt.is_active ? "active" : "paused"}>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                        </Select>
                      </Field>
                      <Field label="Category tag">
                        <Input name="tag" defaultValue={promptTag ?? ""} />
                      </Field>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={prompt.is_active ? "default" : "outline"}>{prompt.is_active ? "Active" : "Paused"}</Badge>
                      <Badge variant="outline">{locationNames.length} locations</Badge>
                      <Badge variant="outline">{engineNames.length} engines</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {locationNames.map((name) => (
                        <span key={`${prompt.id}-${name}`} className="rounded-full border border-border px-3 py-1">
                          {name}
                        </span>
                      ))}
                      {engineNames.map((name) => (
                        <span key={`${prompt.id}-${name}-engine`} className="rounded-full border border-border px-3 py-1">
                          {name}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <SubmitButton className="w-full md:w-auto">Save changes</SubmitButton>
                      <button
                        type="submit"
                        formAction={deletePromptAction}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
                      >
                        Delete
                      </button>
                    </div>
                  </form>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

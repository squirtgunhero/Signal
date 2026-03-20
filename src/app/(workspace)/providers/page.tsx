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
import { createEngineProviderAction } from "@/server/actions/workspace-actions";

export default async function ProvidersPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="providers" />;
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Providers"
        title="Engine provider registry"
        description="Define the engine endpoints, models, and provider settings you actually operate. These records feed the adapter layer behind every run job."
      />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Input</p>
            <CardTitle>Add provider</CardTitle>
            <CardDescription>Provider records are user-created and remain separate from secrets so engine integrations can evolve safely.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createEngineProviderAction} className="grid gap-4">
              <Field label="Name">
                <Input name="name" placeholder="Primary OpenAI Endpoint" required />
              </Field>
              <Field label="Provider kind">
                <Select name="kind" required defaultValue="openai">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="perplexity">Perplexity</option>
                  <option value="custom">Custom</option>
                </Select>
              </Field>
              <Field label="Model">
                <Input name="model" placeholder="gpt-5.4" />
              </Field>
              <Field label="Base URL">
                <Input name="baseUrl" type="url" placeholder="https://api.openai.com/v1" />
              </Field>
              <Field label="Credential reference" hint="Store a reference key, not the actual secret.">
                <Input name="credentialRef" placeholder="OPENAI_API_KEY" />
              </Field>
              <Field label="Settings JSON">
                <Textarea name="settings" placeholder='{"temperature":0.2,"reasoning":"high"}' />
              </Field>
              <label className="flex items-center gap-3 rounded-[20px] border border-border bg-background px-4 py-3 text-sm">
                <input name="isActive" type="checkbox" className="size-4 accent-[hsl(var(--primary))]" defaultChecked />
                Provider is active
              </label>
              <SubmitButton className="w-full">Create provider</SubmitButton>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Registry</p>
            <CardTitle>Configured providers</CardTitle>
            <CardDescription>The adapter layer only renders providers the workspace owner created.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {snapshot.collections.providers.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                No engine providers configured yet. Add one before you queue prompt runs.
              </div>
            ) : (
              snapshot.collections.providers.map((provider) => (
                <div key={provider.id} className="rounded-[24px] border border-border bg-background p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl">{provider.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{provider.kind} · {provider.model ?? "No model specified"}</p>
                    </div>
                    <Badge variant={provider.is_active ? "default" : "outline"}>{provider.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="mt-4 text-sm text-foreground/80">{provider.base_url ?? "No base URL recorded."}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Credential ref: {provider.credential_ref ?? "Not set"}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { EmptyState } from "@/components/app/empty-state";
import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { createResultDocumentAction } from "@/server/actions/workspace-actions";

export default async function IngestionPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="ingestion" />;
  }

  if (snapshot.collections.promptRuns.length === 0) {
    return (
      <EmptyState
        title="No run jobs available for ingestion"
          description="Queue a prompt run first. Ingestion only begins when a real run exists to receive the engine response."
        actionLabel="Open run jobs"
        actionHref="/runs"
      />
    );
  }

  const promptMap = new Map(snapshot.collections.prompts.map((item) => [item.id, item.title]));

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Ingestion"
        title="Result document capture"
        description="Attach the real answer payload to a queued run job. Ingested results unlock citations, recommendations, and report assembly."
      />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Input</p>
            <CardTitle>Ingest result</CardTitle>
            <CardDescription>Store the raw answer, normalized summary, and model metadata for a specific run job.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createResultDocumentAction} className="grid gap-4">
              <Field label="Run job">
                <Select name="runJobId" required defaultValue="">
                  <option value="">Select run job</option>
                  {snapshot.collections.promptRuns.map((run) => (
                    <option key={run.id} value={run.id}>
                      {promptMap.get(run.prompt_id) ?? run.id}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Model name">
                <Input name="modelName" placeholder="gpt-5.4" />
              </Field>
              <Field label="Prompt version snapshot">
                <Input name="promptVersionSnapshot" placeholder="v2026-03-20" />
              </Field>
              <Field label="Normalized summary">
                <Textarea name="normalizedSummary" placeholder="High-level summary of how the engine framed the local answer." />
              </Field>
              <Field label="Engine response text">
                <Textarea name="engineResponseText" required placeholder="Paste the full AI response or the structured answer trace here." className="min-h-[200px]" />
              </Field>
              <SubmitButton className="w-full">Ingest result</SubmitButton>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Ledger</p>
            <CardTitle>Ingested results</CardTitle>
            <CardDescription>Stored answer documents tied to real run jobs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {snapshot.collections.resultDocuments.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                No ingested results yet. Paste the first engine response to create a result document.
              </div>
            ) : (
              snapshot.collections.resultDocuments.map((result) => (
                <div key={result.id} className="rounded-[24px] border border-border bg-background p-5">
                  <h3 className="text-xl">{result.model_name ?? "Unspecified model"}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Run ID: {result.run_job_id}</p>
                  <p className="mt-4 line-clamp-4 text-sm text-foreground/80">{result.normalized_summary ?? result.engine_response_text}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
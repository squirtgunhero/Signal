import { EmptyState } from "@/components/app/empty-state";
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
import { createCitationAction } from "@/server/actions/workspace-actions";

export default async function CitationsPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="citations" />;
  }

  if (snapshot.collections.resultDocuments.length === 0) {
    return (
      <EmptyState
        title="Citations require ingested results"
          description="Capture a result document first. Citation intelligence attaches to a real ingested answer, not a placeholder source list."
        actionLabel="Open ingestion"
        actionHref="/ingestion"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Citations"
        title="Source capture and attribution"
        description="Track which domains, pages, and excerpts appear inside AI outputs so the recommendation layer has auditable evidence instead of hunches."
      />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Input</p>
            <CardTitle>Add citation</CardTitle>
            <CardDescription>Each citation belongs to a specific ingested result document.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCitationAction} className="grid gap-4">
              <Field label="Result document">
                <Select name="resultDocumentId" required defaultValue="">
                  <option value="">Select result document</option>
                  {snapshot.collections.resultDocuments.map((result) => (
                    <option key={result.id} value={result.id}>
                      {result.model_name ?? result.id}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Label">
                <Input name="label" placeholder="Primary supporting citation" required />
              </Field>
              <Field label="Source URL">
                <Input name="sourceUrl" type="url" placeholder="https://example.com/service-area" required />
              </Field>
              <Field label="Source title">
                <Input name="sourceTitle" placeholder="Emergency AC Repair in Monmouth County" />
              </Field>
              <Field label="Rank position">
                <Input name="rankPosition" type="number" placeholder="1" />
              </Field>
              <Field label="Sentiment or role">
                <Input name="sentiment" placeholder="positive, neutral, primary, supporting" />
              </Field>
              <Field label="Excerpt">
                <Textarea name="excerpt" placeholder="Quoted or paraphrased segment from the cited page." />
              </Field>
              <SubmitButton className="w-full">Create citation</SubmitButton>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Ledger</p>
            <CardTitle>Citation ledger</CardTitle>
            <CardDescription>Only citations you ingest from real outputs appear here.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {snapshot.collections.citations.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                No citations yet. Add the first supporting source from an ingested answer.
              </div>
            ) : (
              snapshot.collections.citations.map((citation) => (
                <div key={citation.id} className="rounded-[24px] border border-border bg-background p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl">{citation.label}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{citation.source_title ?? citation.source_url}</p>
                    </div>
                    {citation.rank_position ? <Badge variant="outline">Rank {citation.rank_position}</Badge> : null}
                  </div>
                  <p className="mt-4 text-sm text-foreground/80">{citation.excerpt ?? citation.source_url}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
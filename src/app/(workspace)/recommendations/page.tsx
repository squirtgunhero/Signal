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
import { createRecommendationAction } from "@/server/actions/workspace-actions";

export default async function RecommendationsPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="recommendations" />;
  }

  if (snapshot.collections.resultDocuments.length === 0) {
    return (
      <EmptyState
        title="Recommendations need ingested evidence"
          description="Create a result document first. Recommendations should anchor to a real engine answer, not free-floating ideas."
        actionLabel="Open ingestion"
        actionHref="/ingestion"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Recommendations"
        title="Action layer"
        description="Turn ingested results into concrete recommendations with priority, rationale, and structured action payloads the team can actually use."
      />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Input</p>
            <CardTitle>Create recommendation</CardTitle>
            <CardDescription>Recommendations should tie back to a specific ingested result document.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createRecommendationAction} className="grid gap-4">
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
              <Field label="Title">
                <Input name="title" placeholder="Create a Monmouth County emergency repair landing page" required />
              </Field>
              <Field label="Recommendation type">
                <Input name="recommendationType" placeholder="content, citation, local-seo, schema, CRO" required />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Priority">
                  <Select name="priority" defaultValue="medium">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select name="status" defaultValue="open">
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </Select>
                </Field>
              </div>
              <Field label="Rationale">
                <Textarea name="rationale" placeholder="Why this action matters based on the answer and citation pattern." />
              </Field>
              <Field label="Action payload JSON">
                <Textarea name="actionPayload" placeholder='{"owner":"content-team","deadline":"2026-03-31"}' />
              </Field>
              <SubmitButton className="w-full">Create recommendation</SubmitButton>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Board</p>
            <CardTitle>Recommendation board</CardTitle>
            <CardDescription>Real actions only, tied to ingested result evidence.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {snapshot.collections.recommendationActions.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                No recommendations yet. Create the first action item from an ingested answer.
              </div>
            ) : (
              snapshot.collections.recommendationActions.map((recommendation) => (
                <div key={recommendation.id} className="rounded-[24px] border border-border bg-background p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl">{recommendation.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{recommendation.category}</p>
                    </div>
                    <Badge variant={recommendation.priority === "high" ? "default" : "outline"}>{recommendation.priority}</Badge>
                  </div>
                  <p className="mt-4 text-sm text-foreground/80">{recommendation.description ?? "No rationale recorded."}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
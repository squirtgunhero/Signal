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
import { createRecommendationAction, updateRecommendationActionStatusAction } from "@/server/actions/workspace-actions";

export default async function ActionsPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="actions" />;
  }

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Actions"
        title="Action queue"
        description="Capture next steps from real run and source evidence, then track each action through open, in progress, and completed states."
      />

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">New action</p>
          <CardTitle>Create action</CardTitle>
          <CardDescription>Actions are persisted in recommendation_actions and tied to prompt or competitor context when available.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createRecommendationAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input name="title" placeholder="Improve location page citations for Hoboken" required />
            </Field>
            <Field label="Category">
              <Input name="category" placeholder="content, citation, local-seo" required />
            </Field>
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
                <option value="done">Completed</option>
              </Select>
            </Field>
            <Field label="Related prompt" className="md:col-span-1">
              <Select name="promptId" defaultValue="">
                <option value="">Optional</option>
                {snapshot.collections.prompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Related competitor" className="md:col-span-1">
              <Select name="competitorId" defaultValue="">
                <option value="">Optional</option>
                {snapshot.collections.competitors.map((competitor) => (
                  <option key={competitor.id} value={competitor.id}>
                    {competitor.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Description" className="md:col-span-2">
              <Textarea name="description" placeholder="Explain the change and why it should improve AI visibility." />
            </Field>
            <SubmitButton className="md:w-fit">Create action</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Board</p>
          <CardTitle>Current actions</CardTitle>
          <CardDescription>This board is empty until recommendation action records exist.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {snapshot.collections.recommendationActions.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
              This section turns results into execution priorities. No actions are recorded yet. Actions appear after runs and source analysis identify clear next steps.
            </div>
          ) : (
            snapshot.collections.recommendationActions.map((action) => {
              const relatedPrompt = snapshot.collections.prompts.find((prompt) => prompt.id === action.prompt_id);
              const relatedCompetitor = snapshot.collections.competitors.find((competitor) => competitor.id === action.competitor_id);

              return (
                <div key={action.id} className="rounded-[24px] border border-border bg-background p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl">{action.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{action.description ?? "No description yet."}</p>
                    </div>
                    <Badge variant={action.priority === "high" ? "default" : "outline"}>{action.priority}</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline">{action.category}</Badge>
                    <Badge variant="outline">Status: {action.status}</Badge>
                    {relatedPrompt ? <Badge variant="outline">Prompt: {relatedPrompt.title}</Badge> : null}
                    {relatedCompetitor ? <Badge variant="outline">Competitor: {relatedCompetitor.name}</Badge> : null}
                  </div>

                  <form action={updateRecommendationActionStatusAction} className="mt-4 flex items-center gap-2">
                    <input type="hidden" name="actionId" value={action.id} />
                    <Select name="status" defaultValue={action.status}>
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Completed</option>
                    </Select>
                    <SubmitButton className="md:w-fit">Update status</SubmitButton>
                  </form>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { createCompetitorAction, deleteCompetitorAction, updateCompetitorAction } from "@/server/actions/workspace-actions";

export default async function CompetitorsPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="competitors" />;
  }

  const mentionsByCompetitorId = new Map<string, number>();
  snapshot.collections.resultMentions.forEach((mention) => {
    if (mention.mention_type === "competitor" && mention.competitor_id) {
      mentionsByCompetitorId.set(mention.competitor_id, (mentionsByCompetitorId.get(mention.competitor_id) ?? 0) + 1);
    }
  });

  const coverageByCompetitorId = new Map<string, number>();
  const runJobsById = new Map(snapshot.collections.runJobs.map((runJob) => [runJob.id, runJob]));
  snapshot.collections.promptRunCompetitors.forEach((mapping) => {
    const runJob = runJobsById.get(mapping.run_job_id);
    if (!runJob) {
      return;
    }

    coverageByCompetitorId.set(mapping.competitor_id, (coverageByCompetitorId.get(mapping.competitor_id) ?? 0) + 1);
  });

  const brandMentions = snapshot.collections.resultMentions.filter((mention) => mention.mention_type === "brand").length;
  const competitorMentions = snapshot.collections.resultMentions.filter((mention) => mention.mention_type === "competitor").length;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Competitors"
        title="Competitor visibility"
        description="Track who appears in AI answers when your brand does not, then compare competitor presence against your own mention share."
      />

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Add competitor</p>
          <CardTitle>Track a competitor</CardTitle>
          <CardDescription>Add the brands you want to compare across prompts and markets.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCompetitorAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input name="name" placeholder="Shoreline Realty" required />
            </Field>
            <Field label="Website URL">
              <Input name="websiteUrl" type="url" placeholder="https://shorelinerealty.com" />
            </Field>
            <Field label="Market scope">
              <Input name="marketScope" placeholder="Hudson County" />
            </Field>
            <Field label="Notes" className="md:col-span-2">
              <Textarea name="notes" placeholder="Consistently appears for condo and relocation prompts." />
            </Field>
            <SubmitButton className="md:w-fit">Create competitor</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Benchmark</p>
          <CardTitle>Brand vs competitor mentions</CardTitle>
          <CardDescription>Calculated only from stored result mentions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {snapshot.collections.resultMentions.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
              This section shows mention frequency and overlap once runs produce result records. Queue prompts and capture responses to start comparison.
            </div>
          ) : (
            <>
              <Badge variant="outline">Brand mentions: {brandMentions}</Badge>
              <Badge variant="outline">Competitor mentions: {competitorMentions}</Badge>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Tracked competitors</p>
          <CardTitle>Manage competitor records</CardTitle>
          <CardDescription>Edit, remove, and review mention frequency by competitor.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {snapshot.collections.competitors.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
              This section tracks competitor records. No competitors have been added yet.
            </div>
          ) : (
            snapshot.collections.competitors.map((competitor) => {
              const mentionCount = mentionsByCompetitorId.get(competitor.id) ?? 0;
              const overlapCount = coverageByCompetitorId.get(competitor.id) ?? 0;

              return (
                <form key={competitor.id} action={updateCompetitorAction} className="grid gap-3 rounded-[24px] border border-border bg-background p-5">
                  <input type="hidden" name="competitorId" value={competitor.id} />
                  <Field label="Name">
                    <Input name="name" defaultValue={competitor.name} required />
                  </Field>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Website URL">
                      <Input name="websiteUrl" type="url" defaultValue={competitor.website_url ?? ""} />
                    </Field>
                    <Field label="Market scope">
                      <Input name="marketScope" defaultValue={competitor.market_scope ?? ""} />
                    </Field>
                  </div>
                  <Field label="Notes">
                    <Textarea name="notes" defaultValue={competitor.notes ?? ""} />
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Mentions: {mentionCount}</Badge>
                    <Badge variant="outline">Prompt overlap: {overlapCount}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SubmitButton className="w-full md:w-auto">Save changes</SubmitButton>
                    <button
                      type="submit"
                      formAction={deleteCompetitorAction}
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
  );
}

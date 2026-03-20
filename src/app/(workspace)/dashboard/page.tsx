import { Activity, Compass, FileStack, Target, Waypoints } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/app/empty-state";
import { PageHero } from "@/components/app/page-hero";
import { StatCard } from "@/components/app/stat-card";
import { VisibilityOverviewChart } from "@/components/app/visibility-overview-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default async function DashboardPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status === "env-missing" || snapshot.status === "signed-out") {
    redirect("/");
  }

  if (snapshot.status === "schema-missing") {
    return (
      <EmptyState
        title="Supabase schema not applied yet"
        description="Run the migration files in supabase/migrations to create the workspace tables and policies before using the app."
        actionLabel="Open setup"
        actionHref="/setup"
        secondary={snapshot.message}
      />
    );
  }

  if (snapshot.status === "needs-organization") {
    return (
      <EmptyState
        title="Create your organization"
        description="The dashboard becomes active after onboarding creates your organization and membership records."
        actionLabel="Start onboarding"
        actionHref="/onboarding"
      />
    );
  }

  const mentions = snapshot.collections.resultMentions;
  const brandMentions = mentions.filter((mention) => mention.mention_type === "brand").length;
  const competitorMentions = mentions.filter((mention) => mention.mention_type === "competitor").length;
  const visibilityRate = mentions.length > 0 ? brandMentions / mentions.length : null;
  const competitorPresence = mentions.length > 0 ? competitorMentions / mentions.length : null;

  const completedPromptIds = new Set(
    snapshot.collections.promptRuns.filter((run) => run.status === "completed").map((run) => run.prompt_id),
  );
  const promptCoverage =
    snapshot.collections.prompts.length > 0 ? completedPromptIds.size / snapshot.collections.prompts.length : null;

  const runStatusSeries = [
    { label: "Queued", value: snapshot.collections.promptRuns.filter((run) => run.status === "queued").length },
    { label: "Running", value: snapshot.collections.promptRuns.filter((run) => run.status === "running").length },
    { label: "Completed", value: snapshot.collections.promptRuns.filter((run) => run.status === "completed").length },
    { label: "Failed", value: snapshot.collections.promptRuns.filter((run) => run.status === "failed").length },
  ];

  const latestRuns = snapshot.collections.promptRuns.slice(0, 5);
  const latestActions = snapshot.collections.recommendationActions.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Dashboard"
        title={`${snapshot.organization.name} visibility overview`}
        description="Track visibility performance across prompts, competitors, citations, runs, and action progress using only stored workspace data."
        aside={
          <div className="space-y-2 text-sm text-[#d3cdbc]">
            <p className="brand-kicker text-[#b5b0a3]">Latest run count</p>
            <p className="text-3xl font-semibold text-[#f7f1e4]">{snapshot.collections.promptRuns.length}</p>
            <p>{snapshot.collections.promptRuns.length > 0 ? "Runs are active. Keep capturing outputs to improve coverage and source quality." : "No runs yet. Start with prompts, then queue your first run."}</p>
          </div>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visibility rate" value={visibilityRate === null ? "-" : formatPercent(visibilityRate)} detail="Brand mentions / total mentions" icon={<Compass className="size-5" />} />
        <StatCard label="Prompt coverage" value={promptCoverage === null ? "-" : formatPercent(promptCoverage)} detail="Prompts with completed runs" icon={<Waypoints className="size-5" />} />
        <StatCard label="Competitor presence" value={competitorPresence === null ? "-" : formatPercent(competitorPresence)} detail="Competitor mentions / total mentions" icon={<FileStack className="size-5" />} />
        <StatCard label="Citations" value={snapshot.collections.citations.length} detail="Stored source references" icon={<Target className="size-5" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Run status</p>
            <CardTitle>Execution trend</CardTitle>
            <CardDescription>Chart appears when prompt run data exists.</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.collections.promptRuns.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                This chart tracks run statuses over time. Queue runs to start visualizing execution flow.
              </div>
            ) : (
              <VisibilityOverviewChart data={runStatusSeries} />
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Recent runs</p>
            <CardTitle>Latest run activity</CardTitle>
            <CardDescription>Most recent run records across your prompt library.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {latestRuns.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                No recent runs.
              </div>
            ) : (
              latestRuns.map((run) => (
                <div key={run.id} className="flex items-center justify-between rounded-[20px] border border-border bg-background px-4 py-3 text-sm">
                  <span>{run.id.slice(0, 8)}</span>
                  <Badge variant={run.status === "completed" ? "default" : "outline"}>{run.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Latest actions</p>
          <CardTitle>What to do next</CardTitle>
          <CardDescription>Action records are created from real workspace analysis.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {latestActions.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
              This section tracks your recommendation action queue. Actions appear after runs and source analysis produce clear follow-up work.
            </div>
          ) : (
            latestActions.map((action) => (
              <div key={action.id} className="rounded-[20px] border border-border bg-background px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{action.title}</p>
                  <Badge variant="outline">{action.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{action.category} · {action.priority}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { notFound } from "next/navigation";

import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";

type RunDetailPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const { runId } = await params;
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="run details" />;
  }

  const run = snapshot.collections.promptRuns.find((item) => item.id === runId);
  if (!run) {
    notFound();
  }

  const runJob = run.prompt_run_job_id ? snapshot.collections.runJobs.find((item) => item.id === run.prompt_run_job_id) : null;
  const engineResults = snapshot.collections.engineResults.filter((item) => item.prompt_run_id === run.id);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Run detail"
        title="Prompt run record"
        description="Review run status, request metadata, and any stored engine result records for this execution."
      />

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <CardTitle>Run status</CardTitle>
          <CardDescription>Run and job status are persisted separately so queue and execution state stay traceable.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">Prompt run: {run.status}</Badge>
          <Badge variant="outline">Run job: {runJob?.status ?? "none"}</Badge>
          <Badge variant="outline">Queued at: {run.queued_at}</Badge>
        </CardContent>
      </Card>

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <CardTitle>Engine results</CardTitle>
          <CardDescription>Only stored records are shown here.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {engineResults.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
              No engine result records yet. Results appear after run outputs are captured.
            </div>
          ) : (
            engineResults.map((result) => (
              <div key={result.id} className="rounded-[24px] border border-border bg-background p-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Engine: {result.engine_name ?? "Unknown"}</Badge>
                  <Badge variant="outline">Model: {result.model_name ?? "Unknown"}</Badge>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{result.raw_response}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

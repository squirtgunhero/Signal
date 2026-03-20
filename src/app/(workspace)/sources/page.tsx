import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";

type SourceRow = {
  domain: string;
  url: string;
  sourceType: string;
  promptTitles: string[];
  competitorNames: string[];
  count: number;
};

export default async function SourcesPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="sources" />;
  }

  const runJobById = new Map(snapshot.collections.runJobs.map((item) => [item.id, item]));
  const promptById = new Map(snapshot.collections.prompts.map((item) => [item.id, item]));
  const competitorById = new Map(snapshot.collections.competitors.map((item) => [item.id, item]));

  const sourceRowsByUrl = new Map<string, SourceRow>();

  snapshot.collections.citations.forEach((citation) => {
    const resultDocument = snapshot.collections.resultDocuments.find((item) => item.id === citation.result_document_id);
    const runJob = resultDocument ? runJobById.get(resultDocument.run_job_id) : null;
    const promptTitle = runJob ? promptById.get(runJob.prompt_id)?.title : null;

    const runCompetitorNames = runJob
      ? snapshot.collections.promptRunCompetitors
          .filter((mapping) => mapping.run_job_id === runJob.id)
          .map((mapping) => competitorById.get(mapping.competitor_id)?.name)
          .filter((value): value is string => Boolean(value))
      : [];

    const sourceType =
      snapshot.collections.sources.find((source) => source.url === citation.source_url)?.source_type ??
      snapshot.collections.sources.find((source) => source.domain === citation.source_domain)?.source_type ??
      "citation";

    const key = citation.source_url;
    const current = sourceRowsByUrl.get(key) ?? {
      domain: citation.source_domain ?? "unknown",
      url: citation.source_url,
      sourceType,
      promptTitles: [],
      competitorNames: [],
      count: 0,
    };

    current.count += 1;

    if (promptTitle && !current.promptTitles.includes(promptTitle)) {
      current.promptTitles.push(promptTitle);
    }

    runCompetitorNames.forEach((name) => {
      if (!current.competitorNames.includes(name)) {
        current.competitorNames.push(name);
      }
    });

    sourceRowsByUrl.set(key, current);
  });

  const sourceRows = [...sourceRowsByUrl.values()].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Sources"
        title="Source influence"
        description="See which domains and URLs shape AI answers, and which prompts and competitors are connected to those sources."
      />

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Source records</p>
          <CardTitle>Domains and URLs from citations</CardTitle>
          <CardDescription>This view is built from stored citation data only.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {sourceRows.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
              This section shows source influence from citation data. No citation records exist yet. Queue runs, capture responses, then add citations.
            </div>
          ) : (
            sourceRows.map((row) => (
              <div key={row.url} className="rounded-[24px] border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{row.domain}</h3>
                    <a href={row.url} target="_blank" rel="noreferrer" className="mt-2 block text-sm underline underline-offset-4">
                      {row.url}
                    </a>
                  </div>
                  <Badge variant="outline">{row.sourceType}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">Citations: {row.count}</Badge>
                  <Badge variant="outline">Related prompts: {row.promptTitles.length}</Badge>
                  <Badge variant="outline">Related competitors: {row.competitorNames.length}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {row.promptTitles.map((title) => (
                    <span key={`${row.url}-${title}`} className="rounded-full border border-border px-3 py-1">
                      {title}
                    </span>
                  ))}
                  {row.competitorNames.map((name) => (
                    <span key={`${row.url}-${name}`} className="rounded-full border border-border px-3 py-1">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

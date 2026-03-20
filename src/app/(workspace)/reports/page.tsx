import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { createWeeklyReportAction } from "@/server/actions/workspace-actions";
import { sendReportEmailAction } from "@/server/actions/email-actions";

export default async function ReportsPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="reports" />;
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Reports"
        title="Weekly reporting"
        description="Review and publish weekly visibility summaries backed by real run, source, and action records."
      />

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Create report</p>
          <CardTitle>New weekly report</CardTitle>
          <CardDescription>Reports are stored in weekly_reports and remain empty until tracking data exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createWeeklyReportAction} className="grid gap-4 md:grid-cols-2">
            <Field label="Week start date">
              <Input name="weekStartDate" type="date" required />
            </Field>
            <Field label="Week end date">
              <Input name="weekEndDate" type="date" required />
            </Field>
            <Field label="Title" className="md:col-span-2">
              <Input name="title" placeholder="Week of March 18: AI visibility summary" required />
            </Field>
            <Field label="Summary" className="md:col-span-2">
              <Textarea name="summary" placeholder="Summarize changes in visibility, source quality, and action progress." />
            </Field>
            <SubmitButton className="md:w-fit">Create weekly report</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Report library</p>
          <CardTitle>Saved weekly reports</CardTitle>
          <CardDescription>Rendered directly from weekly_reports records.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {snapshot.collections.weeklyReports.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
              This section tracks weekly reporting. No reports exist yet. Run tracking first, then create your first weekly report.
            </div>
          ) : (
            snapshot.collections.weeklyReports.map((report) => (
              <div key={report.id} className="rounded-[24px] border border-border bg-background p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl">{report.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {report.week_start_date} to {report.week_end_date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={report.report_state === "published" ? "default" : "outline"}>{report.report_state}</Badge>
                    <form action={sendReportEmailAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="title" value={report.title} />
                      <input type="hidden" name="summary" value={report.summary ?? "No summary provided."} />
                      <SubmitButton variant="outline" size="sm" pendingLabel="Sending...">Email me</SubmitButton>
                    </form>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{report.summary ?? "No summary yet."}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

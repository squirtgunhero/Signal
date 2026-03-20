import { CircleCheckBig, CircleDashed, Database } from "lucide-react";

import { PageHero } from "@/components/app/page-hero";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { redirect } from "next/navigation";
import { createOrganizationAction } from "@/server/actions/workspace-actions";

const setupSequence = [
  "Create the organization record",
  "Add at least one location",
  "Define a prompt",
  "Register a competitor",
  "Configure an engine provider",
  "Queue a first run job",
  "Ingest the answer and citations",
  "Create recommendations and reports",
];

export default async function SetupPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status === "env-missing" || snapshot.status === "signed-out") {
    redirect("/");
  }

  if (snapshot.status === "schema-missing") {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="Setup"
          title="Apply the Supabase foundation first"
          description="The product shell is in place, but the database spine is still missing. Run the SQL migration and reload this page before you try to operate the workspace."
          aside={<Database className="size-6 text-[#f7f1e4]" />}
        />
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Blocked</p>
            <CardTitle>Migration required</CardTitle>
            <CardDescription>{snapshot.message}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Apply the migration in supabase/migrations, then return to setup to create your first organization and records.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (snapshot.status === "needs-organization") {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="Setup"
          title="Shape the first workspace"
          description="Signal starts with a real organization record. After that, every prompt, location, provider, run job, citation, recommendation, and report can attach to the same operating spine."
        />
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-[#fffaf0]">
            <CardHeader>
              <p className="brand-kicker">Step 01</p>
              <CardTitle>Create organization</CardTitle>
              <CardDescription>This becomes the root entity for every workspace record and report.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createOrganizationAction} className="grid gap-4">
                <Field label="Organization name">
                  <Input name="name" placeholder="Garden State Realty" required />
                </Field>
                <Field label="Sector" hint="Optional: local services, real estate, medical, legal, home services, and similar.">
                  <Select name="sector" defaultValue="">
                    <option value="">Select sector</option>
                    <option value="real-estate">Real estate</option>
                    <option value="home-services">Home services</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="legal">Legal</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="local-business">Local business</option>
                  </Select>
                </Field>
                <SubmitButton className="w-full">Create organization</SubmitButton>
              </form>
            </CardContent>
          </Card>
          <Card className="bg-[#fffaf0]">
            <CardHeader>
              <p className="brand-kicker">Sequence</p>
              <CardTitle className="text-3xl">Setup cadence</CardTitle>
              <CardDescription>A clean workspace starts empty on purpose. Use the sequence to grow into analytics instead of inheriting fake samples.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {setupSequence.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-[24px] border border-border bg-background px-4 py-3">
                  <CircleDashed className="size-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{index + 1}. {step}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const remaining = snapshot.readiness.filter((item) => !item.done);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Setup"
        title="Real records only"
        description="The workspace is active. Keep filling the operating model until prompts, providers, runs, citations, recommendations, and reports form a complete evidence loop."
        aside={
          <div className="space-y-3">
            <p className="brand-kicker text-[#b5b0a3]">Remaining steps</p>
            <p className="text-4xl font-semibold text-[#f7f1e4]">{remaining.length}</p>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Profile</p>
            <CardTitle>Workspace profile</CardTitle>
            <CardDescription>{snapshot.organization.name} is connected and ready for structured records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border bg-background p-4">
              <p className="brand-kicker">Organization</p>
              <p className="mt-2 text-2xl font-semibold">{snapshot.organization.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{snapshot.organization.slug}</p>
            </div>
            <div className="rounded-[24px] border border-border bg-background p-4">
              <p className="brand-kicker">Owner session</p>
              <p className="mt-2 text-sm text-foreground">{snapshot.user.email}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Checklist</p>
            <CardTitle>Remaining sequence</CardTitle>
            <CardDescription>Each step below maps directly to a real data collection in Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {snapshot.readiness.map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-[24px] border border-border bg-background px-4 py-4">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <Badge variant={item.done ? "default" : "outline"} className="gap-2">
                  {item.done ? <CircleCheckBig className="size-3.5" /> : <CircleDashed className="size-3.5" />}
                  {item.done ? "Ready" : "Pending"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="bg-[#fffaf0]">
        <CardHeader>
          <p className="brand-kicker">Next Move</p>
          <CardTitle>Next recommended move</CardTitle>
          <CardDescription>The product stays blunt on purpose until you create the next dataset. Use the dedicated entity screens to keep building the model.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">Prompts: define what you want the engines to answer in the markets you actually care about.</div>
          <div className="rounded-[24px] border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">Providers: map the engine endpoints and models you actually operate.</div>
          <div className="rounded-[24px] border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">Runs and ingestion: turn a queued prompt into evidence before you try to report on it.</div>
        </CardContent>
      </Card>
    </div>
  );
}
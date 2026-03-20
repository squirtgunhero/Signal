import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { createClient } from "@/lib/supabase/server";
import { upsertBusinessProfileAction } from "@/server/actions/workspace-actions";

export default async function SettingsPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="settings" />;
  }

  const supabase = await createClient();
  const [profileResult, membershipResult] = await Promise.all([
    supabase.from("business_profiles").select("*").eq("organization_id", snapshot.organization.id).maybeSingle(),
    supabase.from("memberships").select("id, role, user_id, created_at").eq("organization_id", snapshot.organization.id).order("created_at", { ascending: true }),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (membershipResult.error) {
    throw new Error(membershipResult.error.message);
  }

  const profile = profileResult.data;
  const teamMembers = membershipResult.data ?? [];

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Settings"
        title="Organization settings"
        description="Manage your organization profile, business context, market targets, and team access from one controlled workspace."
      />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Business Profile</p>
            <CardTitle>Profile and preferences</CardTitle>
            <CardDescription>These settings inform onboarding defaults and reporting context.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={upsertBusinessProfileAction} className="grid gap-4">
              <Field label="Organization">
                <Input value={snapshot.organization.name} readOnly />
              </Field>
              <Field label="Website URL">
                <Input name="websiteUrl" type="url" placeholder="https://example.com" defaultValue={profile?.website_url ?? ""} />
              </Field>
              <Field label="Business category">
                <Input name="businessCategory" placeholder="Home services" defaultValue={profile?.business_category ?? snapshot.organization.sector ?? ""} />
              </Field>
              <Field label="Target markets" hint="Comma or newline separated.">
                <Textarea name="targetMarkets" rows={4} defaultValue={Array.isArray(profile?.target_markets) ? profile?.target_markets.join("\n") : ""} />
              </Field>
              <Field label="Preferred engines" hint="Comma or newline separated.">
                <Textarea name="preferredEngines" rows={3} defaultValue={profile?.preferred_engines?.join("\n") ?? ""} />
              </Field>
              <SubmitButton pendingLabel="Saving settings..." className="w-full md:w-auto">
                Save settings
              </SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Team</p>
            <CardTitle>Workspace members</CardTitle>
            <CardDescription>Membership and permission records tied to this organization.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {teamMembers.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                No team records found yet.
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="rounded-[20px] border border-border bg-background px-4 py-3 text-sm">
                  <p className="font-medium">{member.user_id}</p>
                  <p className="mt-1 text-muted-foreground">Role: {member.role}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

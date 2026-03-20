import { PageHero } from "@/components/app/page-hero";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { createLocationAction, deleteLocationAction, updateLocationAction } from "@/server/actions/workspace-actions";

export default async function LocationsPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status !== "ready") {
    return <WorkspaceGate snapshot={snapshot} readyLabel="locations" />;
  }

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Locations" title="Service geography" description="Manage the markets and service areas that prompt tracking should cover." />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Input</p>
            <CardTitle>Add location</CardTitle>
            <CardDescription>Primary and supporting locations shape run targeting and reporting coverage.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createLocationAction} className="grid gap-4">
              <Field label="Name">
                <Input name="name" placeholder="Monmouth County Service Area" required />
              </Field>
              <Field label="City">
                <Input name="city" placeholder="Red Bank" />
              </Field>
              <Field label="Region / state">
                <Input name="region" placeholder="New Jersey" />
              </Field>
              <Field label="Country code">
                <Input name="countryCode" placeholder="US" maxLength={2} />
              </Field>
              <Field label="Service radius miles">
                <Input name="serviceRadiusMiles" type="number" placeholder="25" />
              </Field>
              <label className="flex items-center gap-3 rounded-[20px] border border-border bg-background px-4 py-3 text-sm">
                <input name="isPrimary" type="checkbox" className="size-4 accent-[hsl(var(--primary))]" />
                Mark as primary location
              </label>
              <SubmitButton className="w-full">Create location</SubmitButton>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <p className="brand-kicker">Footprint</p>
            <CardTitle>Tracked footprint</CardTitle>
            <CardDescription>Edit or remove location records as your market footprint changes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {snapshot.collections.locations.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                This section stores your market footprint. No locations are configured yet. Add at least one location before running prompts.
              </div>
            ) : (
              snapshot.collections.locations.map((location) => (
                <form key={location.id} action={updateLocationAction} className="grid gap-3 rounded-[24px] border border-border bg-background p-5">
                  <input type="hidden" name="locationId" value={location.id} />
                  <Field label="Name">
                    <Input name="name" defaultValue={location.name} required />
                  </Field>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Field label="City">
                      <Input name="city" defaultValue={location.city ?? ""} />
                    </Field>
                    <Field label="Region / state">
                      <Input name="region" defaultValue={location.region ?? ""} />
                    </Field>
                    <Field label="Country code">
                      <Input name="countryCode" defaultValue={location.country_code ?? ""} maxLength={2} />
                    </Field>
                  </div>
                  <Field label="Service radius miles">
                    <Input name="serviceRadiusMiles" type="number" defaultValue={location.service_radius_miles ?? ""} />
                  </Field>
                  <label className="flex items-center gap-3 rounded-[20px] border border-border bg-background px-4 py-3 text-sm">
                    <input name="isPrimary" type="checkbox" defaultChecked={location.is_primary} className="size-4 accent-[hsl(var(--primary))]" />
                    Mark as primary location
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {location.is_primary ? <Badge>Primary</Badge> : null}
                    <SubmitButton className="w-full md:w-auto">Save changes</SubmitButton>
                    <button
                      type="submit"
                      formAction={deleteLocationAction}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
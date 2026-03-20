import { redirect } from "next/navigation";
import type { Route } from "next";

import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";
import { completeOnboardingAction } from "@/server/actions/workspace-actions";

export default async function OnboardingPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status === "signed-out" || snapshot.status === "env-missing") {
    redirect("/auth/sign-in" as Route);
  }

  if (snapshot.status === "ready") {
    redirect("/dashboard");
  }

  return (
    <main className="page-frame">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="brand-dark-panel rounded-[32px] p-8">
          <p className="brand-kicker text-[#d3cdbc]">Onboarding</p>
          <h1 className="mt-3 text-4xl text-[#f7f1e4]">Set your operating baseline</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d3cdbc]">
            This wizard creates your organization, business profile, initial markets, competitor list, and prompt themes so the product loop starts with real records.
          </p>
        </div>

        <form action={completeOnboardingAction} className="brand-panel grid gap-4 rounded-[28px] p-6 md:grid-cols-2">
          <Field label="Organization name" className="md:col-span-2">
            <Input name="organizationName" placeholder="Jersey Proper Realty" required />
          </Field>
          <Field label="Website URL">
            <Input name="websiteUrl" type="url" placeholder="https://example.com" />
          </Field>
          <Field label="Business category">
            <Input name="businessCategory" placeholder="Real estate brokerage" />
          </Field>
          <Field label="Target cities / ZIP / neighborhoods" className="md:col-span-2" hint="Comma or newline separated.">
            <Textarea name="targetMarkets" placeholder="Hoboken, NJ&#10;Jersey City Heights" rows={4} />
          </Field>
          <Field label="Competitors" className="md:col-span-2" hint="Comma or newline separated brand names.">
            <Textarea name="competitors" placeholder="Compass&#10;Keller Williams" rows={4} />
          </Field>
          <Field label="Prompt themes" className="md:col-span-2" hint="Comma or newline separated prompt intents.">
            <Textarea name="promptThemes" placeholder="Best listing agent for condos&#10;Top neighborhoods for first-time buyers" rows={4} />
          </Field>
          <Field label="Preferred engines" className="md:col-span-2" hint="Example: ChatGPT, Perplexity, Gemini, Google AI Overviews.">
            <Textarea name="preferredEngines" placeholder="ChatGPT&#10;Perplexity&#10;Gemini" rows={3} />
          </Field>
          <div className="md:col-span-2">
            <SubmitButton pendingLabel="Creating workspace..." className="w-full md:w-auto">
              Complete onboarding
            </SubmitButton>
          </div>
        </form>
      </section>
    </main>
  );
}

import Link from "next/link";

import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/server/actions/auth-actions";

type LandingProps = {
  supabaseReady: boolean;
};

const featureCards = [
  {
    heading: "Track the prompts that matter",
    body: "Monitor the searches and questions your customers are actually asking across the markets you serve.",
  },
  {
    heading: "See who shows up instead of you",
    body: "Compare your visibility against competitors and spot where they are winning attention.",
  },
  {
    heading: "Understand what influences the answer",
    body: "See which citations, domains, and sources appear most often in AI-generated responses.",
  },
  {
    heading: "Turn visibility into action",
    body: "Get clear recommendations based on actual results, not filler metrics.",
  },
];

const useCases = [
  {
    title: "Real Estate",
    body: "Track which agents, teams, and brokerages appear across city-specific prompts.",
  },
  {
    title: "Multi-Location Brands",
    body: "See how visibility changes from one market to the next.",
  },
  {
    title: "Service-Area Businesses",
    body: "Understand where competitors outrank you and which sources may be helping them.",
  },
];

export function Landing({ supabaseReady }: LandingProps) {
  return (
    <div className="page-frame space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="brand-dark-panel p-9 lg:p-11">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit border border-white/10 bg-white/5 text-[#f7f1e4]">
              Jersey Proper Signal
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl leading-[0.96] text-[#f7f1e4] md:text-7xl">
                See whether AI recommends your business or your competitors.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[#d3cdbc] md:text-lg">
                Track the prompts that matter, monitor visibility across AI search, uncover which sources shape the answers, and see what to improve next.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/auth/sign-up">Start Tracking</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-[#f7f1e4] hover:bg-white/10 hover:text-[#f7f1e4]">
                <a href="mailto:hello@jerseyproper.com?subject=Signal%20Demo%20Request">Book Demo</a>
              </Button>
            </div>
            <p className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#d3cdbc]">
              Built for local businesses, real estate brands, and service-area companies.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-[#d4c8b0] bg-[#fffaf0]">
          <CardHeader className="border-b border-border bg-[#f5eddd]">
            <CardTitle className="text-3xl">Start your workspace</CardTitle>
            <CardDescription>
              Sign in with your work email. Your workspace starts clean, then fills with real prompts, runs, results, competitors, sources, and actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {supabaseReady ? (
              <form action={signInAction} className="space-y-4">
                <Field label="Work email" hint="We will send a secure sign-in link.">
                  <Input name="email" type="email" placeholder="name@brand.com" required />
                </Field>
                <SubmitButton pendingLabel="Sending link..." className="w-full">
                  Start Tracking
                </SubmitButton>
              </form>
            ) : (
              <div className="rounded-[24px] border border-amber-300/60 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
                Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign in.
              </div>
            )}
            <Button asChild variant="ghost" className="w-full justify-start px-0 text-left text-sm">
              <a href="mailto:hello@jerseyproper.com?subject=Signal%20Demo%20Request">Book Demo</a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((feature) => (
          <Card key={feature.heading} className="bg-[#fffaf0]">
            <CardHeader>
              <CardTitle className="text-2xl">{feature.heading}</CardTitle>
              <CardDescription className="text-base leading-7">{feature.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="brand-dark-panel border-white/10 bg-[#161a19] text-[#f7f1e4]">
          <CardHeader>
            <p className="brand-kicker text-[#b5b0a3]">Most dashboards start with charts. Signal starts with evidence.</p>
            <CardDescription className="max-w-3xl text-base leading-7 text-[#d3cdbc]">
              Before you can measure AI visibility, you need the right prompts, the right markets, the right competitors, and a clean record of what the engines actually returned. Signal is built to track that first.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-[#fffaf0]">
          <CardHeader>
            <CardTitle className="text-2xl">Built for teams that need clarity before they invest more in content, SEO, or paid traffic.</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {useCases.map((item) => (
              <div key={item.title} className="rounded-[20px] border border-border bg-background p-4">
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="brand-dark-panel p-8">
        <div className="space-y-4">
          <h2 className="text-4xl text-[#f7f1e4]">Know where you stand inside AI.</h2>
          <p className="max-w-3xl text-base leading-7 text-[#d3cdbc]">
            Signal helps you see how your brand appears in AI-driven search and what to do next.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/auth/sign-up">Start Tracking</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-transparent text-[#f7f1e4] hover:bg-white/10 hover:text-[#f7f1e4]">
              <a href="mailto:hello@jerseyproper.com?subject=Signal%20Demo%20Request">Book Demo</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

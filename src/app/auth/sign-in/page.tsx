import Link from "next/link";
import type { Route } from "next";

import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/server/actions/auth-actions";

export default function SignInPage() {
  return (
    <main className="page-frame">
      <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-[32px] border border-[#2f3a36] bg-[#161a19] p-8 text-[#f7f1e4] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="brand-kicker text-[#d3cdbc]">Authentication</p>
          <h1 className="text-4xl leading-tight">Sign in to Jersey Proper Signal</h1>
          <p className="text-sm leading-7 text-[#d3cdbc]">
            We use a passwordless email link so owners and operators can access the workspace quickly without credential overhead.
          </p>
        </div>
        <form action={signInAction} className="brand-panel space-y-4 rounded-[28px] p-6">
          <Field label="Email address" hint="We will send a secure sign-in link.">
            <Input name="email" type="email" placeholder="you@company.com" required />
          </Field>
          <SubmitButton pendingLabel="Sending link..." className="w-full">
            Send magic link
          </SubmitButton>
          <p className="text-xs text-muted-foreground">
            Need an account? <Link href={"/auth/sign-up" as Route} className="underline underline-offset-4">Create one</Link>.
          </p>
        </form>
      </section>
    </main>
  );
}

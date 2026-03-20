import Link from "next/link";
import type { Route } from "next";

import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/server/actions/auth-actions";

export default function SignUpPage() {
  return (
    <main className="page-frame">
      <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-[32px] border border-[#2f3a36] bg-[#161a19] p-8 text-[#f7f1e4] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="brand-kicker text-[#d3cdbc]">Create Account</p>
          <h1 className="text-4xl leading-tight">Start tracking AI visibility</h1>
          <p className="text-sm leading-7 text-[#d3cdbc]">
            Enter your work email and we will send a secure access link. After sign in, onboarding creates your organization baseline.
          </p>
        </div>
        <form action={signInAction} className="brand-panel space-y-4 rounded-[28px] p-6">
          <Field label="Work email" hint="Use the email you want to own this workspace with.">
            <Input name="email" type="email" placeholder="founder@brand.com" required />
          </Field>
          <SubmitButton pendingLabel="Sending link..." className="w-full">
            Create account
          </SubmitButton>
          <p className="text-xs text-muted-foreground">
            Already have access? <Link href={"/auth/sign-in" as Route} className="underline underline-offset-4">Sign in</Link>.
          </p>
        </form>
      </section>
    </main>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSiteUrl, hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation";

export async function signInAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before signing in.");
  }

  const values = signInSchema.parse({
    email: formData.get("email"),
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: values.email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function signOutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}
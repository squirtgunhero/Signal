"use server";

import { Resend } from "resend";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function sendReportEmailAction(formData: FormData) {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(env.RESEND_API_KEY);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("You must be signed in to send emails.");
  }

  const reportId = formData.get("reportId") as string;
  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;

  if (!reportId || !title || !summary) {
    throw new Error("Missing required report fields to send email.");
  }

  const { error } = await resend.emails.send({
    // Make sure 'onboarding@resend.dev' is available or use your verified domain
    from: "Signal Intel <onboarding@resend.dev>",
    to: [user.email],
    subject: `Weekly Report: ${title}`,
    html: `
      <h2>${title}</h2>
      <p><strong>Summary:</strong></p>
      <p>${summary.replace(/\n/g, "<br />")}</p>
      <hr />
      <p>View your full report in the Signal Intel dashboard.</p>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

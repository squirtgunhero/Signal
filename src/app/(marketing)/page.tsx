import { redirect } from "next/navigation";

import { Landing } from "@/components/marketing/landing";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";

export default async function MarketingPage() {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status === "needs-organization") {
    redirect("/setup");
  }

  if (snapshot.status === "ready") {
    redirect("/dashboard");
  }

  return <Landing supabaseReady={snapshot.status !== "env-missing"} />;
}
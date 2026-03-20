import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/app-shell";
import { getWorkspaceSnapshot } from "@/lib/data/workspace";

export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const snapshot = await getWorkspaceSnapshot();

  if (snapshot.status === "env-missing" || snapshot.status === "signed-out") {
    redirect("/");
  }

  return <AppShell snapshot={snapshot}>{children}</AppShell>;
}
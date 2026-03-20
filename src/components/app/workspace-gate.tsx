import { EmptyState } from "@/components/app/empty-state";
import type { WorkspaceSnapshot } from "@/lib/data/workspace";

type WorkspaceGateProps = {
  snapshot: Exclude<WorkspaceSnapshot, { status: "ready" }>;
  readyLabel: string;
};

export function WorkspaceGate({ snapshot, readyLabel }: WorkspaceGateProps) {
  if (snapshot.status === "schema-missing") {
    return (
      <EmptyState
        title="Apply the Supabase schema first"
        description={`The ${readyLabel} workspace stays offline until the production tables, relationships, and policies exist.`}
        actionLabel="Go to setup"
        actionHref="/setup"
        secondary={snapshot.message}
      />
    );
  }

  return (
    <EmptyState
      title="Create the organization record first"
      description={`The ${readyLabel} workspace opens after the first organization exists, because every downstream record has to attach to a real operating entity.`}
      actionLabel="Open setup"
      actionHref="/setup"
    />
  );
}
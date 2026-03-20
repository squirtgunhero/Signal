import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type Membership = Database["public"]["Tables"]["memberships"]["Row"];

type WorkspaceCollections = {
  businessProfile: Database["public"]["Tables"]["business_profiles"]["Row"] | null;
  prompts: Database["public"]["Tables"]["prompts"]["Row"][];
  promptTags: Database["public"]["Tables"]["prompt_tags"]["Row"][];
  promptTagLinks: Database["public"]["Tables"]["prompt_tag_links"]["Row"][];
  promptEngines: Database["public"]["Tables"]["prompt_engines"]["Row"][];
  promptLocations: Database["public"]["Tables"]["prompt_locations"]["Row"][];
  competitors: Database["public"]["Tables"]["competitors"]["Row"][];
  locations: Database["public"]["Tables"]["locations"]["Row"][];
  providers: Database["public"]["Tables"]["engine_providers"]["Row"][];
  runJobs: Database["public"]["Tables"]["prompt_run_jobs"]["Row"][];
  promptRuns: Database["public"]["Tables"]["prompt_runs"]["Row"][];
  promptRunCompetitors: Database["public"]["Tables"]["prompt_run_competitors"]["Row"][];
  resultDocuments: Database["public"]["Tables"]["result_documents"]["Row"][];
  engineResults: Database["public"]["Tables"]["engine_results"]["Row"][];
  resultMentions: Database["public"]["Tables"]["result_mentions"]["Row"][];
  citations: Database["public"]["Tables"]["citations"]["Row"][];
  sources: Database["public"]["Tables"]["sources"]["Row"][];
  recommendationActions: Database["public"]["Tables"]["recommendation_actions"]["Row"][];
  weeklyReports: Database["public"]["Tables"]["weekly_reports"]["Row"][];
  activityLogs: Database["public"]["Tables"]["activity_logs"]["Row"][];
};

export type WorkspaceSnapshot =
  | { status: "env-missing" }
  | { status: "signed-out" }
  | { status: "schema-missing"; user: User; message: string }
  | { status: "needs-organization"; user: User }
  | {
      status: "ready";
      user: User;
      membership: Membership;
      organization: Organization;
      collections: WorkspaceCollections;
      readiness: Array<{ key: string; label: string; done: boolean; detail: string }>;
    };

async function getViewerMembership() {
  if (!hasSupabaseEnv()) {
    return { status: "env-missing" } as const;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "signed-out" } as const;
  }

  const membershipResult = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipResult.error) {
    if (membershipResult.error.code === "42P01") {
      return { status: "schema-missing", user, message: membershipResult.error.message } as const;
    }

    throw membershipResult.error;
  }

  if (!membershipResult.data) {
    return { status: "needs-organization", user } as const;
  }

  const organizationResult = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membershipResult.data.organization_id)
    .single();

  if (organizationResult.error) {
    if (organizationResult.error.code === "42P01") {
      return { status: "schema-missing", user, message: organizationResult.error.message } as const;
    }

    throw organizationResult.error;
  }

  return {
    status: "member",
    user,
    membership: membershipResult.data,
    organization: organizationResult.data,
  } as const;
}

export const getWorkspaceSnapshot = cache(async (): Promise<WorkspaceSnapshot> => {
  const viewer = await getViewerMembership();

  if (viewer.status !== "member") {
    return viewer;
  }

  const supabase = await createClient();
  const organizationId = viewer.organization.id;

  const [
    businessProfileResult,
    promptsResult,
    promptTagsResult,
    promptTagLinksResult,
    promptEnginesResult,
    promptLocationsResult,
    competitorsResult,
    locationsResult,
    providersResult,
    runJobsResult,
    promptRunsResult,
    promptRunCompetitorsResult,
    resultDocumentsResult,
    engineResultsResult,
    resultMentionsResult,
    citationsResult,
    sourcesResult,
    recommendationActionsResult,
    weeklyReportsResult,
    activityLogsResult,
  ] = await Promise.all([
    supabase.from("business_profiles").select("*").eq("organization_id", organizationId).maybeSingle(),
    supabase.from("prompts").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("prompt_tags").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("prompt_tag_links").select("*").order("created_at", { ascending: false }),
    supabase.from("prompt_engines").select("*").order("created_at", { ascending: false }),
    supabase.from("prompt_locations").select("*").order("created_at", { ascending: false }),
    supabase.from("competitors").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase
      .from("locations")
      .select("*")
      .eq("organization_id", organizationId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("engine_providers").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("prompt_run_jobs").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("prompt_runs").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("prompt_run_competitors").select("*").order("created_at", { ascending: false }),
    supabase.from("result_documents").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("engine_results").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("result_mentions").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("citations").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("sources").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("recommendation_actions").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }),
    supabase.from("weekly_reports").select("*").eq("organization_id", organizationId).order("week_start_date", { ascending: false }),
    supabase.from("activity_logs").select("*").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(50),
  ]);

  const results = [
    businessProfileResult,
    promptsResult,
    promptTagsResult,
    promptTagLinksResult,
    promptEnginesResult,
    promptLocationsResult,
    competitorsResult,
    locationsResult,
    providersResult,
    runJobsResult,
    promptRunsResult,
    promptRunCompetitorsResult,
    resultDocumentsResult,
    engineResultsResult,
    resultMentionsResult,
    citationsResult,
    sourcesResult,
    recommendationActionsResult,
    weeklyReportsResult,
    activityLogsResult,
  ];

  const tableError = results.find((result) => result.error);
  if (tableError?.error) {
    if (tableError.error.code === "42P01") {
      return { status: "schema-missing", user: viewer.user, message: tableError.error.message };
    }

    throw tableError.error;
  }

  const collections: WorkspaceCollections = {
    businessProfile: businessProfileResult.data ?? null,
    prompts: promptsResult.data ?? [],
    promptTags: promptTagsResult.data ?? [],
    promptTagLinks: promptTagLinksResult.data ?? [],
    promptEngines: promptEnginesResult.data ?? [],
    promptLocations: promptLocationsResult.data ?? [],
    competitors: competitorsResult.data ?? [],
    locations: locationsResult.data ?? [],
    providers: providersResult.data ?? [],
    runJobs: runJobsResult.data ?? [],
    promptRuns: promptRunsResult.data ?? [],
    promptRunCompetitors: promptRunCompetitorsResult.data ?? [],
    resultDocuments: resultDocumentsResult.data ?? [],
    engineResults: engineResultsResult.data ?? [],
    resultMentions: resultMentionsResult.data ?? [],
    citations: citationsResult.data ?? [],
    sources: sourcesResult.data ?? [],
    recommendationActions: recommendationActionsResult.data ?? [],
    weeklyReports: weeklyReportsResult.data ?? [],
    activityLogs: activityLogsResult.data ?? [],
  };

  const readiness = [
    { key: "organization", label: "Organization profile", done: true, detail: viewer.organization.name },
    {
      key: "prompts",
      label: "Prompt library",
      done: collections.prompts.length > 0,
      detail: `${collections.prompts.length} prompts configured`,
    },
    {
      key: "competitors",
      label: "Competitor tracking",
      done: collections.competitors.length > 0,
      detail: `${collections.competitors.length} competitors tracked`,
    },
    {
      key: "locations",
      label: "Market locations",
      done: collections.locations.length > 0,
      detail: `${collections.locations.length} locations configured`,
    },
    {
      key: "providers",
      label: "AI engines",
      done: collections.providers.length > 0,
      detail: `${collections.providers.length} engines connected`,
    },
    {
      key: "runs",
      label: "Run activity",
      done: collections.promptRuns.length > 0,
      detail: `${collections.promptRuns.length} prompt runs recorded`,
    },
    {
      key: "results",
      label: "Captured results",
      done: collections.engineResults.length > 0,
      detail: `${collections.engineResults.length} engine results stored`,
    },
    {
      key: "citations",
      label: "Source evidence",
      done: collections.citations.length > 0,
      detail: `${collections.citations.length} citations captured`,
    },
    {
      key: "actions",
      label: "Action queue",
      done: collections.recommendationActions.length > 0,
      detail: `${collections.recommendationActions.length} actions open`,
    },
    {
      key: "reports",
      label: "Weekly reports",
      done: collections.weeklyReports.length > 0,
      detail: `${collections.weeklyReports.length} reports generated`,
    },
  ];

  return {
    status: "ready",
    user: viewer.user,
    membership: viewer.membership,
    organization: viewer.organization,
    collections,
    readiness,
  };
});

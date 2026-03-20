import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  throw new Error("Missing SUPABASE_URL / SUPABASE_ANON_KEY env vars");
}

const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = serviceRoleKey
  ? createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const stamp = Date.now();
const email = `acceptance${stamp}@gmail.com`;
const password = "SignalIntel23456";

let userId = null;
let accessToken = null;

if (admin) {
  const createUser = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createUser.error) throw createUser.error;
  userId = createUser.data.user?.id ?? null;

  const signIn = await anon.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
  accessToken = signIn.data.session?.access_token ?? null;
} else {
  const signUp = await anon.auth.signUp({ email, password });
  if (signUp.error) throw signUp.error;
  userId = signUp.data.user?.id ?? null;
  accessToken = signUp.data.session?.access_token ?? null;

  if (!accessToken) {
    const signIn = await anon.auth.signInWithPassword({ email, password });
    if (signIn.error) throw signIn.error;
    accessToken = signIn.data.session?.access_token ?? null;
  }
}

if (!userId) throw new Error("No user id returned from sign up");
if (!accessToken) throw new Error("No access token available");

const user = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${accessToken}` } },
  auth: { persistSession: false, autoRefreshToken: false },
});
const db = admin ?? user;

const slug = `acceptance-${stamp}`;

const orgRes = await db.from("organizations").insert({ name: "Acceptance Org", slug, sector: "real-estate" }).select("id,name,slug").single();
if (orgRes.error) throw orgRes.error;
const orgId = orgRes.data.id;

const membershipRes = await db.from("memberships").insert({ organization_id: orgId, user_id: userId, role: "owner" }).select("id").single();
if (membershipRes.error) throw membershipRes.error;

const profileRes = await db
  .from("business_profiles")
  .insert({
    organization_id: orgId,
    website_url: "https://acceptance.example.com",
    business_category: "brokerage",
    target_markets: ["Hoboken", "Jersey City"],
    preferred_engines: ["ChatGPT", "Perplexity", "Gemini", "Google AI Overviews"],
  })
  .select("id")
  .single();
if (profileRes.error) throw profileRes.error;

const locationRes = await db.from("locations").insert({ organization_id: orgId, name: "Hoboken", city: "Hoboken", region: "NJ", country_code: "US", is_primary: true }).select("id,name").single();
if (locationRes.error) throw locationRes.error;

const competitorRes = await db.from("competitors").insert({ organization_id: orgId, name: "Competitor Prime", website_url: "https://competitor.example.com" }).select("id,name").single();
if (competitorRes.error) throw competitorRes.error;

const providerRes = await db.from("engine_providers").insert({ organization_id: orgId, name: "ChatGPT", slug: `chatgpt-${stamp}`, kind: "openai", model: "gpt-4.1" }).select("id,name").single();
if (providerRes.error) throw providerRes.error;

const promptRes = await db
  .from("prompts")
  .insert({
    organization_id: orgId,
    title: "Best listing agent in Hoboken",
    objective: "Detect local visibility for listing-intent prompts",
    prompt_text: "Who is the best listing agent in Hoboken and why? Include sources.",
    schedule_frequency: "weekly",
  })
  .select("id,title")
  .single();
if (promptRes.error) throw promptRes.error;

const runJobRes = await db
  .from("prompt_run_jobs")
  .insert({
    organization_id: orgId,
    prompt_id: promptRes.data.id,
    location_id: locationRes.data.id,
    engine_provider_id: providerRes.data.id,
    status: "queued",
    raw_request: { mode: "acceptance" },
  })
  .select("id,status")
  .single();
if (runJobRes.error) throw runJobRes.error;

const promptRunRes = await db
  .from("prompt_runs")
  .insert({
    organization_id: orgId,
    prompt_id: promptRes.data.id,
    location_id: locationRes.data.id,
    engine_provider_id: providerRes.data.id,
    prompt_run_job_id: runJobRes.data.id,
    status: "completed",
    completed_at: new Date().toISOString(),
  })
  .select("id,status")
  .single();
if (promptRunRes.error) throw promptRunRes.error;

const resultDocRes = await db
  .from("result_documents")
  .insert({
    organization_id: orgId,
    run_job_id: runJobRes.data.id,
    engine_response_text: "Acceptance engine output mentioning Acceptance Org and Competitor Prime with sources.",
    normalized_summary: "Brand and competitor both present.",
    model_name: "gpt-4.1",
    metadata: { validated: true },
  })
  .select("id")
  .single();
if (resultDocRes.error) throw resultDocRes.error;

const runJobUpdateRes = await db
  .from("prompt_run_jobs")
  .update({ status: "completed", completed_at: new Date().toISOString(), raw_response: "Acceptance engine output" })
  .eq("id", runJobRes.data.id);
if (runJobUpdateRes.error) throw runJobUpdateRes.error;

const engineResultRes = await db
  .from("engine_results")
  .insert({
    organization_id: orgId,
    prompt_run_id: promptRunRes.data.id,
    result_document_id: resultDocRes.data.id,
    engine_name: "ChatGPT",
    model_name: "gpt-4.1",
    raw_response: "Acceptance engine output",
    response_metadata: { latency_ms: 1420 },
  })
  .select("id")
  .single();
if (engineResultRes.error) throw engineResultRes.error;

const mentionsRes = await db.from("result_mentions").insert([
  {
    organization_id: orgId,
    engine_result_id: engineResultRes.data.id,
    mention_type: "brand",
    mentioned_name: "Acceptance Org",
    rank_order: 1,
    tone: "positive",
  },
  {
    organization_id: orgId,
    engine_result_id: engineResultRes.data.id,
    mention_type: "competitor",
    competitor_id: competitorRes.data.id,
    mentioned_name: "Competitor Prime",
    rank_order: 2,
    tone: "neutral",
  },
]);
if (mentionsRes.error) throw mentionsRes.error;

const citationRes = await db
  .from("citations")
  .insert({
    organization_id: orgId,
    result_document_id: resultDocRes.data.id,
    label: "Market roundup",
    source_url: "https://example.com/hoboken-market-roundup",
    source_title: "Hoboken Market Roundup",
    excerpt: "Referenced in engine answer",
    rank_position: 1,
  })
  .select("id,source_domain")
  .single();
if (citationRes.error) throw citationRes.error;

const sourceRes = await db
  .from("sources")
  .insert({
    organization_id: orgId,
    domain: citationRes.data.source_domain ?? "example.com",
    url: "https://example.com/hoboken-market-roundup",
    title: "Hoboken Market Roundup",
    source_type: "editorial article",
  })
  .select("id")
  .single();
if (sourceRes.error) throw sourceRes.error;

const recommendationRes = await db
  .from("recommendations")
  .insert({
    organization_id: orgId,
    result_document_id: resultDocRes.data.id,
    title: "Strengthen neighborhood landing pages",
    recommendation_type: "content",
    category: "location pages",
    priority: "high",
    impact_score: 9,
    effort_score: 6,
    rationale: "Competitor appears in top local intent response.",
    action_payload: { owners: ["marketing"] },
    status: "open",
  })
  .select("id,title")
  .single();
if (recommendationRes.error) throw recommendationRes.error;

const recommendationActionRes = await db
  .from("recommendation_actions")
  .insert({
    organization_id: orgId,
    result_document_id: resultDocRes.data.id,
    title: recommendationRes.data.title,
    description: "Publish and interlink Hoboken listing pages with source-backed FAQ blocks.",
    category: "content",
    priority: "high",
    impact_score: 9,
    effort_score: 6,
    status: "open",
  })
  .select("id")
  .single();
if (recommendationActionRes.error) throw recommendationActionRes.error;

const reportRes = await db
  .from("reports")
  .insert({
    organization_id: orgId,
    title: "Acceptance Weekly Visibility",
    period_label: "Week 12, 2026",
    summary: "Brand present with competitor pressure in local listing prompts.",
  })
  .select("id")
  .single();
if (reportRes.error) throw reportRes.error;

const reportItemRes = await db
  .from("report_items")
  .insert({
    report_id: reportRes.data.id,
    result_document_id: resultDocRes.data.id,
    recommendation_id: recommendationRes.data.id,
    section_title: "Visibility Movement",
    section_body: "Brand was mentioned but competitor still surfaced prominently.",
    position: 1,
  })
  .select("id")
  .single();
if (reportItemRes.error) throw reportItemRes.error;

const weeklyReportRes = await db
  .from("weekly_reports")
  .insert({
    organization_id: orgId,
    week_start_date: "2026-03-16",
    week_end_date: "2026-03-22",
    title: "Week 12 Visibility Brief",
    summary: "Acceptance pass report.",
  })
  .select("id")
  .single();
if (weeklyReportRes.error) throw weeklyReportRes.error;

const reportSectionRes = await db
  .from("report_sections")
  .insert({
    weekly_report_id: weeklyReportRes.data.id,
    section_type: "sources",
    section_title: "Source Influence",
    section_body: "example.com influenced the top answer for the tracked prompt.",
    position: 1,
  })
  .select("id")
  .single();
if (reportSectionRes.error) throw reportSectionRes.error;

const activityLogRes = await db
  .from("activity_logs")
  .insert({
    organization_id: orgId,
    actor_user_id: userId,
    event_type: "acceptance_pass_completed",
    event_payload: { run_job_id: runJobRes.data.id, report_id: reportRes.data.id },
  })
  .select("id")
  .single();
if (activityLogRes.error) throw activityLogRes.error;

const tables = [
  "organizations",
  "business_profiles",
  "competitors",
  "locations",
  "prompts",
  "prompt_run_jobs",
  "prompt_runs",
  "result_documents",
  "engine_results",
  "result_mentions",
  "citations",
  "sources",
  "recommendations",
  "recommendation_actions",
  "reports",
  "report_items",
  "weekly_reports",
  "report_sections",
  "activity_logs",
];

const counts = {};
for (const table of tables) {
  const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  counts[table] = count;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      project: "eemqogkptuboztemrpvv",
      testUser: email,
      organizationSlug: slug,
      runJobStatus: "completed",
      counts,
      createdIds: {
        organizationId: orgId,
        promptId: promptRes.data.id,
        runJobId: runJobRes.data.id,
        resultDocumentId: resultDocRes.data.id,
        recommendationId: recommendationRes.data.id,
        reportId: reportRes.data.id,
        weeklyReportId: weeklyReportRes.data.id,
      },
    },
    null,
    2,
  ),
);

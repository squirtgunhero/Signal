"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProviderAdapter } from "@/lib/providers/registry";
import type { ProviderKind } from "@/lib/providers/types";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import {
  businessProfileSchema,
  competitorSchema,
  engineProviderSchema,
  locationSchema,
  onboardingSchema,
  organizationSchema,
  parseJsonField,
  promptRunSchema,
  promptSchema,
  recommendationActionSchema,
  resultDocumentSchema,
  weeklyReportSchema,
} from "@/lib/validation";

const workspacePaths = [
  "/dashboard",
  "/onboarding",
  "/setup",
  "/prompts",
  "/competitors",
  "/locations",
  "/providers",
  "/runs",
  "/sources",
  "/actions",
  "/reports",
  "/settings",
];

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value;
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return Number(value);
}

function booleanValue(value: FormDataEntryValue | null) {
  return value === "on";
}

function splitListField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\n|,/) 
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function providerKindFromPreference(preference: string): ProviderKind {
  const normalized = preference.toLowerCase();
  if (normalized.includes("chatgpt") || normalized.includes("openai")) {
    return "openai";
  }

  if (normalized.includes("perplexity")) {
    return "perplexity";
  }

  if (normalized.includes("anthropic") || normalized.includes("claude")) {
    return "anthropic";
  }

  return "custom";
}

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to perform this action.");
  }

  return { supabase, user };
}

async function requireOrganizationContext() {
  const { supabase, user } = await requireAuthenticatedUser();
  const membershipResult = await supabase.from("memberships").select("*").eq("user_id", user.id).limit(1).maybeSingle();

  if (membershipResult.error) {
    throw new Error(membershipResult.error.message);
  }

  if (!membershipResult.data) {
    throw new Error("Create an organization before adding workspace records.");
  }

  return { supabase, user, organizationId: membershipResult.data.organization_id };
}

function revalidateWorkspace() {
  workspacePaths.forEach((path) => revalidatePath(path));
}

async function upsertPromptTag(organizationId: string, tagName: string) {
  const supabase = await createClient();
  const slug = slugify(tagName);
  const existing = await supabase
    .from("prompt_tags")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (existing.data) {
    return existing.data.id;
  }

  const inserted = await supabase
    .from("prompt_tags")
    .insert({ organization_id: organizationId, name: tagName, slug })
    .select("id")
    .single();

  if (inserted.error) {
    throw new Error(inserted.error.message);
  }

  return inserted.data.id;
}

export async function createOrganizationAction(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();

  const values = organizationSchema.parse({
    name: formData.get("name"),
    sector: optionalString(formData.get("sector")),
  });

  const slug = slugify(values.name);
  const existingOrganization = await supabase.from("organizations").select("id").eq("slug", slug).maybeSingle();
  if (existingOrganization.data) {
    throw new Error("An organization with that slug already exists.");
  }

  const organizationResult = await supabase
    .from("organizations")
    .insert({
      name: values.name,
      slug,
      sector: values.sector,
    })
    .select("id")
    .single();

  if (organizationResult.error) {
    throw new Error(organizationResult.error.message);
  }

  const membershipResult = await supabase.from("memberships").insert({
    organization_id: organizationResult.data.id,
    user_id: user.id,
    role: "owner",
  });

  if (membershipResult.error) {
    throw new Error(membershipResult.error.message);
  }

  revalidateWorkspace();
  redirect("/setup");
}

export async function completeOnboardingAction(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();
  const values = onboardingSchema.parse({
    organizationName: formData.get("organizationName"),
    websiteUrl: optionalString(formData.get("websiteUrl")),
    businessCategory: optionalString(formData.get("businessCategory")),
    targetMarkets: splitListField(formData.get("targetMarkets")),
    competitors: splitListField(formData.get("competitors")),
    promptThemes: splitListField(formData.get("promptThemes")),
    preferredEngines: splitListField(formData.get("preferredEngines")),
  });

  const existingMembership = await supabase.from("memberships").select("id").eq("user_id", user.id).maybeSingle();
  if (existingMembership.error) {
    throw new Error(existingMembership.error.message);
  }

  if (existingMembership.data) {
    redirect("/dashboard");
  }

  const baseSlug = slugify(values.organizationName);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
  const organizationResult = await supabase
    .from("organizations")
    .insert({
      name: values.organizationName,
      slug,
      sector: values.businessCategory,
    })
    .select("id")
    .single();

  if (organizationResult.error) {
    throw new Error(organizationResult.error.message);
  }

  const organizationId = organizationResult.data.id;

  const membershipResult = await supabase.from("memberships").insert({
    organization_id: organizationId,
    user_id: user.id,
    role: "owner",
  });

  if (membershipResult.error) {
    throw new Error(membershipResult.error.message);
  }

  const businessProfileResult = await supabase.from("business_profiles").insert({
    organization_id: organizationId,
    website_url: values.websiteUrl,
    business_category: values.businessCategory,
    target_markets: values.targetMarkets,
    preferred_engines: values.preferredEngines,
  });

  if (businessProfileResult.error) {
    throw new Error(businessProfileResult.error.message);
  }

  if (values.targetMarkets.length > 0) {
    const locationsResult = await supabase.from("locations").insert(
      values.targetMarkets.map((targetMarket, index) => ({
        organization_id: organizationId,
        name: targetMarket,
        is_primary: index === 0,
      })),
    );

    if (locationsResult.error) {
      throw new Error(locationsResult.error.message);
    }
  }

  if (values.competitors.length > 0) {
    const competitorsResult = await supabase.from("competitors").insert(
      values.competitors.map((name) => ({ organization_id: organizationId, name })),
    );

    if (competitorsResult.error) {
      throw new Error(competitorsResult.error.message);
    }
  }

  if (values.promptThemes.length > 0) {
    const firstMarket = values.targetMarkets[0] ?? "your service area";
    const promptsResult = await supabase.from("prompts").insert(
      values.promptThemes.map((theme) => ({
        organization_id: organizationId,
        title: theme,
        prompt_text: `Who is best for ${theme} in ${firstMarket}? Include specific reasons and source references.`,
      })),
    );

    if (promptsResult.error) {
      throw new Error(promptsResult.error.message);
    }
  }

  if (values.preferredEngines.length > 0) {
    const providersResult = await supabase.from("engine_providers").insert(
      values.preferredEngines.map((engine) => ({
        organization_id: organizationId,
        name: engine,
        slug: slugify(`${engine}-${organizationId.slice(0, 8)}`),
        kind: providerKindFromPreference(engine),
        is_active: true,
      })),
    );

    if (providersResult.error) {
      throw new Error(providersResult.error.message);
    }
  }

  revalidateWorkspace();
  redirect("/dashboard");
}

export async function upsertBusinessProfileAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = businessProfileSchema.parse({
    websiteUrl: optionalString(formData.get("websiteUrl")),
    businessCategory: optionalString(formData.get("businessCategory")),
    targetMarkets: splitListField(formData.get("targetMarkets")),
    preferredEngines: splitListField(formData.get("preferredEngines")),
  });

  const result = await supabase.from("business_profiles").upsert(
    {
      organization_id: organizationId,
      website_url: values.websiteUrl,
      business_category: values.businessCategory,
      target_markets: values.targetMarkets,
      preferred_engines: values.preferredEngines,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" },
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function createPromptAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = promptSchema.parse({
    title: formData.get("title"),
    objective: optionalString(formData.get("objective")),
    promptText: formData.get("promptText"),
    audience: optionalString(formData.get("audience")),
    funnelStage: optionalString(formData.get("funnelStage")),
    status: optionalString(formData.get("status")) || "active",
    tag: optionalString(formData.get("tag")),
  });

  const promptInsertResult = await supabase
    .from("prompts")
    .insert({
      organization_id: organizationId,
      title: values.title,
      objective: values.objective,
      prompt_text: values.promptText,
      audience: values.audience,
      funnel_stage: values.funnelStage,
      is_active: values.status !== "paused",
    })
    .select("id")
    .single();

  if (promptInsertResult.error) {
    throw new Error(promptInsertResult.error.message);
  }

  const promptId = promptInsertResult.data.id;

  if (values.tag) {
    const tagId = await upsertPromptTag(organizationId, values.tag);
    const linkResult = await supabase.from("prompt_tag_links").insert({ prompt_id: promptId, tag_id: tagId });
    if (linkResult.error) {
      throw new Error(linkResult.error.message);
    }
  }

  const locationIds = formData.getAll("locationIds").filter((value): value is string => typeof value === "string" && value.length > 0);
  if (locationIds.length > 0) {
    const locationLinksResult = await supabase.from("prompt_locations").insert(
      locationIds.map((locationId) => ({
        prompt_id: promptId,
        location_id: locationId,
      })),
    );

    if (locationLinksResult.error) {
      throw new Error(locationLinksResult.error.message);
    }
  }

  const engineProviderIds = formData
    .getAll("engineProviderIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (engineProviderIds.length > 0) {
    const enginesResult = await supabase.from("prompt_engines").insert(
      engineProviderIds.map((engineProviderId) => ({
        prompt_id: promptId,
        engine_provider_id: engineProviderId,
      })),
    );

    if (enginesResult.error) {
      throw new Error(enginesResult.error.message);
    }
  }

  revalidateWorkspace();
}

export async function updatePromptAction(formData: FormData) {
  const { supabase } = await requireOrganizationContext();
  const promptId = optionalString(formData.get("promptId"));

  if (!promptId) {
    throw new Error("Prompt id is required.");
  }

  const values = promptSchema.parse({
    title: formData.get("title"),
    objective: optionalString(formData.get("objective")),
    promptText: formData.get("promptText"),
    audience: optionalString(formData.get("audience")),
    funnelStage: optionalString(formData.get("funnelStage")),
    status: optionalString(formData.get("status")) || "active",
    tag: optionalString(formData.get("tag")),
  });

  const promptUpdateResult = await supabase
    .from("prompts")
    .update({
      title: values.title,
      objective: values.objective,
      prompt_text: values.promptText,
      audience: values.audience,
      funnel_stage: values.funnelStage,
      is_active: values.status !== "paused",
    })
    .eq("id", promptId);

  if (promptUpdateResult.error) {
    throw new Error(promptUpdateResult.error.message);
  }

  const deleteTagLinksResult = await supabase.from("prompt_tag_links").delete().eq("prompt_id", promptId);
  if (deleteTagLinksResult.error) {
    throw new Error(deleteTagLinksResult.error.message);
  }

  if (values.tag) {
    const promptResult = await supabase.from("prompts").select("organization_id").eq("id", promptId).single();
    if (promptResult.error) {
      throw new Error(promptResult.error.message);
    }

    const tagId = await upsertPromptTag(promptResult.data.organization_id, values.tag);
    const linkResult = await supabase.from("prompt_tag_links").insert({ prompt_id: promptId, tag_id: tagId });
    if (linkResult.error) {
      throw new Error(linkResult.error.message);
    }
  }

  const deleteLocationLinksResult = await supabase.from("prompt_locations").delete().eq("prompt_id", promptId);
  if (deleteLocationLinksResult.error) {
    throw new Error(deleteLocationLinksResult.error.message);
  }

  const locationIds = formData.getAll("locationIds").filter((value): value is string => typeof value === "string" && value.length > 0);
  if (locationIds.length > 0) {
    const locationLinksResult = await supabase.from("prompt_locations").insert(
      locationIds.map((locationId) => ({
        prompt_id: promptId,
        location_id: locationId,
      })),
    );

    if (locationLinksResult.error) {
      throw new Error(locationLinksResult.error.message);
    }
  }

  const deletePromptEnginesResult = await supabase.from("prompt_engines").delete().eq("prompt_id", promptId);
  if (deletePromptEnginesResult.error) {
    throw new Error(deletePromptEnginesResult.error.message);
  }

  const engineProviderIds = formData
    .getAll("engineProviderIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (engineProviderIds.length > 0) {
    const enginesResult = await supabase.from("prompt_engines").insert(
      engineProviderIds.map((engineProviderId) => ({
        prompt_id: promptId,
        engine_provider_id: engineProviderId,
      })),
    );

    if (enginesResult.error) {
      throw new Error(enginesResult.error.message);
    }
  }

  revalidateWorkspace();
}

export async function deletePromptAction(formData: FormData) {
  const { supabase } = await requireOrganizationContext();
  const promptId = optionalString(formData.get("promptId"));

  if (!promptId) {
    throw new Error("Prompt id is required.");
  }

  const result = await supabase.from("prompts").delete().eq("id", promptId);
  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function createCompetitorAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = competitorSchema.parse({
    name: formData.get("name"),
    websiteUrl: optionalString(formData.get("websiteUrl")),
    marketScope: optionalString(formData.get("marketScope")),
    notes: optionalString(formData.get("notes")),
  });

  const result = await supabase.from("competitors").insert({
    organization_id: organizationId,
    name: values.name,
    website_url: values.websiteUrl,
    market_scope: values.marketScope,
    notes: values.notes,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function updateCompetitorAction(formData: FormData) {
  const { supabase } = await requireOrganizationContext();
  const competitorId = optionalString(formData.get("competitorId"));
  if (!competitorId) {
    throw new Error("Competitor id is required.");
  }

  const values = competitorSchema.parse({
    name: formData.get("name"),
    websiteUrl: optionalString(formData.get("websiteUrl")),
    marketScope: optionalString(formData.get("marketScope")),
    notes: optionalString(formData.get("notes")),
  });

  const result = await supabase
    .from("competitors")
    .update({
      name: values.name,
      website_url: values.websiteUrl,
      market_scope: values.marketScope,
      notes: values.notes,
    })
    .eq("id", competitorId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function deleteCompetitorAction(formData: FormData) {
  const { supabase } = await requireOrganizationContext();
  const competitorId = optionalString(formData.get("competitorId"));
  if (!competitorId) {
    throw new Error("Competitor id is required.");
  }

  const result = await supabase.from("competitors").delete().eq("id", competitorId);
  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function createLocationAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = locationSchema.parse({
    name: formData.get("name"),
    city: optionalString(formData.get("city")),
    region: optionalString(formData.get("region")),
    countryCode: optionalString(formData.get("countryCode")),
    serviceRadiusMiles: optionalNumber(formData.get("serviceRadiusMiles")),
    isPrimary: booleanValue(formData.get("isPrimary")),
  });

  const result = await supabase.from("locations").insert({
    organization_id: organizationId,
    name: values.name,
    city: values.city,
    region: values.region,
    country_code: values.countryCode,
    service_radius_miles: values.serviceRadiusMiles,
    is_primary: values.isPrimary,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function updateLocationAction(formData: FormData) {
  const { supabase } = await requireOrganizationContext();
  const locationId = optionalString(formData.get("locationId"));
  if (!locationId) {
    throw new Error("Location id is required.");
  }

  const values = locationSchema.parse({
    name: formData.get("name"),
    city: optionalString(formData.get("city")),
    region: optionalString(formData.get("region")),
    countryCode: optionalString(formData.get("countryCode")),
    serviceRadiusMiles: optionalNumber(formData.get("serviceRadiusMiles")),
    isPrimary: booleanValue(formData.get("isPrimary")),
  });

  const result = await supabase
    .from("locations")
    .update({
      name: values.name,
      city: values.city,
      region: values.region,
      country_code: values.countryCode,
      service_radius_miles: values.serviceRadiusMiles,
      is_primary: values.isPrimary,
    })
    .eq("id", locationId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function deleteLocationAction(formData: FormData) {
  const { supabase } = await requireOrganizationContext();
  const locationId = optionalString(formData.get("locationId"));
  if (!locationId) {
    throw new Error("Location id is required.");
  }

  const result = await supabase.from("locations").delete().eq("id", locationId);
  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function createEngineProviderAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = engineProviderSchema.parse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    model: optionalString(formData.get("model")),
    baseUrl: optionalString(formData.get("baseUrl")),
    credentialRef: optionalString(formData.get("credentialRef")),
    settings: optionalString(formData.get("settings")) || "{}",
    isActive: booleanValue(formData.get("isActive")),
  });

  const result = await supabase.from("engine_providers").insert({
    organization_id: organizationId,
    name: values.name,
    slug: slugify(values.name),
    kind: values.kind,
    model: values.model,
    base_url: values.baseUrl,
    credential_ref: values.credentialRef,
    settings: parseJsonField(values.settings),
    is_active: values.isActive,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function queuePromptRunsAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = promptRunSchema.parse({
    locationId: formData.get("locationId"),
    engineProviderId: formData.get("engineProviderId"),
    scheduledFor: optionalString(formData.get("scheduledFor")),
  });

  const promptIds = formData
    .getAll("promptIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (promptIds.length === 0) {
    throw new Error("Select at least one prompt.");
  }

  const competitorIds = formData
    .getAll("competitorIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  const [promptsResult, locationResult, providerResult, competitorsResult] = await Promise.all([
    supabase.from("prompts").select("*").in("id", promptIds),
    supabase.from("locations").select("*").eq("id", values.locationId).single(),
    supabase.from("engine_providers").select("*").eq("id", values.engineProviderId).single(),
    competitorIds.length ? supabase.from("competitors").select("*").in("id", competitorIds) : Promise.resolve({ data: [], error: null }),
  ]);

  for (const result of [promptsResult, locationResult, providerResult, competitorsResult]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const location = locationResult.data;
  const provider = providerResult.data;
  if (!location || !provider) {
    throw new Error("The selected location or engine could not be resolved.");
  }

  const adapter = getProviderAdapter(provider.kind as ProviderKind);

  for (const prompt of promptsResult.data ?? []) {
    const rawRequest = adapter.buildRequestEnvelope({
      prompt,
      location,
      provider,
      competitors: competitorsResult.data ?? [],
    });

    const runJobResult = await supabase
      .from("prompt_run_jobs")
      .insert({
        organization_id: organizationId,
        prompt_id: prompt.id,
        location_id: values.locationId,
        engine_provider_id: values.engineProviderId,
        status: values.scheduledFor ? "scheduled" : "queued",
        scheduled_for: values.scheduledFor,
        raw_request: rawRequest,
      })
      .select("id")
      .single();

    if (runJobResult.error) {
      throw new Error(runJobResult.error.message);
    }

    const promptRunResult = await supabase
      .from("prompt_runs")
      .insert({
        organization_id: organizationId,
        prompt_id: prompt.id,
        location_id: values.locationId,
        engine_provider_id: values.engineProviderId,
        prompt_run_job_id: runJobResult.data.id,
        status: "queued",
      })
      .select("id")
      .single();

    if (promptRunResult.error) {
      throw new Error(promptRunResult.error.message);
    }

    if (competitorIds.length) {
      const mappingResult = await supabase.from("prompt_run_competitors").insert(
        competitorIds.map((competitorId) => ({
          run_job_id: runJobResult.data.id,
          competitor_id: competitorId,
        })),
      );

      if (mappingResult.error) {
        throw new Error(mappingResult.error.message);
      }
    }

    const placeholderResult = await supabase.from("engine_results").insert({
      organization_id: organizationId,
      prompt_run_id: promptRunResult.data.id,
      engine_name: provider.name,
      model_name: provider.model,
      raw_response: "Queued run. Awaiting provider response.",
      response_metadata: { status: "placeholder" },
    });

    if (placeholderResult.error) {
      throw new Error(placeholderResult.error.message);
    }
  }

  revalidateWorkspace();
}

export async function createResultDocumentAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = resultDocumentSchema.parse({
    runJobId: formData.get("runJobId"),
    engineResponseText: formData.get("engineResponseText"),
    normalizedSummary: optionalString(formData.get("normalizedSummary")),
    modelName: optionalString(formData.get("modelName")),
    promptVersionSnapshot: optionalString(formData.get("promptVersionSnapshot")),
  });

  const resultDocumentResult = await supabase
    .from("result_documents")
    .insert({
      organization_id: organizationId,
      run_job_id: values.runJobId,
      engine_response_text: values.engineResponseText,
      normalized_summary: values.normalizedSummary,
      model_name: values.modelName,
      prompt_version_snapshot: values.promptVersionSnapshot,
    })
    .select("id")
    .single();

  if (resultDocumentResult.error) {
    throw new Error(resultDocumentResult.error.message);
  }

  const runUpdate = await supabase
    .from("prompt_run_jobs")
    .update({
      status: "completed",
      raw_response: values.engineResponseText,
      completed_at: new Date().toISOString(),
    })
    .eq("id", values.runJobId);

  if (runUpdate.error) {
    throw new Error(runUpdate.error.message);
  }

  const promptRunResult = await supabase
    .from("prompt_runs")
    .select("id")
    .eq("prompt_run_job_id", values.runJobId)
    .maybeSingle();

  if (promptRunResult.error) {
    throw new Error(promptRunResult.error.message);
  }

  if (promptRunResult.data) {
    const promptRunUpdateResult = await supabase
      .from("prompt_runs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", promptRunResult.data.id);

    if (promptRunUpdateResult.error) {
      throw new Error(promptRunUpdateResult.error.message);
    }

    const engineResultUpdateResult = await supabase
      .from("engine_results")
      .update({
        result_document_id: resultDocumentResult.data.id,
        raw_response: values.engineResponseText,
        model_name: values.modelName,
        response_metadata: { status: "captured" },
      })
      .eq("prompt_run_id", promptRunResult.data.id)
      .eq("organization_id", organizationId);

    if (engineResultUpdateResult.error) {
      throw new Error(engineResultUpdateResult.error.message);
    }
  }

  revalidateWorkspace();
}

export async function createRecommendationAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = recommendationActionSchema.parse({
    title: formData.get("title"),
    description: optionalString(formData.get("description")),
    category: formData.get("category"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    promptId: optionalString(formData.get("promptId")),
    competitorId: optionalString(formData.get("competitorId")),
  });

  const result = await supabase.from("recommendation_actions").insert({
    organization_id: organizationId,
    title: values.title,
    description: values.description,
    category: values.category,
    priority: values.priority,
    status: values.status,
    prompt_id: values.promptId,
    competitor_id: values.competitorId,
    updated_at: new Date().toISOString(),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function updateRecommendationActionStatusAction(formData: FormData) {
  const { supabase } = await requireOrganizationContext();
  const actionId = optionalString(formData.get("actionId"));
  const status = optionalString(formData.get("status"));

  if (!actionId || !status) {
    throw new Error("Action id and status are required.");
  }

  const result = await supabase
    .from("recommendation_actions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", actionId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function createWeeklyReportAction(formData: FormData) {
  const { supabase, organizationId } = await requireOrganizationContext();
  const values = weeklyReportSchema.parse({
    weekStartDate: formData.get("weekStartDate"),
    weekEndDate: formData.get("weekEndDate"),
    title: formData.get("title"),
    summary: optionalString(formData.get("summary")),
  });

  const result = await supabase.from("weekly_reports").insert({
    organization_id: organizationId,
    week_start_date: values.weekStartDate,
    week_end_date: values.weekEndDate,
    title: values.title,
    summary: values.summary,
    report_state: "draft",
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidateWorkspace();
}

export async function createCitationAction(formData: FormData) {
  // To be implemented
}

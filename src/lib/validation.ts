import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

export const organizationSchema = z.object({
  name: z.string().trim().min(2),
  sector: optionalString,
});

export const businessProfileSchema = z.object({
  websiteUrl: z.string().trim().url().or(z.literal("")).transform((value) => value || null),
  businessCategory: optionalString,
  targetMarkets: z.array(z.string().trim().min(1)).default([]),
  preferredEngines: z.array(z.string().trim().min(1)).default([]),
});

export const onboardingSchema = z.object({
  organizationName: z.string().trim().min(2),
  websiteUrl: z.string().trim().url().or(z.literal("")).transform((value) => value || null),
  businessCategory: optionalString,
  targetMarkets: z.array(z.string().trim().min(1)).default([]),
  competitors: z.array(z.string().trim().min(1)).default([]),
  promptThemes: z.array(z.string().trim().min(1)).default([]),
  preferredEngines: z.array(z.string().trim().min(1)).default([]),
});

export const promptSchema = z.object({
  title: z.string().trim().min(2),
  objective: optionalString,
  promptText: z.string().trim().min(20),
  audience: optionalString,
  funnelStage: optionalString,
  status: z.enum(["active", "paused"]).default("active"),
  tag: optionalString,
});

export const competitorSchema = z.object({
  name: z.string().trim().min(2),
  websiteUrl: z.string().trim().url().or(z.literal("")).transform((value) => value || null),
  marketScope: optionalString,
  notes: optionalString,
});

export const locationSchema = z.object({
  name: z.string().trim().min(2),
  city: optionalString,
  region: optionalString,
  countryCode: z.string().trim().max(2).transform((value) => value.toUpperCase() || null),
  serviceRadiusMiles: z.coerce.number().min(0).max(500).nullable().optional(),
  isPrimary: z.boolean(),
});

export const engineProviderSchema = z.object({
  name: z.string().trim().min(2),
  kind: z.enum(["openai", "anthropic", "perplexity", "custom"]),
  model: optionalString,
  baseUrl: z.string().trim().url().or(z.literal("")).transform((value) => value || null),
  credentialRef: optionalString,
  settings: z.string().trim().default("{}"),
  isActive: z.boolean(),
});

export const promptRunSchema = z.object({
  locationId: z.string().uuid(),
  engineProviderId: z.string().uuid(),
  scheduledFor: z.string().trim().transform((value) => value || null),
});

export const resultDocumentSchema = z.object({
  runJobId: z.string().uuid(),
  engineResponseText: z.string().trim().min(20),
  normalizedSummary: optionalString,
  modelName: optionalString,
  promptVersionSnapshot: optionalString,
});

export const citationSchema = z.object({
  resultDocumentId: z.string().uuid(),
  label: z.string().trim().min(2),
  sourceUrl: z.string().trim().url(),
  sourceTitle: optionalString,
  excerpt: optionalString,
  rankPosition: z.coerce.number().int().min(1).max(100).nullable().optional(),
  sentiment: optionalString,
});

export const recommendationSchema = z.object({
  resultDocumentId: z.string().uuid(),
  title: z.string().trim().min(2),
  recommendationType: z.string().trim().min(2),
  priority: z.enum(["low", "medium", "high"]),
  rationale: optionalString,
  actionPayload: z.string().trim().default("{}"),
  status: z.enum(["open", "in_progress", "done"]),
});

export const reportSchema = z.object({
  title: z.string().trim().min(2),
  periodLabel: optionalString,
  summary: optionalString,
});

export const reportItemSchema = z.object({
  reportId: z.string().uuid(),
  resultDocumentId: z.string().uuid().nullable().optional(),
  recommendationId: z.string().uuid().nullable().optional(),
  sectionTitle: z.string().trim().min(2),
  sectionBody: z.string().trim().min(10),
  position: z.coerce.number().int().min(1).max(100).default(1),
});

export const signInSchema = z.object({
  email: z.string().trim().email(),
});

export const recommendationActionSchema = z.object({
  title: z.string().trim().min(2),
  description: optionalString,
  category: z.string().trim().min(2),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "in_progress", "done"]),
  promptId: z.string().uuid().nullable().optional(),
  competitorId: z.string().uuid().nullable().optional(),
});

export const weeklyReportSchema = z.object({
  weekStartDate: z.string().trim().min(1),
  weekEndDate: z.string().trim().min(1),
  title: z.string().trim().min(2),
  summary: optionalString,
});

export function parseJsonField(value: string) {
  const parsed = JSON.parse(value || "{}");
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object.");
  }

  return parsed;
}
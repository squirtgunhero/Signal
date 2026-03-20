import type { Database, Json } from "@/types/database";

export const providerKinds = ["openai", "anthropic", "perplexity", "custom"] as const;

export type ProviderKind = (typeof providerKinds)[number];

export type ProviderRecord = Database["public"]["Tables"]["engine_providers"]["Row"];
export type PromptRecord = Database["public"]["Tables"]["prompts"]["Row"];
export type LocationRecord = Database["public"]["Tables"]["locations"]["Row"];
export type CompetitorRecord = Database["public"]["Tables"]["competitors"]["Row"];

export type RunEnvelopeContext = {
  prompt: PromptRecord;
  location: LocationRecord;
  provider: ProviderRecord;
  competitors: CompetitorRecord[];
};

export interface EngineProviderAdapter {
  kind: ProviderKind;
  label: string;
  buildRequestEnvelope(context: RunEnvelopeContext): Json;
}
import type { EngineProviderAdapter, ProviderKind, RunEnvelopeContext } from "@/lib/providers/types";

function buildEditorialPrompt(context: RunEnvelopeContext) {
  const competitorSet = context.competitors.map((competitor) => ({
    name: competitor.name,
    websiteUrl: competitor.website_url,
    scope: competitor.market_scope,
  }));

  return {
    prompt: {
      title: context.prompt.title,
      objective: context.prompt.objective,
      text: context.prompt.prompt_text,
      audience: context.prompt.audience,
      funnelStage: context.prompt.funnel_stage,
    },
    geography: {
      name: context.location.name,
      city: context.location.city,
      region: context.location.region,
      countryCode: context.location.country_code,
      serviceRadiusMiles: context.location.service_radius_miles,
    },
    competitors: competitorSet,
  };
}

const adapters: Record<ProviderKind, EngineProviderAdapter> = {
  openai: {
    kind: "openai",
    label: "OpenAI-compatible",
    buildRequestEnvelope(context) {
      const editorialPrompt = buildEditorialPrompt(context);
      return {
        provider: context.provider.kind,
        model: context.provider.model,
        endpoint: context.provider.base_url,
        body: {
          messages: [
            {
              role: "system",
              content: "You analyze AI answer visibility for local demand capture and competitive search presence.",
            },
            {
              role: "user",
              content: editorialPrompt,
            },
          ],
        },
      };
    },
  },
  anthropic: {
    kind: "anthropic",
    label: "Anthropic-compatible",
    buildRequestEnvelope(context) {
      return {
        provider: context.provider.kind,
        model: context.provider.model,
        endpoint: context.provider.base_url,
        body: {
          system: "You analyze AI answer visibility for local demand capture and competitive search presence.",
          messages: [
            {
              role: "user",
              content: buildEditorialPrompt(context),
            },
          ],
        },
      };
    },
  },
  perplexity: {
    kind: "perplexity",
    label: "Perplexity-compatible",
    buildRequestEnvelope(context) {
      return {
        provider: context.provider.kind,
        model: context.provider.model,
        endpoint: context.provider.base_url,
        body: {
          search_domain_filter: context.competitors.map((competitor) => competitor.website_url).filter(Boolean),
          messages: [
            {
              role: "system",
              content: "Assess citation visibility and answer inclusion for local commercial intent.",
            },
            {
              role: "user",
              content: buildEditorialPrompt(context),
            },
          ],
        },
      };
    },
  },
  custom: {
    kind: "custom",
    label: "Custom provider",
    buildRequestEnvelope(context) {
      return {
        provider: context.provider.kind,
        model: context.provider.model,
        endpoint: context.provider.base_url,
        payload: buildEditorialPrompt(context),
      };
    },
  },
};

export function getProviderAdapter(kind: ProviderKind) {
  return adapters[kind];
}
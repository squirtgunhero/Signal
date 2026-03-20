export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: TableDefinition<
        {
          id: string;
          name: string;
          slug: string;
          sector: string | null;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          slug: string;
          sector?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          name?: string;
          slug?: string;
          sector?: string | null;
          created_at?: string;
        }
      >;
      memberships: TableDefinition<
        {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        }
      >;
      business_profiles: TableDefinition<
        {
          id: string;
          organization_id: string;
          website_url: string | null;
          business_category: string | null;
          target_markets: Json;
          preferred_engines: string[];
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          website_url?: string | null;
          business_category?: string | null;
          target_markets?: Json;
          preferred_engines?: string[];
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          website_url?: string | null;
          business_category?: string | null;
          target_markets?: Json;
          preferred_engines?: string[];
          created_at?: string;
          updated_at?: string;
        }
      >;
      locations: TableDefinition<
        {
          id: string;
          organization_id: string;
          name: string;
          city: string | null;
          region: string | null;
          country_code: string | null;
          service_radius_miles: number | null;
          is_primary: boolean;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          name: string;
          city?: string | null;
          region?: string | null;
          country_code?: string | null;
          service_radius_miles?: number | null;
          is_primary?: boolean;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          name?: string;
          city?: string | null;
          region?: string | null;
          country_code?: string | null;
          service_radius_miles?: number | null;
          is_primary?: boolean;
          created_at?: string;
        }
      >;
      competitors: TableDefinition<
        {
          id: string;
          organization_id: string;
          name: string;
          website_url: string | null;
          market_scope: string | null;
          notes: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          name: string;
          website_url?: string | null;
          market_scope?: string | null;
          notes?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          name?: string;
          website_url?: string | null;
          market_scope?: string | null;
          notes?: string | null;
          created_at?: string;
        }
      >;
      prompts: TableDefinition<
        {
          id: string;
          organization_id: string;
          title: string;
          objective: string | null;
          prompt_text: string;
          audience: string | null;
          funnel_stage: string | null;
          is_active: boolean;
          schedule_frequency: string;
          last_run_at: string | null;
          last_result_status: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          title: string;
          objective?: string | null;
          prompt_text: string;
          audience?: string | null;
          funnel_stage?: string | null;
          is_active?: boolean;
          schedule_frequency?: string;
          last_run_at?: string | null;
          last_result_status?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          title?: string;
          objective?: string | null;
          prompt_text?: string;
          audience?: string | null;
          funnel_stage?: string | null;
          is_active?: boolean;
          schedule_frequency?: string;
          last_run_at?: string | null;
          last_result_status?: string | null;
          created_at?: string;
        }
      >;
      prompt_tags: TableDefinition<
        {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          color: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          color?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          color?: string | null;
          created_at?: string;
        }
      >;
      prompt_tag_links: TableDefinition<
        {
          id: string;
          prompt_id: string;
          tag_id: string;
          created_at: string;
        },
        {
          id?: string;
          prompt_id: string;
          tag_id: string;
          created_at?: string;
        },
        {
          id?: string;
          prompt_id?: string;
          tag_id?: string;
          created_at?: string;
        }
      >;
      prompt_locations: TableDefinition<
        {
          id: string;
          prompt_id: string;
          location_id: string;
          created_at: string;
        },
        {
          id?: string;
          prompt_id: string;
          location_id: string;
          created_at?: string;
        },
        {
          id?: string;
          prompt_id?: string;
          location_id?: string;
          created_at?: string;
        }
      >;
      engine_providers: TableDefinition<
        {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          kind: string;
          model: string | null;
          base_url: string | null;
          credential_ref: string | null;
          settings: Json;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          kind: string;
          model?: string | null;
          base_url?: string | null;
          credential_ref?: string | null;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          kind?: string;
          model?: string | null;
          base_url?: string | null;
          credential_ref?: string | null;
          settings?: Json;
          is_active?: boolean;
          created_at?: string;
        }
      >;
      prompt_engines: TableDefinition<
        {
          id: string;
          prompt_id: string;
          engine_provider_id: string;
          frequency: string;
          is_active: boolean;
          last_run_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          prompt_id: string;
          engine_provider_id: string;
          frequency?: string;
          is_active?: boolean;
          last_run_at?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          prompt_id?: string;
          engine_provider_id?: string;
          frequency?: string;
          is_active?: boolean;
          last_run_at?: string | null;
          created_at?: string;
        }
      >;
      prompt_run_jobs: TableDefinition<
        {
          id: string;
          organization_id: string;
          prompt_id: string;
          location_id: string;
          engine_provider_id: string;
          status: string;
          scheduled_for: string | null;
          started_at: string | null;
          completed_at: string | null;
          raw_request: Json | null;
          raw_response: string | null;
          error_message: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          prompt_id: string;
          location_id: string;
          engine_provider_id: string;
          status?: string;
          scheduled_for?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          raw_request?: Json | null;
          raw_response?: string | null;
          error_message?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          prompt_id?: string;
          location_id?: string;
          engine_provider_id?: string;
          status?: string;
          scheduled_for?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          raw_request?: Json | null;
          raw_response?: string | null;
          error_message?: string | null;
          created_at?: string;
        }
      >;
      prompt_runs: TableDefinition<
        {
          id: string;
          organization_id: string;
          prompt_id: string;
          location_id: string | null;
          engine_provider_id: string;
          prompt_run_job_id: string | null;
          status: string;
          queued_at: string;
          completed_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          prompt_id: string;
          location_id?: string | null;
          engine_provider_id: string;
          prompt_run_job_id?: string | null;
          status?: string;
          queued_at?: string;
          completed_at?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          prompt_id?: string;
          location_id?: string | null;
          engine_provider_id?: string;
          prompt_run_job_id?: string | null;
          status?: string;
          queued_at?: string;
          completed_at?: string | null;
          created_at?: string;
        }
      >;
      prompt_run_competitors: TableDefinition<
        {
          id: string;
          run_job_id: string;
          competitor_id: string;
          created_at: string;
        },
        {
          id?: string;
          run_job_id: string;
          competitor_id: string;
          created_at?: string;
        },
        {
          id?: string;
          run_job_id?: string;
          competitor_id?: string;
          created_at?: string;
        }
      >;
      result_documents: TableDefinition<
        {
          id: string;
          organization_id: string;
          run_job_id: string;
          engine_response_text: string;
          normalized_summary: string | null;
          model_name: string | null;
          prompt_version_snapshot: string | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          run_job_id: string;
          engine_response_text: string;
          normalized_summary?: string | null;
          model_name?: string | null;
          prompt_version_snapshot?: string | null;
          metadata?: Json;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          run_job_id?: string;
          engine_response_text?: string;
          normalized_summary?: string | null;
          model_name?: string | null;
          prompt_version_snapshot?: string | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
      engine_results: TableDefinition<
        {
          id: string;
          organization_id: string;
          prompt_run_id: string;
          result_document_id: string | null;
          engine_name: string | null;
          model_name: string | null;
          raw_response: string;
          response_metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          prompt_run_id: string;
          result_document_id?: string | null;
          engine_name?: string | null;
          model_name?: string | null;
          raw_response: string;
          response_metadata?: Json;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          prompt_run_id?: string;
          result_document_id?: string | null;
          engine_name?: string | null;
          model_name?: string | null;
          raw_response?: string;
          response_metadata?: Json;
          created_at?: string;
        }
      >;
      result_mentions: TableDefinition<
        {
          id: string;
          organization_id: string;
          engine_result_id: string;
          mention_type: string;
          competitor_id: string | null;
          mentioned_name: string;
          rank_order: number | null;
          tone: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          engine_result_id: string;
          mention_type: string;
          competitor_id?: string | null;
          mentioned_name: string;
          rank_order?: number | null;
          tone?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          engine_result_id?: string;
          mention_type?: string;
          competitor_id?: string | null;
          mentioned_name?: string;
          rank_order?: number | null;
          tone?: string | null;
          created_at?: string;
        }
      >;
      citations: TableDefinition<
        {
          id: string;
          organization_id: string;
          result_document_id: string;
          label: string;
          source_url: string;
          source_title: string | null;
          source_domain: string | null;
          excerpt: string | null;
          rank_position: number | null;
          sentiment: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          result_document_id: string;
          label: string;
          source_url: string;
          source_title?: string | null;
          source_domain?: string | null;
          excerpt?: string | null;
          rank_position?: number | null;
          sentiment?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          result_document_id?: string;
          label?: string;
          source_url?: string;
          source_title?: string | null;
          source_domain?: string | null;
          excerpt?: string | null;
          rank_position?: number | null;
          sentiment?: string | null;
          created_at?: string;
        }
      >;
      sources: TableDefinition<
        {
          id: string;
          organization_id: string;
          domain: string;
          url: string | null;
          title: string | null;
          source_type: string;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          domain: string;
          url?: string | null;
          title?: string | null;
          source_type?: string;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          domain?: string;
          url?: string | null;
          title?: string | null;
          source_type?: string;
          created_at?: string;
        }
      >;
      recommendations: TableDefinition<
        {
          id: string;
          organization_id: string;
          result_document_id: string;
          title: string;
          recommendation_type: string;
          category: string | null;
          priority: string;
          impact_score: number | null;
          effort_score: number | null;
          rationale: string | null;
          action_payload: Json;
          status: string;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          result_document_id: string;
          title: string;
          recommendation_type: string;
          category?: string | null;
          priority?: string;
          impact_score?: number | null;
          effort_score?: number | null;
          rationale?: string | null;
          action_payload?: Json;
          status?: string;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          result_document_id?: string;
          title?: string;
          recommendation_type?: string;
          category?: string | null;
          priority?: string;
          impact_score?: number | null;
          effort_score?: number | null;
          rationale?: string | null;
          action_payload?: Json;
          status?: string;
          created_at?: string;
        }
      >;
      recommendation_actions: TableDefinition<
        {
          id: string;
          organization_id: string;
          result_document_id: string | null;
          prompt_id: string | null;
          competitor_id: string | null;
          title: string;
          description: string | null;
          category: string;
          priority: string;
          impact_score: number | null;
          effort_score: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          organization_id: string;
          result_document_id?: string | null;
          prompt_id?: string | null;
          competitor_id?: string | null;
          title: string;
          description?: string | null;
          category: string;
          priority?: string;
          impact_score?: number | null;
          effort_score?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          result_document_id?: string | null;
          prompt_id?: string | null;
          competitor_id?: string | null;
          title?: string;
          description?: string | null;
          category?: string;
          priority?: string;
          impact_score?: number | null;
          effort_score?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      reports: TableDefinition<
        {
          id: string;
          organization_id: string;
          title: string;
          period_label: string | null;
          summary: string | null;
          report_state: string;
          generated_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          title: string;
          period_label?: string | null;
          summary?: string | null;
          report_state?: string;
          generated_at?: string | null;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          title?: string;
          period_label?: string | null;
          summary?: string | null;
          report_state?: string;
          generated_at?: string | null;
          created_at?: string;
        }
      >;
      report_items: TableDefinition<
        {
          id: string;
          report_id: string;
          result_document_id: string | null;
          recommendation_id: string | null;
          section_title: string;
          section_body: string;
          position: number;
          created_at: string;
        },
        {
          id?: string;
          report_id: string;
          result_document_id?: string | null;
          recommendation_id?: string | null;
          section_title: string;
          section_body: string;
          position?: number;
          created_at?: string;
        },
        {
          id?: string;
          report_id?: string;
          result_document_id?: string | null;
          recommendation_id?: string | null;
          section_title?: string;
          section_body?: string;
          position?: number;
          created_at?: string;
        }
      >;
      weekly_reports: TableDefinition<
        {
          id: string;
          organization_id: string;
          week_start_date: string;
          week_end_date: string;
          title: string;
          summary: string | null;
          report_state: string;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          week_start_date: string;
          week_end_date: string;
          title: string;
          summary?: string | null;
          report_state?: string;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          week_start_date?: string;
          week_end_date?: string;
          title?: string;
          summary?: string | null;
          report_state?: string;
          created_at?: string;
        }
      >;
      report_sections: TableDefinition<
        {
          id: string;
          weekly_report_id: string;
          section_type: string;
          section_title: string;
          section_body: string;
          position: number;
          created_at: string;
        },
        {
          id?: string;
          weekly_report_id: string;
          section_type: string;
          section_title: string;
          section_body: string;
          position?: number;
          created_at?: string;
        },
        {
          id?: string;
          weekly_report_id?: string;
          section_type?: string;
          section_title?: string;
          section_body?: string;
          position?: number;
          created_at?: string;
        }
      >;
      activity_logs: TableDefinition<
        {
          id: string;
          organization_id: string;
          actor_user_id: string | null;
          event_type: string;
          event_payload: Json;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          actor_user_id?: string | null;
          event_type: string;
          event_payload?: Json;
          created_at?: string;
        },
        {
          id?: string;
          organization_id?: string;
          actor_user_id?: string | null;
          event_type?: string;
          event_payload?: Json;
          created_at?: string;
        }
      >;
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

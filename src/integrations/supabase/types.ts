export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ideas: {
        Row: {
          appearances: number
          created_at: string
          elo_rating: number
          id: string
          image: string | null
          survey_id: string
          text: string
          wins: number
        }
        Insert: {
          appearances?: number
          created_at?: string
          elo_rating?: number
          id?: string
          image?: string | null
          survey_id: string
          text: string
          wins?: number
        }
        Update: {
          appearances?: number
          created_at?: string
          elo_rating?: number
          id?: string
          image?: string | null
          survey_id?: string
          text?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "ideas_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_ideas: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          image: string | null
          status: string
          submitted_by: string | null
          survey_id: string
          text: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          image?: string | null
          status?: string
          submitted_by?: string | null
          survey_id: string
          text: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          image?: string | null
          status?: string
          submitted_by?: string | null
          survey_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_ideas_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      polis_cluster_cache: {
        Row: {
          algorithm_version: string
          cache_id: string
          cache_key: string
          cluster_results: Json
          consensus_results: Json
          created_at: string | null
          expires_at: string
          opinion_space: Json | null
          participant_count: number
          poll_id: string
          updated_at: string | null
          vote_count: number
          vote_matrix: Json
        }
        Insert: {
          algorithm_version?: string
          cache_id?: string
          cache_key: string
          cluster_results: Json
          consensus_results: Json
          created_at?: string | null
          expires_at?: string
          opinion_space?: Json | null
          participant_count: number
          poll_id: string
          updated_at?: string | null
          vote_count: number
          vote_matrix: Json
        }
        Update: {
          algorithm_version?: string
          cache_id?: string
          cache_key?: string
          cluster_results?: Json
          consensus_results?: Json
          created_at?: string | null
          expires_at?: string
          opinion_space?: Json | null
          participant_count?: number
          poll_id?: string
          updated_at?: string | null
          vote_count?: number
          vote_matrix?: Json
        }
        Relationships: [
          {
            foreignKeyName: "polis_cluster_cache_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
        ]
      }
      polis_clustering_jobs: {
        Row: {
          algorithm_version: string
          completed_at: string | null
          consensus_points_found: number | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          groups_created: number | null
          job_id: string
          poll_id: string
          processing_time_ms: number | null
          started_at: string | null
          status: string
          total_participants: number
          total_votes: number
        }
        Insert: {
          algorithm_version?: string
          completed_at?: string | null
          consensus_points_found?: number | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          groups_created?: number | null
          job_id?: string
          poll_id: string
          processing_time_ms?: number | null
          started_at?: string | null
          status?: string
          total_participants?: number
          total_votes?: number
        }
        Update: {
          algorithm_version?: string
          completed_at?: string | null
          consensus_points_found?: number | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          groups_created?: number | null
          job_id?: string
          poll_id?: string
          processing_time_ms?: number | null
          started_at?: string | null
          status?: string
          total_participants?: number
          total_votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "polis_clustering_jobs_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
        ]
      }
      polis_clustering_metrics: {
        Row: {
          created_at: string | null
          job_id: string
          metadata: Json | null
          metric_id: string
          metric_name: string
          metric_value: number
          poll_id: string
        }
        Insert: {
          created_at?: string | null
          job_id: string
          metadata?: Json | null
          metric_id?: string
          metric_name: string
          metric_value: number
          poll_id: string
        }
        Update: {
          created_at?: string | null
          job_id?: string
          metadata?: Json | null
          metric_id?: string
          metric_name?: string
          metric_value?: number
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "polis_clustering_metrics_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "polis_clustering_jobs"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "polis_clustering_metrics_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
        ]
      }
      polis_clustering_queue: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          max_retries: number | null
          poll_id: string
          priority: number | null
          queue_id: string
          retry_count: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          max_retries?: number | null
          poll_id: string
          priority?: number | null
          queue_id?: string
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          max_retries?: number | null
          poll_id?: string
          priority?: number | null
          queue_id?: string
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      polis_consensus_points: {
        Row: {
          detected_at: string | null
          poll_id: string
          statement_id: string
        }
        Insert: {
          detected_at?: string | null
          poll_id: string
          statement_id: string
        }
        Update: {
          detected_at?: string | null
          poll_id?: string
          statement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "polis_consensus_points_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
          {
            foreignKeyName: "polis_consensus_points_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "polis_statements"
            referencedColumns: ["statement_id"]
          },
        ]
      }
      polis_group_statement_stats: {
        Row: {
          group_id: string
          oppose_pct: number | null
          poll_id: string | null
          statement_id: string
          support_pct: number | null
          total_votes: number | null
          unsure_pct: number | null
        }
        Insert: {
          group_id: string
          oppose_pct?: number | null
          poll_id?: string | null
          statement_id: string
          support_pct?: number | null
          total_votes?: number | null
          unsure_pct?: number | null
        }
        Update: {
          group_id?: string
          oppose_pct?: number | null
          poll_id?: string | null
          statement_id?: string
          support_pct?: number | null
          total_votes?: number | null
          unsure_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "polis_group_statement_stats_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "polis_groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "polis_group_statement_stats_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
          {
            foreignKeyName: "polis_group_statement_stats_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "polis_statements"
            referencedColumns: ["statement_id"]
          },
        ]
      }
      polis_groups: {
        Row: {
          algorithm: string | null
          cluster_center: Json | null
          color: string | null
          created_at: string | null
          description: string | null
          group_id: string
          member_count: number | null
          name: string | null
          opinion_space_coords: Json | null
          poll_id: string | null
          silhouette_score: number | null
          stability_score: number | null
        }
        Insert: {
          algorithm?: string | null
          cluster_center?: Json | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          group_id?: string
          member_count?: number | null
          name?: string | null
          opinion_space_coords?: Json | null
          poll_id?: string | null
          silhouette_score?: number | null
          stability_score?: number | null
        }
        Update: {
          algorithm?: string | null
          cluster_center?: Json | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          group_id?: string
          member_count?: number | null
          name?: string | null
          opinion_space_coords?: Json | null
          poll_id?: string | null
          silhouette_score?: number | null
          stability_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "polis_groups_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
        ]
      }
      polis_poll_categories: {
        Row: {
          category_id: string
          name: string
        }
        Insert: {
          category_id?: string
          name: string
        }
        Update: {
          category_id?: string
          name?: string
        }
        Relationships: []
      }
      polis_polls: {
        Row: {
          allow_user_statements: boolean | null
          auto_approve_statements: boolean | null
          category_id: string | null
          clustering_algorithm_config: Json | null
          clustering_batch_size: number | null
          clustering_cache_ttl_minutes: number | null
          clustering_max_groups: number | null
          clustering_min_groups: number | null
          clustering_min_participants: number | null
          clustering_status: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          last_clustered_at: string | null
          last_clustering_job_id: string | null
          max_opposition_pct: number | null
          min_consensus_points_to_win: number | null
          min_support_pct: number | null
          min_votes_per_group: number | null
          poll_id: string
          slug: string | null
          status: Database["public"]["Enums"]["polis_poll_status"] | null
          title: string
          topic: string | null
        }
        Insert: {
          allow_user_statements?: boolean | null
          auto_approve_statements?: boolean | null
          category_id?: string | null
          clustering_algorithm_config?: Json | null
          clustering_batch_size?: number | null
          clustering_cache_ttl_minutes?: number | null
          clustering_max_groups?: number | null
          clustering_min_groups?: number | null
          clustering_min_participants?: number | null
          clustering_status?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          last_clustered_at?: string | null
          last_clustering_job_id?: string | null
          max_opposition_pct?: number | null
          min_consensus_points_to_win?: number | null
          min_support_pct?: number | null
          min_votes_per_group?: number | null
          poll_id?: string
          slug?: string | null
          status?: Database["public"]["Enums"]["polis_poll_status"] | null
          title: string
          topic?: string | null
        }
        Update: {
          allow_user_statements?: boolean | null
          auto_approve_statements?: boolean | null
          category_id?: string | null
          clustering_algorithm_config?: Json | null
          clustering_batch_size?: number | null
          clustering_cache_ttl_minutes?: number | null
          clustering_max_groups?: number | null
          clustering_min_groups?: number | null
          clustering_min_participants?: number | null
          clustering_status?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          last_clustered_at?: string | null
          last_clustering_job_id?: string | null
          max_opposition_pct?: number | null
          min_consensus_points_to_win?: number | null
          min_support_pct?: number | null
          min_votes_per_group?: number | null
          poll_id?: string
          slug?: string | null
          status?: Database["public"]["Enums"]["polis_poll_status"] | null
          title?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polis_polls_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "polis_poll_categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "polis_polls_last_clustering_job_id_fkey"
            columns: ["last_clustering_job_id"]
            isOneToOne: false
            referencedRelation: "polis_clustering_jobs"
            referencedColumns: ["job_id"]
          },
        ]
      }
      polis_statements: {
        Row: {
          content: string
          content_type: Database["public"]["Enums"]["polis_content_type"] | null
          created_at: string | null
          created_by_user_id: string | null
          is_approved: boolean | null
          is_user_suggested: boolean | null
          poll_id: string | null
          statement_id: string
        }
        Insert: {
          content: string
          content_type?:
            | Database["public"]["Enums"]["polis_content_type"]
            | null
          created_at?: string | null
          created_by_user_id?: string | null
          is_approved?: boolean | null
          is_user_suggested?: boolean | null
          poll_id?: string | null
          statement_id?: string
        }
        Update: {
          content?: string
          content_type?:
            | Database["public"]["Enums"]["polis_content_type"]
            | null
          created_at?: string | null
          created_by_user_id?: string | null
          is_approved?: boolean | null
          is_user_suggested?: boolean | null
          poll_id?: string | null
          statement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "polis_statements_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
        ]
      }
      polis_system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      polis_user_group_membership: {
        Row: {
          group_id: string | null
          id: string
          poll_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          poll_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          poll_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polis_user_group_membership_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "polis_groups"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "polis_user_group_membership_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
        ]
      }
      polis_user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: []
      }
      polis_votes: {
        Row: {
          poll_id: string
          session_id: string | null
          statement_id: string | null
          user_id: string | null
          vote_id: string
          vote_value: Database["public"]["Enums"]["polis_vote_value"]
          voted_at: string | null
        }
        Insert: {
          poll_id: string
          session_id?: string | null
          statement_id?: string | null
          user_id?: string | null
          vote_id?: string
          vote_value: Database["public"]["Enums"]["polis_vote_value"]
          voted_at?: string | null
        }
        Update: {
          poll_id?: string
          session_id?: string | null
          statement_id?: string | null
          user_id?: string | null
          vote_id?: string
          vote_value?: Database["public"]["Enums"]["polis_vote_value"]
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_votes_poll_id"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polis_polls"
            referencedColumns: ["poll_id"]
          },
          {
            foreignKeyName: "polis_votes_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "polis_statements"
            referencedColumns: ["statement_id"]
          },
        ]
      }
      surveys: {
        Row: {
          allow_user_submissions: boolean
          attract_subtitle: string | null
          attract_title: string | null
          auto_approve_ideas: boolean
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          max_votes_per_session: number | null
          results_subtitle: string | null
          results_title: string | null
          slug: string
          start_date: string | null
          status: string
          title: string
          topic_subtitle: string | null
          topic_title: string | null
          updated_at: string
          voting_subtitle: string | null
          voting_title: string | null
        }
        Insert: {
          allow_user_submissions?: boolean
          attract_subtitle?: string | null
          attract_title?: string | null
          auto_approve_ideas?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_votes_per_session?: number | null
          results_subtitle?: string | null
          results_title?: string | null
          slug: string
          start_date?: string | null
          status?: string
          title: string
          topic_subtitle?: string | null
          topic_title?: string | null
          updated_at?: string
          voting_subtitle?: string | null
          voting_title?: string | null
        }
        Update: {
          allow_user_submissions?: boolean
          attract_subtitle?: string | null
          attract_title?: string | null
          auto_approve_ideas?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_votes_per_session?: number | null
          results_subtitle?: string | null
          results_title?: string | null
          slug?: string
          start_date?: string | null
          status?: string
          title?: string
          topic_subtitle?: string | null
          topic_title?: string | null
          updated_at?: string
          voting_subtitle?: string | null
          voting_title?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          idea1_id: string
          idea2_id: string
          selected_id: string
          session_id: string
          survey_id: string
          voting_session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          idea1_id: string
          idea2_id: string
          selected_id: string
          session_id: string
          survey_id: string
          voting_session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          idea1_id?: string
          idea2_id?: string
          selected_id?: string
          session_id?: string
          survey_id?: string
          voting_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_idea1_id_fkey"
            columns: ["idea1_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_idea2_id_fkey"
            columns: ["idea2_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_selected_id_fkey"
            columns: ["selected_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
          _assigned_by: string
        }
        Returns: Json
      }
      calculate_consensus_points: {
        Args: { poll_id_param: string; cluster_profiles_param: Json }
        Returns: undefined
      }
      cleanup_expired_cluster_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      current_user_has_role: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      ensure_unique_slug: {
        Args: { base_slug: string; exclude_poll_id?: string }
        Returns: string
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_all_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
          assigned_at: string
          last_sign_in_at: string
        }[]
      }
      get_category_poll_count: {
        Args: { category_id_param: string }
        Returns: number
      }
      get_global_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_participant_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_survey_participant_count: {
        Args: { p_survey_id: string }
        Returns: number
      }
      get_survey_settings: {
        Args: { p_survey_id: string }
        Returns: {
          allow_user_submissions: boolean
          auto_approve_ideas: boolean
          topic_title: string
          topic_subtitle: string
          attract_title: string
          attract_subtitle: string
          voting_title: string
          voting_subtitle: string
          results_title: string
          results_subtitle: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      polis_can_manage_poll: {
        Args: { _user_id: string; _poll_id: string }
        Returns: boolean
      }
      polis_get_user_management_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      record_vote_with_elo_update: {
        Args:
          | {
              p_idea1_id: string
              p_idea2_id: string
              p_selected_id: string
              p_session_id: string
              p_voting_session_id?: string
            }
          | {
              p_idea1_id: string
              p_idea2_id: string
              p_selected_id: string
              p_session_id: string
              p_voting_session_id?: string
              p_survey_id?: string
            }
        Returns: Json
      }
      remove_user_admin_role: {
        Args: { _user_id: string; _removed_by: string }
        Returns: Json
      }
      reset_poll_data: {
        Args: { poll_id_param: string }
        Returns: Json
      }
      trigger_clustering_and_consensus: {
        Args: { poll_id_param: string }
        Returns: undefined
      }
      update_survey_settings: {
        Args: {
          p_survey_id: string
          p_allow_user_submissions?: boolean
          p_auto_approve_ideas?: boolean
          p_topic_title?: string
          p_topic_subtitle?: string
          p_attract_title?: string
          p_attract_subtitle?: string
          p_voting_title?: string
          p_voting_subtitle?: string
          p_results_title?: string
          p_results_subtitle?: string
        }
        Returns: Json
      }
      user_has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      polis_content_type: "text" | "image" | "audio" | "video"
      polis_poll_status: "draft" | "active" | "closed"
      polis_vote_value: "support" | "oppose" | "unsure"
      user_role: "participant" | "poll_admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      polis_content_type: ["text", "image", "audio", "video"],
      polis_poll_status: ["draft", "active", "closed"],
      polis_vote_value: ["support", "oppose", "unsure"],
      user_role: ["participant", "poll_admin", "super_admin"],
    },
  },
} as const

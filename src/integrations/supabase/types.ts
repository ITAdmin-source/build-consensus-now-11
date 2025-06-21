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
      user_sessions: {
        Row: {
          created_at: string
          session_id: string
          started_voting: boolean
        }
        Insert: {
          created_at?: string
          session_id: string
          started_voting?: boolean
        }
        Update: {
          created_at?: string
          session_id?: string
          started_voting?: boolean
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
      calculate_consensus_points: {
        Args: { poll_id_param: string; cluster_profiles_param: Json }
        Returns: undefined
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
      polis_assign_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["polis_admin_role"]
          _assigned_by: string
        }
        Returns: Json
      }
      polis_can_manage_poll: {
        Args: { _user_id: string; _poll_id: string }
        Returns: boolean
      }
      polis_delete_admin_user: {
        Args: { _user_id: string }
        Returns: Json
      }
      polis_get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      polis_get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["polis_admin_role"]
          created_at: string
          assigned_at: string
        }[]
      }
      polis_has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["polis_admin_role"]
        }
        Returns: boolean
      }
      polis_remove_user_role: {
        Args: { _user_id: string }
        Returns: Json
      }
      polis_update_user_password: {
        Args: { _user_id: string; _new_password: string; _updated_by: string }
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
    }
    Enums: {
      polis_admin_role: "poll_admin" | "super_admin"
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
      polis_admin_role: ["poll_admin", "super_admin"],
    },
  },
} as const

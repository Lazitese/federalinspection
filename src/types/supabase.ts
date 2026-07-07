export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          access_level: string | null
          created_at: string
          email: string | null
          first_name: string | null
          groups: string[] | null
          id: string
          last_login: string | null
          last_name: string | null
          modules: string[] | null
          permissions: string[]
          phone: string | null
          requires_password_change: boolean | null
          role: Database["public"]["Enums"]["admin_role"]
          status: string | null
          updated_at: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          groups?: string[] | null
          id: string
          last_login?: string | null
          last_name?: string | null
          modules?: string[] | null
          permissions?: string[]
          phone?: string | null
          requires_password_change?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          status?: string | null
          updated_at?: string
        }
        Update: {
          access_level?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          groups?: string[] | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          modules?: string[] | null
          permissions?: string[]
          phone?: string | null
          requires_password_change?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      approver_evaluations: {
        Row: {
          approver_id: string
          created_at: string
          id: string
          is_locked: boolean
          period_id: string
          score_70: number
          target_user_id: string
        }
        Insert: {
          approver_id: string
          created_at?: string
          id?: string
          is_locked?: boolean
          period_id: string
          score_70?: number
          target_user_id: string
        }
        Update: {
          approver_id?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          period_id?: string
          score_70?: number
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approver_evaluations_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approver_evaluations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "assessment_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approver_evaluations_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_periods: {
        Row: {
          created_at: string
          id: string
          name: string
          period_half: string
          status: Database["public"]["Enums"]["assessment_period_status"]
          year: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          period_half: string
          status?: Database["public"]["Enums"]["assessment_period_status"]
          year: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          period_half?: string
          status?: Database["public"]["Enums"]["assessment_period_status"]
          year?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          address: string | null
          age: number | null
          attachments: Json | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          institution: string | null
          member_count: number | null
          message: string
          name: string
          phone: string
          processed_at: string | null
          processed_by: string | null
          requested_resolution: string | null
          resolution: Json | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
          submission_mode: string | null
          tracking_code: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          attachments?: Json | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          institution?: string | null
          member_count?: number | null
          message: string
          name: string
          phone: string
          processed_at?: string | null
          processed_by?: string | null
          requested_resolution?: string | null
          resolution?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          submission_mode?: string | null
          tracking_code?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          attachments?: Json | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          institution?: string | null
          member_count?: number | null
          message?: string
          name?: string
          phone?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_resolution?: string | null
          resolution?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          submission_mode?: string | null
          tracking_code?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      document_access_logs: {
        Row: {
          accessed_by: string
          action: string
          created_at: string | null
          document_id: string
          id: string
        }
        Insert: {
          accessed_by: string
          action: string
          created_at?: string | null
          document_id: string
          id?: string
        }
        Update: {
          accessed_by?: string
          action?: string
          created_at?: string | null
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string | null
          files: Json | null
          folder_id: string | null
          id: string
          main_category: string | null
          office: string | null
          storage_path: string | null
          sub_category: string | null
          title: string
          upload_date: string | null
          uploaded_by: string
          version: string | null
          visibility: string | null
          year: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          files?: Json | null
          folder_id?: string | null
          id?: string
          main_category?: string | null
          office?: string | null
          storage_path?: string | null
          sub_category?: string | null
          title: string
          upload_date?: string | null
          uploaded_by: string
          version?: string | null
          visibility?: string | null
          year?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          files?: Json | null
          folder_id?: string | null
          id?: string
          main_category?: string | null
          office?: string | null
          storage_path?: string | null
          sub_category?: string | null
          title?: string
          upload_date?: string | null
          uploaded_by?: string
          version?: string | null
          visibility?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          created_at: string
          evaluator_id: string
          id: string
          is_locked: boolean
          period_id: string
          responses: Json | null
          score_20: number
          target_user_id: string
        }
        Insert: {
          created_at?: string
          evaluator_id: string
          id?: string
          is_locked?: boolean
          period_id: string
          responses?: Json | null
          score_20?: number
          target_user_id: string
        }
        Update: {
          created_at?: string
          evaluator_id?: string
          id?: string
          is_locked?: boolean
          period_id?: string
          responses?: Json | null
          score_20?: number
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "assessment_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          category: string | null
          created_at: string
          id: string
          rating: string
          review: string
          sentiment: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          rating: string
          review: string
          sentiment: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          rating?: string
          review?: string
          sentiment?: string
        }
        Relationships: []
      }
      final_scores: {
        Row: {
          created_at: string
          final_score_100: number
          score_30: number
          id: string
          period_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          final_score_100?: number
          score_30?: number
          id?: string
          period_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          final_score_100?: number
          score_30?: number
          id?: string
          period_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "final_scores_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "assessment_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author: string
          category: string | null
          content: string | null
          created: string | null
          description: string | null
          excerpt: string | null
          id: string
          image: string | null
          images: string[] | null
          lang: string
          published: string | null
          status: string
          title: string
          video_url: string | null
        }
        Insert: {
          author: string
          category?: string | null
          content?: string | null
          created?: string | null
          description?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          lang?: string
          published?: string | null
          status?: string
          title: string
          video_url?: string | null
        }
        Update: {
          author?: string
          category?: string | null
          content?: string | null
          created?: string | null
          description?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          lang?: string
          published?: string | null
          status?: string
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          country: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          path: string | null
          referrer: string | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          path?: string | null
          referrer?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          path?: string | null
          referrer?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      period_members: {
        Row: {
          created_at: string
          id: string
          period_id: string
          role: Database["public"]["Enums"]["assessment_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_id: string
          role?: Database["public"]["Enums"]["assessment_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period_id?: string
          role?: Database["public"]["Enums"]["assessment_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "period_members_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "assessment_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      personnel: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          message: string | null
          name: string
          name_am: string | null
          office_category: string
          office_category_am: string
          phone: string | null
          photo: string | null
          position: string
          position_am: string
          region: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name: string
          name_am?: string | null
          office_category: string
          office_category_am: string
          phone?: string | null
          photo?: string | null
          position: string
          position_am: string
          region?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          name_am?: string | null
          office_category?: string
          office_category_am?: string
          phone?: string | null
          photo?: string | null
          position?: string
          position_am?: string
          region?: string | null
          status?: string | null
        }
        Relationships: []
      }
      public_files: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_size: string | null
          file_type: string | null
          file_url: string
          id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          file_name: string
          file_size?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_size?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          active: boolean | null
          created_at: string | null
          duration: string
          expires_at: string
          id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          duration: string
          expires_at: string
          id?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          duration?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          count: number
          id: string
          ip_address: string
          last_request_at: string
        }
        Insert: {
          action_type: string
          count?: number
          id?: string
          ip_address: string
          last_request_at?: string
        }
        Update: {
          action_type?: string
          count?: number
          id?: string
          ip_address?: string
          last_request_at?: string
        }
        Relationships: []
      }
      report_feedbacks: {
        Row: {
          created_at: string
          description: string
          feedback_level: string
          file_url: string | null
          id: string
          report_id: string
          reviewer_id: string
        }
        Insert: {
          created_at?: string
          description: string
          feedback_level: string
          file_url?: string | null
          id?: string
          report_id: string
          reviewer_id: string
        }
        Update: {
          created_at?: string
          description?: string
          feedback_level?: string
          file_url?: string | null
          id?: string
          report_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_feedbacks_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reporting_profiles: {
        Row: {
          created_at: string
          hierarchy_level: string
          region_name: string | null
          subcity_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hierarchy_level: string
          region_name?: string | null
          subcity_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hierarchy_level?: string
          region_name?: string | null
          subcity_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          budget_year: string
          created_at: string
          file_url: string | null
          id: string
          numerical_data: Json | null
          period_category: string
          region_name: string | null
          report_type: string
          status: string
          subcity_name: string | null
          submitter_id: string
          submitter_level: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_year: string
          created_at?: string
          file_url?: string | null
          id?: string
          numerical_data?: Json | null
          period_category: string
          region_name?: string | null
          report_type: string
          status?: string
          subcity_name?: string | null
          submitter_id: string
          submitter_level: string
          title: string
          updated_at?: string
        }
        Update: {
          budget_year?: string
          created_at?: string
          file_url?: string | null
          id?: string
          numerical_data?: Json | null
          period_category?: string
          region_name?: string | null
          report_type?: string
          status?: string
          subcity_name?: string | null
          submitter_id?: string
          submitter_level?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      scan_requests: {
        Row: {
          approver_name: string | null
          created_at: string | null
          duration_granted: string | null
          file_name: string
          id: string
          ip_address: string | null
          requester_device: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          approver_name?: string | null
          created_at?: string | null
          duration_granted?: string | null
          file_name: string
          id?: string
          ip_address?: string | null
          requester_device: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          approver_name?: string | null
          created_at?: string | null
          duration_granted?: string | null
          file_name?: string
          id?: string
          ip_address?: string | null
          requester_device?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      self_assessments: {
        Row: {
          created_at: string
          id: string
          is_locked: boolean
          period_id: string
          responses: Json
          score_10: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_locked?: boolean
          period_id: string
          responses?: Json
          score_10?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_locked?: boolean
          period_id?: string
          responses?: Json
          score_10?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_assessments_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "assessment_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "self_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string
          current_responsibility_com: string | null
          current_responsibility_gov: string | null
          education_level: string | null
          experience_leadership: number | null
          experience_professional: number | null
          gender: string | null
          institution: string | null
          photo_url: string | null
          professional_field: string | null
          system_role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          current_responsibility_com?: string | null
          current_responsibility_gov?: string | null
          education_level?: string | null
          experience_leadership?: number | null
          experience_professional?: number | null
          gender?: string | null
          institution?: string | null
          photo_url?: string | null
          professional_field?: string | null
          system_role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          current_responsibility_com?: string | null
          current_responsibility_gov?: string | null
          education_level?: string | null
          experience_leadership?: number | null
          experience_professional?: number | null
          gender?: string | null
          institution?: string | null
          photo_url?: string | null
          professional_field?: string | null
          system_role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone_number: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone_number: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finalize_period_scores: {
        Args: { p_period_id: string }
        Returns: boolean
      }
      finalize_team_scores: { Args: { p_team_id: string }; Returns: boolean }
      get_analytics_summary: {
        Args: { end_date: string; start_date: string }
        Returns: Json
      }
      get_period_role: {
        Args: { p_period_id: string; p_user_id: string }
        Returns: Database["public"]["Enums"]["assessment_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_assessment_admin: { Args: never; Returns: boolean }
      is_period_member: { Args: { p_period_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_team_member: { Args: { p_team_id: string }; Returns: boolean }
      join_period_via_qr: {
        Args: { p_full_name: string; p_period_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin"
      assessment_period_status: "active" | "finalized"
      assessment_role: "admin" | "approver" | "evaluator" | "regular"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      admin_role: ["super_admin", "admin"],
      assessment_period_status: ["active", "finalized"],
      assessment_role: ["admin", "approver", "evaluator", "regular"],
    },
  },
} as const


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      broadcasts: {
        Row: {
          chairman_id: string
          id: string
          is_template: boolean
          message_text: string
          recipient_count: number
          sent_at: string
          stage_id: string
          template_key: string | null
        }
        Insert: {
          chairman_id: string
          id?: string
          is_template?: boolean
          message_text: string
          recipient_count?: number
          sent_at?: string
          stage_id: string
          template_key?: string | null
        }
        Update: {
          chairman_id?: string
          id?: string
          is_template?: boolean
          message_text?: string
          recipient_count?: number
          sent_at?: string
          stage_id?: string
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          current_lat: number | null
          current_lng: number | null
          helmet_verified: boolean
          is_online: boolean
          last_location_update: string | null
          logbook_url: string | null
          national_id_back_url: string | null
          national_id_front_url: string | null
          plate_url: string | null
          psv_url: string | null
          rating_average: number
          rejection_reason: string | null
          selfie_url: string | null
          stage_id: string | null
          stage_name: string | null
          status: Database["public"]["Enums"]["driver_status"]
          submitted_at: string
          total_earnings: number
          total_rides: number
          user_id: string
          verified_at: string | null
        }
        Insert: {
          current_lat?: number | null
          current_lng?: number | null
          helmet_verified?: boolean
          is_online?: boolean
          last_location_update?: string | null
          logbook_url?: string | null
          national_id_back_url?: string | null
          national_id_front_url?: string | null
          plate_url?: string | null
          psv_url?: string | null
          rating_average?: number
          rejection_reason?: string | null
          selfie_url?: string | null
          stage_id?: string | null
          stage_name?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          submitted_at?: string
          total_earnings?: number
          total_rides?: number
          user_id: string
          verified_at?: string | null
        }
        Update: {
          current_lat?: number | null
          current_lng?: number | null
          helmet_verified?: boolean
          is_online?: boolean
          last_location_update?: string | null
          logbook_url?: string | null
          national_id_back_url?: string | null
          national_id_front_url?: string | null
          plate_url?: string | null
          psv_url?: string | null
          rating_average?: number
          rejection_reason?: string | null
          selfie_url?: string | null
          stage_id?: string | null
          stage_name?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          submitted_at?: string
          total_earnings?: number
          total_rides?: number
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          driver_id: string
          gross_amount: number
          id: string
          mpesa_transaction_id: string | null
          net_amount: number
          paid_at: string
          period_day: string
          period_month: string
          period_week: string
          platform_fee_amount: number
          ride_id: string
        }
        Insert: {
          driver_id: string
          gross_amount: number
          id?: string
          mpesa_transaction_id?: string | null
          net_amount: number
          paid_at?: string
          period_day: string
          period_month: string
          period_week: string
          platform_fee_amount: number
          ride_id: string
        }
        Update: {
          driver_id?: string
          gross_amount?: number
          id?: string
          mpesa_transaction_id?: string | null
          net_amount?: number
          paid_at?: string
          period_day?: string
          period_month?: string
          period_week?: string
          platform_fee_amount?: number
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      panic_events: {
        Row: {
          audio_url: string | null
          customer_id: string
          driver_id: string | null
          id: string
          lat: number | null
          lng: number | null
          photo_url: string | null
          resolved_at: string | null
          resolved_by: string | null
          ride_id: string | null
          status: Database["public"]["Enums"]["panic_status"]
          triggered_at: string
        }
        Insert: {
          audio_url?: string | null
          customer_id: string
          driver_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          photo_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: Database["public"]["Enums"]["panic_status"]
          triggered_at?: string
        }
        Update: {
          audio_url?: string | null
          customer_id?: string
          driver_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          photo_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: Database["public"]["Enums"]["panic_status"]
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panic_events_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          emergency_contacts: string[]
          id: string
          language_preference: Database["public"]["Enums"]["language_pref"]
          last_seen: string
          low_data_mode: boolean
          name: string | null
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          emergency_contacts?: string[]
          id: string
          language_preference?: Database["public"]["Enums"]["language_pref"]
          last_seen?: string
          low_data_mode?: boolean
          name?: string | null
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          emergency_contacts?: string[]
          id?: string
          language_preference?: Database["public"]["Enums"]["language_pref"]
          last_seen?: string
          low_data_mode?: boolean
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rated_by: string
          rated_user_id: string
          rater_id: string
          ride_id: string
          stars: number
          tags: string[]
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rated_by: string
          rated_user_id: string
          rater_id: string
          ride_id: string
          stars: number
          tags?: string[]
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rated_by?: string
          rated_user_id?: string
          rater_id?: string
          ride_id?: string
          stars?: number
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          accepted_at: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          customer_id: string
          driver_id: string | null
          driver_payout: number | null
          dropoff_address: string | null
          dropoff_lat: number | null
          dropoff_lng: number | null
          fare_estimate: number | null
          fare_final: number | null
          id: string
          mpesa_transaction_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          platform_fee: number | null
          requested_at: string
          stage_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["ride_status"]
        }
        Insert: {
          accepted_at?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          customer_id: string
          driver_id?: string | null
          driver_payout?: number | null
          dropoff_address?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          fare_estimate?: number | null
          fare_final?: number | null
          id?: string
          mpesa_transaction_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          platform_fee?: number | null
          requested_at?: string
          stage_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"]
        }
        Update: {
          accepted_at?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          customer_id?: string
          driver_id?: string | null
          driver_payout?: number | null
          dropoff_address?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          fare_estimate?: number | null
          fare_final?: number | null
          id?: string
          mpesa_transaction_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          platform_fee?: number | null
          requested_at?: string
          stage_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rides_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          chairman_id: string | null
          created_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          stage_name: string
          status: Database["public"]["Enums"]["stage_status"]
          total_drivers: number
        }
        Insert: {
          chairman_id?: string | null
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          stage_name: string
          status?: Database["public"]["Enums"]["stage_status"]
          total_drivers?: number
        }
        Update: {
          chairman_id?: string | null
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          stage_name?: string
          status?: Database["public"]["Enums"]["stage_status"]
          total_drivers?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "driver" | "chairman" | "admin"
      driver_status: "pending" | "verified" | "suspended" | "rejected"
      language_pref: "en" | "sw"
      panic_status: "active" | "resolved"
      payment_method: "mpesa" | "cash"
      payment_status: "pending" | "paid"
      ride_status:
        | "requested"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      stage_status: "pending" | "active" | "inactive"
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
  public: {
    Enums: {
      app_role: ["customer", "driver", "chairman", "admin"],
      driver_status: ["pending", "verified", "suspended", "rejected"],
      language_pref: ["en", "sw"],
      panic_status: ["active", "resolved"],
      payment_method: ["mpesa", "cash"],
      payment_status: ["pending", "paid"],
      ride_status: [
        "requested",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      stage_status: ["pending", "active", "inactive"],
    },
  },
} as const

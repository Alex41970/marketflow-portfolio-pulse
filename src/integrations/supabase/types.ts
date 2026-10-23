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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          amount: number | null
          created_at: string
          id: string
          reason: string
          target_user_id: string
        }
        Insert: {
          action: string
          admin_id: string
          amount?: number | null
          created_at?: string
          id?: string
          reason: string
          target_user_id: string
        }
        Update: {
          action?: string
          admin_id?: string
          amount?: number | null
          created_at?: string
          id?: string
          reason?: string
          target_user_id?: string
        }
        Relationships: []
      }
      funding_requests: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          decided_at: string | null
          decided_by: string | null
          details: Json
          id: string
          kind: string
          method: string
          network: string | null
          reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          details?: Json
          id?: string
          kind: string
          method: string
          network?: string | null
          reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          details?: Json
          id?: string
          kind?: string
          method?: string
          network?: string | null
          reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          avg_cost: number
          id: string
          quantity: number
          symbol: string
          user_id: string
        }
        Insert: {
          avg_cost?: number
          id?: string
          quantity?: number
          symbol: string
          user_id: string
        }
        Update: {
          avg_cost?: number
          id?: string
          quantity?: number
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          filled_at: string | null
          id: string
          limit_price: number | null
          order_type: string
          quantity: number
          side: string
          status: string
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filled_at?: string | null
          id?: string
          limit_price?: number | null
          order_type?: string
          quantity: number
          side: string
          status?: string
          symbol: string
          user_id: string
        }
        Update: {
          created_at?: string
          filled_at?: string | null
          id?: string
          limit_price?: number | null
          order_type?: string
          quantity?: number
          side?: string
          status?: string
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean
          created_at: string
          details: Json
          id: string
          kind: string
          label: string
          network: string | null
          sort: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          details?: Json
          id?: string
          kind: string
          label: string
          network?: string | null
          sort?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          details?: Json
          id?: string
          kind?: string
          label?: string
          network?: string | null
          sort?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          bonus: number
          created_at: string
          disclaimer_accepted_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          last_seen_at: string | null
          must_change_password: boolean
          phone: string | null
          terms_accepted_at: string | null
          username: string
          virtual_balance: number
        }
        Insert: {
          account_type?: string
          bonus?: number
          created_at?: string
          disclaimer_accepted_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          last_seen_at?: string | null
          must_change_password?: boolean
          phone?: string | null
          terms_accepted_at?: string | null
          username: string
          virtual_balance?: number
        }
        Update: {
          account_type?: string
          bonus?: number
          created_at?: string
          disclaimer_accepted_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_seen_at?: string | null
          must_change_password?: boolean
          phone?: string | null
          terms_accepted_at?: string | null
          username?: string
          virtual_balance?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          awards: Json
          awards_enabled: boolean
          awards_heading: string
          brand_mark: string
          brand_name: string
          brand_suffix: string
          copyright: string
          footer_text: string
          id: number
          tagline: string
          updated_at: string
        }
        Insert: {
          awards?: Json
          awards_enabled?: boolean
          awards_heading?: string
          brand_mark?: string
          brand_name?: string
          brand_suffix?: string
          copyright?: string
          footer_text?: string
          id?: number
          tagline?: string
          updated_at?: string
        }
        Update: {
          awards?: Json
          awards_enabled?: boolean
          awards_heading?: string
          brand_mark?: string
          brand_name?: string
          brand_suffix?: string
          copyright?: string
          footer_text?: string
          id?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          note: string | null
          price: number | null
          quantity: number | null
          symbol: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind: string
          note?: string | null
          price?: number | null
          quantity?: number | null
          symbol?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          note?: string | null
          price?: number | null
          quantity?: number | null
          symbol?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      accept_disclaimer: { Args: never; Returns: undefined }
      admin_adjust: {
        Args: {
          _delta: number
          _field: string
          _reason: string
          _target: string
        }
        Returns: undefined
      }
      clear_password_flag: { Args: never; Returns: undefined }
      create_funding_request: {
        Args: {
          _amount: number
          _details: Json
          _kind: string
          _method: string
          _network: string
          _reference: string
        }
        Returns: string
      }
      decide_funding_request: {
        Args: { _approve: boolean; _id: string; _note: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_trade: {
        Args: { _price: number; _qty: number; _side: string; _symbol: string }
        Returns: undefined
      }
      touch_seen: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_assessments: {
        Row: {
          animal_id: string | null;
          concern: string | null;
          created_at: string;
          hr: number | null;
          id: string;
          observations: string | null;
          recommendation: string | null;
          risk_level: string | null;
          species: string | null;
          spo2: number | null;
          status: string | null;
          symptoms: string | null;
          temperature: number | null;
          user_id: string;
        };
        Insert: {
          animal_id?: string | null;
          concern?: string | null;
          created_at?: string;
          hr?: number | null;
          id?: string;
          observations?: string | null;
          recommendation?: string | null;
          risk_level?: string | null;
          species?: string | null;
          spo2?: number | null;
          status?: string | null;
          symptoms?: string | null;
          temperature?: number | null;
          user_id?: string;
        };
        Update: {
          animal_id?: string | null;
          concern?: string | null;
          created_at?: string;
          hr?: number | null;
          id?: string;
          observations?: string | null;
          recommendation?: string | null;
          risk_level?: string | null;
          species?: string | null;
          spo2?: number | null;
          status?: string | null;
          symptoms?: string | null;
          temperature?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_assessments_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animals";
            referencedColumns: ["id"];
          },
        ];
      };
      alerts: {
        Row: {
          animal_id: string | null;
          category: string;
          created_at: string;
          expected_range: string | null;
          id: string;
          message: string;
          parameter: string | null;
          recommendation: string | null;
          severity: string;
          state: string;
          updated_at: string;
          user_id: string;
          value: number | null;
        };
        Insert: {
          animal_id?: string | null;
          category?: string;
          created_at?: string;
          expected_range?: string | null;
          id?: string;
          message: string;
          parameter?: string | null;
          recommendation?: string | null;
          severity?: string;
          state?: string;
          updated_at?: string;
          user_id?: string;
          value?: number | null;
        };
        Update: {
          animal_id?: string | null;
          category?: string;
          created_at?: string;
          expected_range?: string | null;
          id?: string;
          message?: string;
          parameter?: string | null;
          recommendation?: string | null;
          severity?: string;
          state?: string;
          updated_at?: string;
          user_id?: string;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animals";
            referencedColumns: ["id"];
          },
        ];
      };
      animals: {
        Row: {
          age_months: number | null;
          breed: string | null;
          created_at: string;
          gender: string | null;
          id: string;
          name: string;
          notes: string | null;
          owner_name: string | null;
          photo_url: string | null;
          species: string;
          tag_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age_months?: number | null;
          breed?: string | null;
          created_at?: string;
          gender?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          owner_name?: string | null;
          photo_url?: string | null;
          species?: string;
          tag_id: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          age_months?: number | null;
          breed?: string | null;
          created_at?: string;
          gender?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          owner_name?: string | null;
          photo_url?: string | null;
          species?: string;
          tag_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      disease_reports: {
        Row: {
          affected_count: number;
          animal_id: string | null;
          block_taluk: string | null;
          created_at: string;
          death_count: number;
          district: string | null;
          id: string;
          notes: string | null;
          observed_on: string;
          photo_url: string | null;
          species: string | null;
          state: string | null;
          status: string;
          suspected_issue: string | null;
          symptoms: string | null;
          updated_at: string;
          user_id: string;
          village: string | null;
        };
        Insert: {
          affected_count?: number;
          animal_id?: string | null;
          block_taluk?: string | null;
          created_at?: string;
          death_count?: number;
          district?: string | null;
          id?: string;
          notes?: string | null;
          observed_on?: string;
          photo_url?: string | null;
          species?: string | null;
          state?: string | null;
          status?: string;
          suspected_issue?: string | null;
          symptoms?: string | null;
          updated_at?: string;
          user_id?: string;
          village?: string | null;
        };
        Update: {
          affected_count?: number;
          animal_id?: string | null;
          block_taluk?: string | null;
          created_at?: string;
          death_count?: number;
          district?: string | null;
          id?: string;
          notes?: string | null;
          observed_on?: string;
          photo_url?: string | null;
          species?: string | null;
          state?: string | null;
          status?: string;
          suspected_issue?: string | null;
          symptoms?: string | null;
          updated_at?: string;
          user_id?: string;
          village?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "disease_reports_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animals";
            referencedColumns: ["id"];
          },
        ];
      };
      health_readings: {
        Row: {
          animal_id: string | null;
          created_at: string;
          hr: number | null;
          id: string;
          recorded_at: string;
          spo2: number | null;
          status: string;
          temperature: number | null;
          user_id: string;
        };
        Insert: {
          animal_id?: string | null;
          created_at?: string;
          hr?: number | null;
          id?: string;
          recorded_at?: string;
          spo2?: number | null;
          status?: string;
          temperature?: number | null;
          user_id?: string;
        };
        Update: {
          animal_id?: string | null;
          created_at?: string;
          hr?: number | null;
          id?: string;
          recorded_at?: string;
          spo2?: number | null;
          status?: string;
          temperature?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "health_readings_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animals";
            referencedColumns: ["id"];
          },
        ];
      };
      treatments: {
        Row: {
          animal_id: string | null;
          created_at: string;
          follow_up_on: string | null;
          id: string;
          issue: string | null;
          medicine: string | null;
          notes: string | null;
          recovery_status: string;
          treated_on: string;
          treatment: string | null;
          updated_at: string;
          user_id: string;
          vet_name: string | null;
        };
        Insert: {
          animal_id?: string | null;
          created_at?: string;
          follow_up_on?: string | null;
          id?: string;
          issue?: string | null;
          medicine?: string | null;
          notes?: string | null;
          recovery_status?: string;
          treated_on?: string;
          treatment?: string | null;
          updated_at?: string;
          user_id?: string;
          vet_name?: string | null;
        };
        Update: {
          animal_id?: string | null;
          created_at?: string;
          follow_up_on?: string | null;
          id?: string;
          issue?: string | null;
          medicine?: string | null;
          notes?: string | null;
          recovery_status?: string;
          treated_on?: string;
          treatment?: string | null;
          updated_at?: string;
          user_id?: string;
          vet_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "treatments_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animals";
            referencedColumns: ["id"];
          },
        ];
      };
      vaccinations: {
        Row: {
          administered_by: string | null;
          administered_on: string | null;
          animal_id: string | null;
          created_at: string;
          id: string;
          next_due_on: string | null;
          notes: string | null;
          updated_at: string;
          user_id: string;
          vaccine_name: string;
        };
        Insert: {
          administered_by?: string | null;
          administered_on?: string | null;
          animal_id?: string | null;
          created_at?: string;
          id?: string;
          next_due_on?: string | null;
          notes?: string | null;
          updated_at?: string;
          user_id?: string;
          vaccine_name: string;
        };
        Update: {
          administered_by?: string | null;
          administered_on?: string | null;
          animal_id?: string | null;
          created_at?: string;
          id?: string;
          next_due_on?: string | null;
          notes?: string | null;
          updated_at?: string;
          user_id?: string;
          vaccine_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vaccinations_animal_id_fkey";
            columns: ["animal_id"];
            isOneToOne: false;
            referencedRelation: "animals";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

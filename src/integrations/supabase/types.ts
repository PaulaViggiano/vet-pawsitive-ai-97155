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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          google_calendar_event_id: string | null
          id: string
          modalidad: string
          notes: string | null
          owner_id: string | null
          patient_id: string | null
          start_time: string
          status: string
          title: string
          type: string | null
          updated_at: string
          user_id: string
          veterinarian: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          google_calendar_event_id?: string | null
          id?: string
          modalidad?: string
          notes?: string | null
          owner_id?: string | null
          patient_id?: string | null
          start_time: string
          status?: string
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
          veterinarian?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          google_calendar_event_id?: string | null
          id?: string
          modalidad?: string
          notes?: string | null
          owner_id?: string | null
          patient_id?: string | null
          start_time?: string
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
          veterinarian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "mascotas"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_contacts: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bot_state: {
        Row: {
          client_name: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          last_human_message_at: string | null
          mode: string | null
          phone: string
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          client_name?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          last_human_message_at?: string | null
          mode?: string | null
          phone: string
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          last_human_message_at?: string | null
          mode?: string | null
          phone?: string
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          calendar_id: string | null
          created_at: string
          id: string
          refresh_token: string
          token_expiry: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          created_at?: string
          id?: string
          refresh_token: string
          token_expiry: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          created_at?: string
          id?: string
          refresh_token?: string
          token_expiry?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_public: boolean
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_public?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mascota_duenos: {
        Row: {
          created_at: string
          es_principal: boolean
          mascota_id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          es_principal?: boolean
          mascota_id: string
          owner_id: string
        }
        Update: {
          created_at?: string
          es_principal?: boolean
          mascota_id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mascota_duenos_mascota_id_fkey"
            columns: ["mascota_id"]
            isOneToOne: false
            referencedRelation: "mascotas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mascota_duenos_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      mascotas: {
        Row: {
          alergias: string[] | null
          color: string | null
          condiciones_cronicas: string[] | null
          created_at: string
          especie: string
          estado: string
          fecha_nacimiento: string | null
          foto_url: string | null
          genero: string | null
          id: string
          microchip: string | null
          nombre: string
          notas: string | null
          raza: string | null
          updated_at: string
        }
        Insert: {
          alergias?: string[] | null
          color?: string | null
          condiciones_cronicas?: string[] | null
          created_at?: string
          especie: string
          estado?: string
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          microchip?: string | null
          nombre: string
          notas?: string | null
          raza?: string | null
          updated_at?: string
        }
        Update: {
          alergias?: string[] | null
          color?: string | null
          condiciones_cronicas?: string[] | null
          created_at?: string
          especie?: string
          estado?: string
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          microchip?: string | null
          nombre?: string
          notas?: string | null
          raza?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          attachments: string[] | null
          created_at: string
          date: string
          diagnosis: string
          heart_rate: number | null
          id: string
          medications: string[] | null
          next_appointment: string | null
          notes: string | null
          patient_id: string
          priority: string
          respiratory_rate: number | null
          status: string
          symptoms: string | null
          temperature: number | null
          treatment: string | null
          type: string
          updated_at: string
          veterinarian: string
          weight: number | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          date?: string
          diagnosis: string
          heart_rate?: number | null
          id?: string
          medications?: string[] | null
          next_appointment?: string | null
          notes?: string | null
          patient_id: string
          priority?: string
          respiratory_rate?: number | null
          status?: string
          symptoms?: string | null
          temperature?: number | null
          treatment?: string | null
          type: string
          updated_at?: string
          veterinarian: string
          weight?: number | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          date?: string
          diagnosis?: string
          heart_rate?: number | null
          id?: string
          medications?: string[] | null
          next_appointment?: string | null
          notes?: string | null
          patient_id?: string
          priority?: string
          respiratory_rate?: number | null
          status?: string
          symptoms?: string | null
          temperature?: number | null
          treatment?: string | null
          type?: string
          updated_at?: string
          veterinarian?: string
          weight?: number | null
        }
        Relationships: []
      }
      owners: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          relationship: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          relationship?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clinic_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          clinic_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          clinic_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      normalize_phone: { Args: { phone_input: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

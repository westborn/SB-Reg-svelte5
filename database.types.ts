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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      artist: {
        Row: {
          bank_account: string | null
          bank_account_name: string | null
          bank_bsb: string | null
          created_at: string
          email: string
          first_name: string
          first_nations: Database["public"]["Enums"]["indigenous"]
          id: number
          last_name: string
          phone: string
          postcode: string
          updated_at: string
        }
        Insert: {
          bank_account?: string | null
          bank_account_name?: string | null
          bank_bsb?: string | null
          created_at?: string
          email: string
          first_name: string
          first_nations?: Database["public"]["Enums"]["indigenous"]
          id?: number
          last_name: string
          phone: string
          postcode: string
          updated_at: string
        }
        Update: {
          bank_account?: string | null
          bank_account_name?: string | null
          bank_bsb?: string | null
          created_at?: string
          email?: string
          first_name?: string
          first_nations?: Database["public"]["Enums"]["indigenous"]
          id?: number
          last_name?: string
          phone?: string
          postcode?: string
          updated_at?: string
        }
        Relationships: []
      }
      entry: {
        Row: {
          accepted: boolean
          artist_id: number
          created_at: string
          description: string | null
          dimensions: string | null
          enter_major_prize: boolean
          id: number
          in_or_out: Database["public"]["Enums"]["entry_type"]
          material: string | null
          price_in_cents: number
          registration_id: number
          special_requirements: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accepted?: boolean
          artist_id: number
          created_at?: string
          description?: string | null
          dimensions?: string | null
          enter_major_prize?: boolean
          id?: number
          in_or_out: Database["public"]["Enums"]["entry_type"]
          material?: string | null
          price_in_cents: number
          registration_id: number
          special_requirements?: string | null
          title: string
          updated_at: string
        }
        Update: {
          accepted?: boolean
          artist_id?: number
          created_at?: string
          description?: string | null
          dimensions?: string | null
          enter_major_prize?: boolean
          id?: number
          in_or_out?: Database["public"]["Enums"]["entry_type"]
          material?: string | null
          price_in_cents?: number
          registration_id?: number
          special_requirements?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registration"
            referencedColumns: ["id"]
          },
        ]
      }
      image: {
        Row: {
          artist_id: number
          cloud_id: string
          cloud_url: string
          created_at: string
          entry_id: number | null
          id: number
          original_file_name: string
          registration_id: number | null
          updated_at: string
        }
        Insert: {
          artist_id: number
          cloud_id: string
          cloud_url: string
          created_at?: string
          entry_id?: number | null
          id?: number
          original_file_name: string
          registration_id?: number | null
          updated_at: string
        }
        Update: {
          artist_id?: number
          cloud_id?: string
          cloud_url?: string
          created_at?: string
          entry_id?: number | null
          id?: number
          original_file_name?: string
          registration_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registration"
            referencedColumns: ["id"]
          },
        ]
      }
      registration: {
        Row: {
          accommodation: boolean
          artist_id: number
          bump_in: string | null
          bump_out: string | null
          closed: boolean
          crane: boolean
          created_at: string
          display_requirements: string | null
          id: number
          registration_year: string
          transport: boolean
          updated_at: string
        }
        Insert: {
          accommodation?: boolean
          artist_id: number
          bump_in?: string | null
          bump_out?: string | null
          closed?: boolean
          crane?: boolean
          created_at?: string
          display_requirements?: string | null
          id?: number
          registration_year: string
          transport?: boolean
          updated_at: string
        }
        Update: {
          accommodation?: boolean
          artist_id?: number
          bump_in?: string | null
          bump_out?: string | null
          closed?: boolean
          crane?: boolean
          created_at?: string
          display_requirements?: string | null
          id?: number
          registration_year?: string
          transport?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      entry_type: "Indoor" | "Outdoor"
      indigenous: "Yes" | "No" | "Declined"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

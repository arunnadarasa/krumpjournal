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
      article_authors: {
        Row: {
          article_id: string
          author_name: string
          author_order: number
          created_at: string | null
          id: string
          orcid_id: string
        }
        Insert: {
          article_id: string
          author_name: string
          author_order: number
          created_at?: string | null
          id?: string
          orcid_id: string
        }
        Update: {
          article_id?: string
          author_name?: string
          author_order?: number
          created_at?: string | null
          id?: string
          orcid_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_authors_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_drafts: {
        Row: {
          author_id: string
          content: Json | null
          created_at: string | null
          id: string
          last_saved_at: string | null
          metadata: Json | null
          title: string | null
        }
        Insert: {
          author_id: string
          content?: Json | null
          created_at?: string | null
          id?: string
          last_saved_at?: string | null
          metadata?: Json | null
          title?: string | null
        }
        Update: {
          author_id?: string
          content?: Json | null
          created_at?: string | null
          id?: string
          last_saved_at?: string | null
          metadata?: Json | null
          title?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          abstract: string
          author_id: string
          cover_image_ipfs: string | null
          created_at: string | null
          doi: string | null
          id: string
          ip_asset_id: string | null
          ipa_metadata_hash: string | null
          ipa_metadata_uri: string | null
          ipfs_gateway_url: string
          ipfs_hash: string
          keywords: string[] | null
          license: string | null
          minted_at: string | null
          network: Database["public"]["Enums"]["network_type"]
          nft_metadata_hash: string | null
          nft_metadata_uri: string | null
          pdf_ipfs_hash: string | null
          publication_type: Database["public"]["Enums"]["publication_type"]
          spg_contract_address: string | null
          status: string | null
          submitted_at: string | null
          title: string
          transaction_hash: string | null
          updated_at: string | null
          zenodo_doi: string | null
        }
        Insert: {
          abstract: string
          author_id: string
          cover_image_ipfs?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          ip_asset_id?: string | null
          ipa_metadata_hash?: string | null
          ipa_metadata_uri?: string | null
          ipfs_gateway_url: string
          ipfs_hash: string
          keywords?: string[] | null
          license?: string | null
          minted_at?: string | null
          network?: Database["public"]["Enums"]["network_type"]
          nft_metadata_hash?: string | null
          nft_metadata_uri?: string | null
          pdf_ipfs_hash?: string | null
          publication_type: Database["public"]["Enums"]["publication_type"]
          spg_contract_address?: string | null
          status?: string | null
          submitted_at?: string | null
          title: string
          transaction_hash?: string | null
          updated_at?: string | null
          zenodo_doi?: string | null
        }
        Update: {
          abstract?: string
          author_id?: string
          cover_image_ipfs?: string | null
          created_at?: string | null
          doi?: string | null
          id?: string
          ip_asset_id?: string | null
          ipa_metadata_hash?: string | null
          ipa_metadata_uri?: string | null
          ipfs_gateway_url?: string
          ipfs_hash?: string
          keywords?: string[] | null
          license?: string | null
          minted_at?: string | null
          network?: Database["public"]["Enums"]["network_type"]
          nft_metadata_hash?: string | null
          nft_metadata_uri?: string | null
          pdf_ipfs_hash?: string | null
          publication_type?: Database["public"]["Enums"]["publication_type"]
          spg_contract_address?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string
          transaction_hash?: string | null
          updated_at?: string | null
          zenodo_doi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          orcid_id: string | null
          orcid_name: string | null
          orcid_verified: boolean | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id: string
          orcid_id?: string | null
          orcid_name?: string | null
          orcid_verified?: boolean | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          orcid_id?: string | null
          orcid_name?: string | null
          orcid_verified?: boolean | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      world_id_verifications: {
        Row: {
          id: string
          merkle_root: string
          nullifier_hash: string
          proof: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          merkle_root: string
          nullifier_hash: string
          proof: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          merkle_root?: string
          nullifier_hash?: string
          proof?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "world_id_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      network_type: "testnet" | "mainnet"
      publication_type:
        | "research_article"
        | "review"
        | "perspective"
        | "preprint"
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
      network_type: ["testnet", "mainnet"],
      publication_type: [
        "research_article",
        "review",
        "perspective",
        "preprint",
      ],
    },
  },
} as const

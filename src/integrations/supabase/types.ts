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
      clientes: {
        Row: {
          categoria: Database["public"]["Enums"]["loyalty_category"] | null
          created_at: string | null
          email: string
          id: string
          nome: string
          pontos: number | null
          telefone: string | null
          total_gasto: number | null
          updated_at: string | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["loyalty_category"] | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          pontos?: number | null
          telefone?: string | null
          total_gasto?: number | null
          updated_at?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["loyalty_category"] | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          pontos?: number | null
          telefone?: string | null
          total_gasto?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      eventos: {
        Row: {
          capacidade: number
          created_at: string | null
          data: string
          descricao: string | null
          horario: string
          id: string
          ingressos_vendidos: number | null
          nome: string
          preco: number
          status: Database["public"]["Enums"]["event_status"] | null
          updated_at: string | null
        }
        Insert: {
          capacidade: number
          created_at?: string | null
          data: string
          descricao?: string | null
          horario: string
          id?: string
          ingressos_vendidos?: number | null
          nome: string
          preco: number
          status?: Database["public"]["Enums"]["event_status"] | null
          updated_at?: string | null
        }
        Update: {
          capacidade?: number
          created_at?: string | null
          data?: string
          descricao?: string | null
          horario?: string
          id?: string
          ingressos_vendidos?: number | null
          nome?: string
          preco?: number
          status?: Database["public"]["Enums"]["event_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      itens_venda: {
        Row: {
          created_at: string | null
          id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          venda_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          venda_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          subtotal?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      pista_controle: {
        Row: {
          created_at: string | null
          entrada: string
          id: string
          momento_pausa: string | null
          numero_cliente: number
          pausado: boolean | null
          saida_prevista: string
          tempo_pausado: unknown | null
          tempo_total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entrada: string
          id?: string
          momento_pausa?: string | null
          numero_cliente: number
          pausado?: boolean | null
          saida_prevista: string
          tempo_pausado?: unknown | null
          tempo_total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entrada?: string
          id?: string
          momento_pausa?: string | null
          numero_cliente?: number
          pausado?: boolean | null
          saida_prevista?: string
          tempo_pausado?: unknown | null
          tempo_total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          categoria: Database["public"]["Enums"]["product_category"]
          created_at: string | null
          descricao: string | null
          estoque: number
          id: string
          nome: string
          preco: number
          updated_at: string | null
        }
        Insert: {
          categoria: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          descricao?: string | null
          estoque?: number
          id?: string
          nome: string
          preco: number
          updated_at?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          descricao?: string | null
          estoque?: number
          id?: string
          nome?: string
          preco?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string
          permissoes: string[] | null
          tipo: Database["public"]["Enums"]["user_role"]
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          permissoes?: string[] | null
          tipo?: Database["public"]["Enums"]["user_role"]
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          permissoes?: string[] | null
          tipo?: Database["public"]["Enums"]["user_role"]
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente_id: string
          created_at: string | null
          data: string | null
          desconto: number | null
          id: string
          total: number
          total_final: number
          usuario_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data?: string | null
          desconto?: number | null
          id?: string
          total: number
          total_final: number
          usuario_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data?: string | null
          desconto?: number | null
          id?: string
          total?: number
          total_final?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_usuario_id_fkey"
            columns: ["usuario_id"]
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      event_status: "Programado" | "Em andamento" | "Finalizado" | "Cancelado"
      loyalty_category: "Bronze" | "Prata" | "Ouro" | "Diamante"
      product_category: "Ingresso" | "Ingresso evento" | "Produtos"
      user_role: "Administrador" | "Funcionario"
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
      event_status: ["Programado", "Em andamento", "Finalizado", "Cancelado"],
      loyalty_category: ["Bronze", "Prata", "Ouro", "Diamante"],
      product_category: ["Ingresso", "Ingresso evento", "Produtos"],
      user_role: ["Administrador", "Funcionario"],
    },
  },
} as const

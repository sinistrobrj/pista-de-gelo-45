
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nome: string
          email: string
          tipo: 'Administrador' | 'Funcionario'
          permissoes: string[]
          ativo: boolean
          ultimo_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          tipo?: 'Administrador' | 'Funcionario'
          permissoes?: string[]
          ativo?: boolean
          ultimo_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          tipo?: 'Administrador' | 'Funcionario'
          permissoes?: string[]
          ativo?: boolean
          ultimo_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          categoria: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante'
          pontos: number
          total_gasto: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          telefone?: string | null
          categoria?: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante'
          pontos?: number
          total_gasto?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string | null
          categoria?: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante'
          pontos?: number
          total_gasto?: number
          created_at?: string
          updated_at?: string
        }
      }
      produtos: {
        Row: {
          id: string
          nome: string
          categoria: 'Ingresso' | 'Ingresso evento' | 'Produtos'
          preco: number
          estoque: number
          descricao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          categoria: 'Ingresso' | 'Ingresso evento' | 'Produtos'
          preco: number
          estoque?: number
          descricao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          categoria?: 'Ingresso' | 'Ingresso evento' | 'Produtos'
          preco?: number
          estoque?: number
          descricao?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      eventos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          data: string
          horario: string
          capacidade: number
          preco: number
          ingressos_vendidos: number
          status: 'Programado' | 'Em andamento' | 'Finalizado' | 'Cancelado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          data: string
          horario: string
          capacidade: number
          preco: number
          ingressos_vendidos?: number
          status?: 'Programado' | 'Em andamento' | 'Finalizado' | 'Cancelado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          data?: string
          horario?: string
          capacidade?: number
          preco?: number
          ingressos_vendidos?: number
          status?: 'Programado' | 'Em andamento' | 'Finalizado' | 'Cancelado'
          created_at?: string
          updated_at?: string
        }
      }
      vendas: {
        Row: {
          id: string
          cliente_id: string
          usuario_id: string
          total: number
          desconto: number
          total_final: number
          data: string
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          usuario_id: string
          total: number
          desconto?: number
          total_final: number
          data?: string
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          usuario_id?: string
          total?: number
          desconto?: number
          total_final?: number
          data?: string
          created_at?: string
        }
      }
      itens_venda: {
        Row: {
          id: string
          venda_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          venda_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          venda_id?: string
          produto_id?: string
          quantidade?: number
          preco_unitario?: number
          subtotal?: number
          created_at?: string
        }
      }
      pista_controle: {
        Row: {
          id: string
          numero_cliente: number
          entrada: string
          saida_prevista: string
          tempo_total: number
          pausado: boolean
          tempo_pausado: string | null
          momento_pausa: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_cliente: number
          entrada: string
          saida_prevista: string
          tempo_total: number
          pausado?: boolean
          tempo_pausado?: string | null
          momento_pausa?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_cliente?: number
          entrada?: string
          saida_prevista?: string
          tempo_total?: number
          pausado?: boolean
          tempo_pausado?: string | null
          momento_pausa?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

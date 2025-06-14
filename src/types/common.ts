
export interface Cliente {
  id: string
  nome: string
  email?: string
  cpf?: string
  telefone?: string
  categoria: "Bronze" | "Prata" | "Ouro" | "Diamante"
  pontos: number
  total_gasto: number
}

export interface Produto {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  tipo?: string
  evento_id?: string
}

export interface ItemCarrinho {
  produto_id: string
  nome: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}

export interface Venda {
  id: string
  cliente_id: string
  usuario_id: string
  total: number
  desconto: number
  total_final: number
  data: string
}

export interface RegraFidelidade {
  id: string
  categoria: string
  desconto_percentual: number
  pontos_por_real: number
  requisito_minimo: number
}

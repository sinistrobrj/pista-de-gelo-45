
import { useCallback } from "react"

interface ItemCarrinho {
  produto_id: string
  nome: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}

interface Cliente {
  id: string
  nome: string
  categoria: string
  pontos: number
  total_gasto: number
}

export function useVendaCalculos(
  carrinho: ItemCarrinho[],
  clienteSelecionado: string,
  clientes: Cliente[],
  regrasFidelidade: any[],
  descontoPercentual: number
) {
  const calcularTotais = useCallback(() => {
    const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0)
    
    let descontoFidelidade = 0
    if (clienteSelecionado) {
      const cliente = clientes.find(c => c.id === clienteSelecionado)
      if (cliente) {
        const regra = regrasFidelidade.find(r => r.categoria === cliente.categoria)
        if (regra) {
          descontoFidelidade = regra.desconto_percentual
        }
      }
    }

    const descontoFinal = descontoFidelidade + descontoPercentual
    const descontoAplicado = total * (descontoFinal / 100)
    const totalComDesconto = total - descontoAplicado

    return { total, descontoAplicado, totalComDesconto, descontoFinal, descontoFidelidade }
  }, [carrinho, clienteSelecionado, clientes, regrasFidelidade, descontoPercentual])

  return { calcularTotais }
}

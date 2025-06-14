
import { useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { createVenda } from "@/lib/supabase-sales"

interface ItemCarrinho {
  produto_id: string
  nome: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}

interface CalculoTotais {
  total: number
  descontoAplicado: number
  totalComDesconto: number
  descontoFinal: number
  descontoFidelidade: number
}

export function useVendaFinalizacao(
  clienteSelecionado: string,
  carrinho: ItemCarrinho[],
  calcularTotais: () => CalculoTotais,
  limparCarrinho: () => void,
  setClienteSelecionado: (cliente: string) => void,
  setDescontoPercentual: (desconto: number) => void,
  recarregarProdutos: () => Promise<void>
) {
  const { toast } = useToast()
  const { user } = useAuth()

  const finalizarVenda = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado. Faça login novamente.",
        variant: "destructive"
      })
      return { success: false }
    }

    if (!clienteSelecionado) {
      toast({
        title: "Erro", 
        description: "Selecione um cliente",
        variant: "destructive"
      })
      return { success: false }
    }

    if (carrinho.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione itens ao carrinho",
        variant: "destructive"
      })
      return { success: false }
    }

    try {
      const { total, descontoAplicado, totalComDesconto } = calcularTotais()

      const venda = {
        cliente_id: clienteSelecionado,
        usuario_id: user.id,
        total: total,
        desconto: descontoAplicado,
        total_final: totalComDesconto,
        data: new Date().toISOString()
      }

      const { error } = await createVenda(venda, carrinho)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Venda finalizada com sucesso!"
      })

      limparCarrinho()
      setClienteSelecionado("")
      setDescontoPercentual(0)
      
      await recarregarProdutos()
      
      return { success: true }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      toast({
        title: "Erro",
        description: "Erro ao finalizar venda",
        variant: "destructive"
      })
      return { success: false }
    }
  }, [user, clienteSelecionado, carrinho, calcularTotais, limparCarrinho, setClienteSelecionado, setDescontoPercentual, recarregarProdutos, toast])

  return { finalizarVenda }
}

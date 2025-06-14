
import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { getItensVenda, clearItensCache } from "@/lib/supabase-sales"

interface Produto {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  tipo?: string
  evento_id?: string
}

export function useProdutosData() {
  const { toast } = useToast()
  const [produtos, setProdutos] = useState<Produto[]>([])

  const carregarProdutos = useCallback(async () => {
    try {
      console.log('Carregando produtos...')
      clearItensCache()
      const produtosResult = await getItensVenda()
      console.log('Resultado produtos:', produtosResult)
      
      if (!produtosResult.error) {
        setProdutos(produtosResult.data || [])
        console.log('Produtos definidos:', produtosResult.data?.length || 0)
      } else {
        console.error('Erro ao carregar produtos:', produtosResult.error)
        throw produtosResult.error
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  const recarregarProdutos = useCallback(async () => {
    try {
      await carregarProdutos()
      toast({
        title: "Sucesso",
        description: "Produtos atualizados com sucesso!"
      })
    } catch (error) {
      // Error already handled in carregarProdutos
    }
  }, [carregarProdutos, toast])

  return {
    produtos,
    carregarProdutos,
    recarregarProdutos
  }
}

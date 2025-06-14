
import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { useClientesData } from "./useClientesData"
import { useProdutosData } from "./useProdutosData"
import { useCarrinho } from "./useCarrinho"
import { useVendaCalculos } from "./useVendaCalculos"
import { useVendaFinalizacao } from "./useVendaFinalizacao"

export function usePontoVenda() {
  const { toast } = useToast()
  const { profile, user, loading: authLoading } = useAuth()
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("")
  const [descontoPercentual, setDescontoPercentual] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const { clientes, regrasFidelidade, carregarClientes, carregarRegras } = useClientesData()
  const { produtos, carregarProdutos, recarregarProdutos } = useProdutosData()
  const { carrinho, adicionarAoCarrinho, atualizarQuantidade, removerDoCarrinho, limparCarrinho } = useCarrinho()
  const { calcularTotais } = useVendaCalculos(carrinho, clienteSelecionado, clientes, regrasFidelidade, descontoPercentual)
  const { finalizarVenda: finalizarVendaOriginal } = useVendaFinalizacao(
    clienteSelecionado,
    carrinho,
    calcularTotais,
    limparCarrinho,
    setClienteSelecionado,
    setDescontoPercentual,
    recarregarProdutos
  )

  const carregarDados = useCallback(async () => {
    if (initialized) return
    
    console.log('=== INICIANDO CARREGAMENTO DOS DADOS ===')
    console.log('Auth loading:', authLoading)
    console.log('User:', user?.id)
    console.log('Profile:', profile?.nome)
    
    try {
      setLoading(true)
      
      await Promise.all([
        carregarClientes(),
        carregarProdutos(),
        carregarRegras()
      ])
      
      setInitialized(true)
      console.log('=== CARREGAMENTO CONCLUÍDO ===')
    } catch (error) {
      console.error('=== ERRO CRÍTICO NO CARREGAMENTO ===', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente recarregar a página.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [initialized, authLoading, user, profile, toast, carregarClientes, carregarProdutos, carregarRegras])

  useEffect(() => {
    console.log('=== EFFECT DISPARADO ===')
    console.log('authLoading:', authLoading, 'user:', !!user, 'initialized:', initialized)
    
    if (!authLoading && user && !initialized) {
      console.log('Condições atendidas, iniciando carregamento...')
      carregarDados()
    }
  }, [authLoading, user, initialized, carregarDados])

  const finalizarVenda = useCallback(async () => {
    setLoading(true)
    try {
      const result = await finalizarVendaOriginal()
      return result
    } finally {
      setLoading(false)
    }
  }, [finalizarVendaOriginal])

  const recarregarProdutosComLoading = useCallback(async () => {
    setLoading(true)
    try {
      await recarregarProdutos()
    } finally {
      setLoading(false)
    }
  }, [recarregarProdutos])

  return {
    // State
    clientes,
    produtos,
    clienteSelecionado,
    carrinho,
    descontoPercentual,
    loading,
    regrasFidelidade,
    initialized,
    authLoading,
    user,

    // Actions
    setClienteSelecionado,
    setDescontoPercentual,
    adicionarAoCarrinho,
    atualizarQuantidade,
    removerDoCarrinho,
    calcularTotais,
    recarregarProdutos: recarregarProdutosComLoading,
    finalizarVenda
  }
}


import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getClientes, getRegrasFidelidade } from "@/lib/supabase-utils"
import { createVenda, getItensVenda, clearItensCache } from "@/lib/supabase-sales"

interface Cliente {
  id: string
  nome: string
  categoria: string
  pontos: number
  total_gasto: number
}

interface Produto {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  tipo?: string
  evento_id?: string
}

interface ItemCarrinho {
  produto_id: string
  nome: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}

export function usePontoVenda() {
  const { toast } = useToast()
  const { profile, user, loading: authLoading } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("")
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [descontoPercentual, setDescontoPercentual] = useState(0)
  const [loading, setLoading] = useState(false)
  const [regrasFidelidade, setRegrasFidelidade] = useState<any[]>([])
  const [initialized, setInitialized] = useState(false)

  const carregarDados = useCallback(async () => {
    if (initialized) return
    
    console.log('=== INICIANDO CARREGAMENTO DOS DADOS ===')
    console.log('Auth loading:', authLoading)
    console.log('User:', user?.id)
    console.log('Profile:', profile?.nome)
    
    try {
      setLoading(true)
      console.log('Limpando cache...')
      clearItensCache()
      
      console.log('Carregando clientes...')
      const clientesResult = await getClientes()
      console.log('Resultado clientes:', clientesResult)
      
      console.log('Carregando produtos...')
      const produtosResult = await getItensVenda()
      console.log('Resultado produtos:', produtosResult)
      
      console.log('Carregando regras...')
      const regrasResult = await getRegrasFidelidade()
      console.log('Resultado regras:', regrasResult)

      if (!clientesResult.error) {
        setClientes(clientesResult.data || [])
        console.log('Clientes definidos:', clientesResult.data?.length || 0)
      } else {
        console.error('Erro ao carregar clientes:', clientesResult.error)
      }
      
      if (!produtosResult.error) {
        setProdutos(produtosResult.data || [])
        console.log('Produtos definidos:', produtosResult.data?.length || 0)
      } else {
        console.error('Erro ao carregar produtos:', produtosResult.error)
      }
      
      if (!regrasResult.error) {
        setRegrasFidelidade(regrasResult.data || [])
        console.log('Regras definidas:', regrasResult.data?.length || 0)
      } else {
        console.error('Erro ao carregar regras:', regrasResult.error)
      }
      
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
  }, [initialized, authLoading, user, profile, toast])

  useEffect(() => {
    console.log('=== EFFECT DISPARADO ===')
    console.log('authLoading:', authLoading, 'user:', !!user, 'initialized:', initialized)
    
    if (!authLoading && user && !initialized) {
      console.log('Condições atendidas, iniciando carregamento...')
      carregarDados()
    }
  }, [authLoading, user, initialized, carregarDados])

  const adicionarAoCarrinho = useCallback((produto: Produto) => {
    setCarrinho(carrinho => {
      const itemExistente = carrinho.find(item => item.produto_id === produto.id)
      
      if (itemExistente) {
        if (itemExistente.quantidade < produto.estoque) {
          return carrinho.map(item => 
            item.produto_id === produto.id 
              ? { ...item, quantidade: item.quantidade + 1, subtotal: item.preco_unitario * (item.quantidade + 1) }
              : item
          )
        }
        return carrinho
      } else {
        const novoItem: ItemCarrinho = {
          produto_id: produto.id,
          nome: produto.nome,
          preco_unitario: produto.preco,
          quantidade: 1,
          subtotal: produto.preco
        }
        return [...carrinho, novoItem]
      }
    })
  }, [])

  const atualizarQuantidade = useCallback((produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      setCarrinho(carrinho => carrinho.filter(item => item.produto_id !== produtoId))
      return
    }

    setCarrinho(carrinho => carrinho.map(item => {
      if (item.produto_id === produtoId) {
        return {
          ...item,
          quantidade: novaQuantidade,
          subtotal: item.preco_unitario * novaQuantidade
        }
      }
      return item
    }))
  }, [])

  const removerDoCarrinho = useCallback((produtoId: string) => {
    setCarrinho(carrinho => carrinho.filter(item => item.produto_id !== produtoId))
  }, [])

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

  const recarregarProdutos = useCallback(async () => {
    setLoading(true)
    try {
      clearItensCache()
      const produtosResult = await getItensVenda()
      
      if (!produtosResult.error) {
        setProdutos(produtosResult.data || [])
        toast({
          title: "Sucesso",
          description: "Produtos atualizados com sucesso!"
        })
      }
    } catch (error) {
      console.error('Erro ao recarregar produtos:', error)
      toast({
        title: "Erro",
        description: "Erro ao recarregar produtos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const finalizarVenda = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado. Faça login novamente.",
        variant: "destructive"
      })
      return
    }

    if (!clienteSelecionado) {
      toast({
        title: "Erro", 
        description: "Selecione um cliente",
        variant: "destructive"
      })
      return
    }

    if (carrinho.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione itens ao carrinho",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

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

      setCarrinho([])
      setClienteSelecionado("")
      setDescontoPercentual(0)
      
      const produtosResult = await getItensVenda()
      if (!produtosResult.error) {
        setProdutos(produtosResult.data || [])
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      toast({
        title: "Erro",
        description: "Erro ao finalizar venda",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
    recarregarProdutos,
    finalizarVenda
  }
}

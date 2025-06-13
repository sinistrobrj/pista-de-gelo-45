import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getClientes, getRegrasFidelidade } from "@/lib/supabase-utils"
import { createVenda, getItensVenda, clearItensCache } from "@/lib/supabase-sales"
import { ProductSelector } from "./product-selector"
import { CartSummary } from "./cart-summary"
import { ShoppingCart, User, CreditCard, RefreshCw } from "lucide-react"

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

export function PontoVenda() {
  const { toast } = useToast()
  const { profile, user, loading: authLoading } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("")
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [descontoPercentual, setDescontoPercentual] = useState(0)
  const [loading, setLoading] = useState(false)
  const [regrasFidelidade, setRegrasFidelidade] = useState<any[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Memoizar a função para evitar recriações desnecessárias
  const carregarDados = useCallback(async () => {
    if (dataLoaded || authLoading) return
    
    try {
      setLoading(true)
      console.log('Carregando dados do ponto de venda...')
      
      // Limpar cache para garantir dados frescos
      clearItensCache()
      
      const [clientesResult, produtosResult, regrasResult] = await Promise.all([
        getClientes(),
        getItensVenda(),
        getRegrasFidelidade()
      ])

      if (!clientesResult.error) {
        setClientes(clientesResult.data)
        console.log('Clientes carregados:', clientesResult.data.length)
      }
      
      if (!produtosResult.error) {
        setProdutos(produtosResult.data)
        console.log('Produtos carregados:', produtosResult.data.length)
        console.log('Produtos detalhes:', produtosResult.data)
      }
      
      if (!regrasResult.error) {
        setRegrasFidelidade(regrasResult.data)
        console.log('Regras carregadas:', regrasResult.data.length)
      }
      
      setDataLoaded(true)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [dataLoaded, authLoading, toast])

  // Função para recarregar dados
  const recarregarProdutos = useCallback(async () => {
    setLoading(true)
    try {
      clearItensCache() // Limpar cache
      const produtosResult = await getItensVenda()
      
      if (!produtosResult.error) {
        setProdutos(produtosResult.data)
        console.log('Produtos recarregados:', produtosResult.data.length)
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

  useEffect(() => {
    if (!authLoading && user) {
      carregarDados()
    }
  }, [authLoading, user, carregarDados])

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
      
      // Recarregar produtos após venda
      const produtosResult = await getItensVenda()
      if (!produtosResult.error) {
        setProdutos(produtosResult.data)
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

  const { total, descontoAplicado, totalComDesconto, descontoFinal, descontoFidelidade } = calcularTotais()

  if (authLoading || (!dataLoaded && loading)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Ponto de Venda</h1>
        </div>
        
        <Button onClick={recarregarProdutos} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Produtos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Selecionar Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.categoria}
                      {(() => {
                        const regra = regrasFidelidade.find(r => r.categoria === cliente.categoria)
                        return regra ? ` (${regra.desconto_percentual}% desconto)` : ''
                      })()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {clienteSelecionado && descontoFidelidade > 0 && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  Desconto de fidelidade: {descontoFidelidade}%
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Disponíveis ({produtos.length} itens)</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSelector
                produtos={produtos}
                carrinho={carrinho}
                onAddToCart={adicionarAoCarrinho}
                onUpdateQuantity={atualizarQuantidade}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <CartSummary
            carrinho={carrinho}
            descontoPercentual={descontoPercentual}
            onDescontoChange={setDescontoPercentual}
            onRemoveItem={removerDoCarrinho}
            total={total}
            totalComDesconto={totalComDesconto}
            descontoAplicado={descontoAplicado}
            descontoFidelidade={descontoFidelidade}
            descontoFinal={descontoFinal}
          />

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={finalizarVenda}
                disabled={loading || carrinho.length === 0 || !clienteSelecionado}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {loading ? "Finalizando..." : "Finalizar Venda"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

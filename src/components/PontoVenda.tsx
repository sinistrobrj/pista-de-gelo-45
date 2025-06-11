
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getClientes, getRegrasFidelidade } from "@/lib/supabase-utils"
import { createVenda, getItensVenda } from "@/lib/supabase-sales"
import { ProductSelector } from "./product-selector"
import { CartSummary } from "./cart-summary"
import { ShoppingCart, User, CreditCard } from "lucide-react"

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
  const { profile, user } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("")
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [descontoPercentual, setDescontoPercentual] = useState(0)
  const [loading, setLoading] = useState(false)
  const [regrasFidelidade, setRegrasFidelidade] = useState<any[]>([])

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [clientesResult, produtosResult, regrasResult] = await Promise.all([
        getClientes(),
        getItensVenda(),
        getRegrasFidelidade()
      ])

      if (!clientesResult.error) setClientes(clientesResult.data)
      if (!produtosResult.error) setProdutos(produtosResult.data)
      if (!regrasResult.error) setRegrasFidelidade(regrasResult.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const adicionarAoCarrinho = (produto: Produto) => {
    const itemExistente = carrinho.find(item => item.produto_id === produto.id)
    
    if (itemExistente) {
      if (itemExistente.quantidade < produto.estoque) {
        atualizarQuantidade(produto.id, itemExistente.quantidade + 1)
      }
    } else {
      const novoItem: ItemCarrinho = {
        produto_id: produto.id,
        nome: produto.nome,
        preco_unitario: produto.preco,
        quantidade: 1,
        subtotal: produto.preco
      }
      setCarrinho([...carrinho, novoItem])
    }
  }

  const atualizarQuantidade = (produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(produtoId)
      return
    }

    setCarrinho(carrinho.map(item => {
      if (item.produto_id === produtoId) {
        return {
          ...item,
          quantidade: novaQuantidade,
          subtotal: item.preco_unitario * novaQuantidade
        }
      }
      return item
    }))
  }

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId))
  }

  const calcularTotais = () => {
    const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0)
    
    // Obter desconto da categoria de fidelidade se houver cliente selecionado
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

    // SOMAR os descontos (fidelidade + manual)
    const descontoFinal = descontoFidelidade + descontoPercentual
    const descontoAplicado = total * (descontoFinal / 100)
    const totalComDesconto = total - descontoAplicado

    return { total, descontoAplicado, totalComDesconto, descontoFinal, descontoFidelidade }
  }

  const finalizarVenda = async () => {
    console.log('Verificando usuário:', { profile, user })
    
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

      console.log('Criando venda com:', venda)

      const { error } = await createVenda(venda, carrinho)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Venda finalizada com sucesso!"
      })

      // Limpar carrinho e seleções
      setCarrinho([])
      setClienteSelecionado("")
      setDescontoPercentual(0)
      
      // Recarregar dados para atualizar estoque
      carregarDados()
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Ponto de Venda</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Cliente */}
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
              
              {/* Mostrar desconto de fidelidade aplicado */}
              {clienteSelecionado && descontoFidelidade > 0 && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  Desconto de fidelidade: {descontoFidelidade}%
                </div>
              )}
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Disponíveis</CardTitle>
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

        {/* Resumo da Venda */}
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

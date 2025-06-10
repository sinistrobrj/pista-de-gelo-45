
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Plus, Minus, Trash2, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getProdutos, getClientes, createVenda } from "@/lib/supabase-utils"

interface Produto {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
}

interface Cliente {
  id: string
  nome: string
  email: string
  categoria: string
  pontos: number
}

interface ItemVenda {
  produto_id: string
  nome: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}

export function PontoVenda() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    console.log('Carregando dados do ponto de venda...')
    setLoadingData(true)
    
    try {
      const [produtosResult, clientesResult] = await Promise.all([
        getProdutos(),
        getClientes()
      ])

      console.log('Resultado produtos:', produtosResult)
      console.log('Resultado clientes:', clientesResult)

      if (produtosResult.error) {
        console.error('Erro ao carregar produtos:', produtosResult.error)
        toast({
          title: "Erro",
          description: "Erro ao carregar produtos: " + produtosResult.error.message,
          variant: "destructive"
        })
      } else {
        console.log('Produtos carregados:', produtosResult.data)
        setProdutos(produtosResult.data || [])
      }

      if (clientesResult.error) {
        console.error('Erro ao carregar clientes:', clientesResult.error)
        toast({
          title: "Erro", 
          description: "Erro ao carregar clientes: " + clientesResult.error.message,
          variant: "destructive"
        })
      } else {
        console.log('Clientes carregados:', clientesResult.data)
        setClientes(clientesResult.data || [])
      }
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do sistema",
        variant: "destructive"
      })
    } finally {
      setLoadingData(false)
    }
  }

  const adicionarItem = (produto: Produto) => {
    if (produto.estoque <= 0) {
      toast({
        title: "Estoque insuficiente",
        description: "Este produto não está disponível no estoque",
        variant: "destructive"
      })
      return
    }

    const itemExistente = itensVenda.find(item => item.produto_id === produto.id)
    
    if (itemExistente) {
      if (itemExistente.quantidade >= produto.estoque) {
        toast({
          title: "Estoque insuficiente",
          description: "Quantidade solicitada excede o estoque disponível",
          variant: "destructive"
        })
        return
      }
      
      setItensVenda(itens => 
        itens.map(item => 
          item.produto_id === produto.id 
            ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco_unitario }
            : item
        )
      )
    } else {
      setItensVenda(itens => [...itens, {
        produto_id: produto.id,
        nome: produto.nome,
        quantidade: 1,
        preco_unitario: produto.preco,
        subtotal: produto.preco
      }])
    }
  }

  const alterarQuantidade = (produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      setItensVenda(itens => itens.filter(item => item.produto_id !== produtoId))
      return
    }

    const produto = produtos.find(p => p.id === produtoId)
    if (produto && novaQuantidade > produto.estoque) {
      toast({
        title: "Estoque insuficiente",
        description: "Quantidade solicitada excede o estoque disponível",
        variant: "destructive"
      })
      return
    }

    setItensVenda(itens => 
      itens.map(item => 
        item.produto_id === produtoId 
          ? { ...item, quantidade: novaQuantidade, subtotal: novaQuantidade * item.preco_unitario }
          : item
      )
    )
  }

  const removerItem = (produtoId: string) => {
    setItensVenda(itens => itens.filter(item => item.produto_id !== produtoId))
  }

  const calcularTotal = () => {
    return itensVenda.reduce((total, item) => total + item.subtotal, 0)
  }

  const calcularDesconto = () => {
    if (!clienteSelecionado) return 0
    
    const total = calcularTotal()
    const categoria = clienteSelecionado.categoria

    switch (categoria) {
      case 'Prata': return total * 0.05
      case 'Ouro': return total * 0.10
      case 'Diamante': return total * 0.15
      default: return 0
    }
  }

  const finalizarVenda = async () => {
    if (itensVenda.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à venda",
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

    if (!profile?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const total = calcularTotal()
      const desconto = calcularDesconto()
      const totalFinal = total - desconto

      const vendaData = {
        cliente_id: clienteSelecionado.id,
        usuario_id: profile.id,
        total,
        desconto,
        total_final: totalFinal,
        data: new Date().toISOString()
      }

      const { error } = await createVenda(vendaData, itensVenda)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Venda realizada com sucesso!"
      })

      // Limpar formulário
      setItensVenda([])
      setClienteSelecionado(null)
      
      // Recarregar produtos para atualizar estoque
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

  const total = calcularTotal()
  const desconto = calcularDesconto()
  const totalFinal = total - desconto

  if (loadingData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Ponto de Venda</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Ponto de Venda</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {produtos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum produto cadastrado no estoque
                </p>
              ) : (
                produtos.map((produto) => (
                  <div key={produto.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{produto.nome}</h4>
                      <p className="text-sm text-muted-foreground">{produto.categoria}</p>
                      <p className="text-sm font-medium">R$ {produto.preco.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Estoque: {produto.estoque}</p>
                    </div>
                    <Button 
                      onClick={() => adicionarItem(produto)}
                      disabled={produto.estoque <= 0}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Carrinho de Compras */}
        <div className="space-y-6">
          {/* Seleção de Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => {
                const cliente = clientes.find(c => c.id === value)
                setClienteSelecionado(cliente || null)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {cliente.nome} - {cliente.categoria}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {clienteSelecionado && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>{clienteSelecionado.nome}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Categoria: {clienteSelecionado.categoria}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pontos: {clienteSelecionado.pontos}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itens da Venda */}
          <Card>
            <CardHeader>
              <CardTitle>Itens da Venda</CardTitle>
            </CardHeader>
            <CardContent>
              {itensVenda.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum item adicionado
                </p>
              ) : (
                <div className="space-y-3">
                  {itensVenda.map((item) => (
                    <div key={item.produto_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.preco_unitario.toFixed(2)} cada
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alterarQuantidade(item.produto_id, item.quantidade - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantidade}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alterarQuantidade(item.produto_id, item.quantidade + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removerItem(item.produto_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total e Finalização */}
          {itensVenda.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                
                {desconto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({clienteSelecionado?.categoria}):</span>
                    <span>- R$ {desconto.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {totalFinal.toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={finalizarVenda} 
                  className="w-full"
                  disabled={loading || !clienteSelecionado}
                >
                  {loading ? "Processando..." : "Finalizar Venda"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

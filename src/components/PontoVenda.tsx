
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, Percent, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getItensVenda, getClientes, createVenda } from "@/lib/supabase-utils"

interface ItemVenda {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  descricao?: string
  tipo: 'produto' | 'evento'
  evento_id?: string
}

interface Cliente {
  id: string
  nome: string
  email: string
  categoria: string
  pontos: number
}

interface ItemCarrinho {
  produto_id: string
  nome: string
  quantidade: number
  preco_unitario: number
  subtotal: number
  tipo: 'produto' | 'evento'
  evento_id?: string
}

export function PontoVenda() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [itensDisponiveis, setItensDisponiveis] = useState<ItemVenda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [itemSelecionado, setItemSelecionado] = useState<ItemVenda | null>(null)
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([])
  const [descontoManual, setDescontoManual] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    console.log('Carregando dados do ponto de venda...')
    setLoadingData(true)
    
    try {
      const [itensResult, clientesResult] = await Promise.all([
        getItensVenda(),
        getClientes()
      ])

      console.log('Resultado itens:', itensResult)
      console.log('Resultado clientes:', clientesResult)

      if (itensResult.error) {
        console.error('Erro ao carregar itens:', itensResult.error)
        toast({
          title: "Erro",
          description: "Erro ao carregar itens: " + itensResult.error.message,
          variant: "destructive"
        })
      } else {
        console.log('Itens carregados:', itensResult.data)
        setItensDisponiveis(itensResult.data || [])
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

  const adicionarAoCarrinho = () => {
    if (!itemSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um item para adicionar",
        variant: "destructive"
      })
      return
    }

    if (itemSelecionado.estoque <= 0) {
      toast({
        title: "Estoque insuficiente",
        description: "Este item não está disponível no estoque",
        variant: "destructive"
      })
      return
    }

    const itemExistente = itensCarrinho.find(item => item.produto_id === itemSelecionado.id)
    
    if (itemExistente) {
      if (itemExistente.quantidade >= itemSelecionado.estoque) {
        toast({
          title: "Estoque insuficiente",
          description: "Quantidade solicitada excede o estoque disponível",
          variant: "destructive"
        })
        return
      }
      
      setItensCarrinho(itens => 
        itens.map(item => 
          item.produto_id === itemSelecionado.id 
            ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco_unitario }
            : item
        )
      )
    } else {
      setItensCarrinho(itens => [...itens, {
        produto_id: itemSelecionado.id,
        nome: itemSelecionado.nome,
        quantidade: 1,
        preco_unitario: itemSelecionado.preco,
        subtotal: itemSelecionado.preco,
        tipo: itemSelecionado.tipo,
        evento_id: itemSelecionado.evento_id
      }])
    }
  }

  const alterarQuantidade = (produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      setItensCarrinho(itens => itens.filter(item => item.produto_id !== produtoId))
      return
    }

    const item = itensDisponiveis.find(p => p.id === produtoId)
    if (item && novaQuantidade > item.estoque) {
      toast({
        title: "Estoque insuficiente",
        description: "Quantidade solicitada excede o estoque disponível",
        variant: "destructive"
      })
      return
    }

    setItensCarrinho(itens => 
      itens.map(item => 
        item.produto_id === produtoId 
          ? { ...item, quantidade: novaQuantidade, subtotal: novaQuantidade * item.preco_unitario }
          : item
      )
    )
  }

  const removerItem = (produtoId: string) => {
    setItensCarrinho(itens => itens.filter(item => item.produto_id !== produtoId))
  }

  const calcularSubtotal = () => {
    return itensCarrinho.reduce((total, item) => total + item.subtotal, 0)
  }

  const calcularDescontoFidelidade = () => {
    if (!clienteSelecionado) return 0
    
    const subtotal = calcularSubtotal()
    const categoria = clienteSelecionado.categoria

    switch (categoria) {
      case 'Prata': return subtotal * 0.05
      case 'Ouro': return subtotal * 0.10
      case 'Diamante': return subtotal * 0.15
      default: return 0
    }
  }

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    const descontoFidelidade = calcularDescontoFidelidade()
    return subtotal - descontoFidelidade - descontoManual
  }

  const finalizarVenda = async () => {
    if (itensCarrinho.length === 0) {
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

    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const subtotal = calcularSubtotal()
      const descontoFidelidade = calcularDescontoFidelidade()
      const descontoTotal = descontoFidelidade + descontoManual
      const totalFinal = subtotal - descontoTotal

      const vendaData = {
        cliente_id: clienteSelecionado.id,
        usuario_id: user.id,
        total: subtotal,
        desconto: descontoTotal,
        total_final: totalFinal,
        data: new Date().toISOString()
      }

      // Preparar itens para inserção (removendo campos que não existem na tabela)
      const itensParaVenda = itensCarrinho.map(item => ({
        produto_id: item.produto_id.startsWith('evento_') ? item.produto_id.replace('evento_', '') : item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.subtotal
      }))

      const { error } = await createVenda(vendaData, itensParaVenda)

      if (error) {
        throw error
      }

      toast({
        title: "Sucesso",
        description: "Venda realizada com sucesso!"
      })

      // Limpar formulário
      setItensCarrinho([])
      setClienteSelecionado(null)
      setItemSelecionado(null)
      setDescontoManual(0)
      
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

  const subtotal = calcularSubtotal()
  const descontoFidelidade = calcularDescontoFidelidade()
  const descontoTotal = descontoFidelidade + descontoManual
  const total = calcularTotal()

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Seleção de Cliente e Produto */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Cliente
              </CardTitle>
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
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{clienteSelecionado.categoria}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {clienteSelecionado.pontos} pontos
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selecionar Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => {
                const item = itensDisponiveis.find(i => i.id === value)
                setItemSelecionado(item || null)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {itensDisponiveis.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-medium">{item.nome}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.categoria}</Badge>
                            <span className="text-sm text-muted-foreground">
                              R$ {item.preco.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Estoque: {item.estoque}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {itemSelecionado && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{itemSelecionado.nome}</p>
                  <p className="text-sm text-muted-foreground">{itemSelecionado.categoria}</p>
                  <p className="text-sm font-medium">R$ {itemSelecionado.preco.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Estoque: {itemSelecionado.estoque}</p>
                  {itemSelecionado.descricao && (
                    <p className="text-xs text-muted-foreground mt-1">{itemSelecionado.descricao}</p>
                  )}
                </div>
              )}
              
              <Button 
                onClick={adicionarAoCarrinho}
                disabled={!itemSelecionado || itemSelecionado.estoque <= 0}
                className="w-full mt-3"
              >
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho de Compras */}
        <Card>
          <CardHeader>
            <CardTitle>Carrinho de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {itensCarrinho.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum item no carrinho
              </p>
            ) : (
              <div className="space-y-3">
                {itensCarrinho.map((item) => (
                  <div key={item.produto_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.tipo === 'evento' ? 'Evento' : 'Produto'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          R$ {item.preco_unitario.toFixed(2)} cada
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alterarQuantidade(item.produto_id, item.quantidade - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantidade}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alterarQuantidade(item.produto_id, item.quantidade + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removerItem(item.produto_id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo e Finalização */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Desconto Manual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="desconto-manual">Valor do Desconto (R$)</Label>
                <Input
                  id="desconto-manual"
                  type="number"
                  min="0"
                  max={subtotal}
                  step="0.01"
                  value={descontoManual}
                  onChange={(e) => setDescontoManual(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0,00"
                />
              </div>
            </CardContent>
          </Card>

          {itensCarrinho.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                
                {descontoFidelidade > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Desconto Fidelidade ({clienteSelecionado?.categoria}):
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-green-600">
                        -{descontoFidelidade.toFixed(0)}%
                      </Badge>
                      <span className="text-green-600">- R$ {descontoFidelidade.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {descontoManual > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Desconto Manual:
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-blue-600">
                        Manual
                      </Badge>
                      <span className="text-blue-600">- R$ {descontoManual.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={finalizarVenda} 
                  className="w-full"
                  disabled={loading || !clienteSelecionado || total < 0}
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

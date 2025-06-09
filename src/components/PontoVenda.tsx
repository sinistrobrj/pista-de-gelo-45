
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, User, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getClientes, getProdutos, createVenda } from "@/lib/supabase-utils"

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
  categoria: "Bronze" | "Prata" | "Ouro" | "Diamante"
}

interface ItemVenda {
  produto_id: string
  nome: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}

export function PontoVenda() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("")
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([])
  const [descontoPercentual, setDescontoPercentual] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [produtosData, clientesData] = await Promise.all([
        getProdutos(),
        getClientes()
      ])
      
      if (produtosData.error) {
        console.error('Erro ao carregar produtos:', produtosData.error)
      } else {
        setProdutos(produtosData.data.filter(p => p.estoque > 0))
      }

      if (clientesData.error) {
        console.error('Erro ao carregar clientes:', clientesData.error)
      } else {
        setClientes(clientesData.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarItem = (produto: Produto) => {
    const itemExistente = itensVenda.find(item => item.produto_id === produto.id)
    
    if (itemExistente) {
      if (itemExistente.quantidade >= produto.estoque) {
        toast({
          title: "Estoque insuficiente",
          description: `Apenas ${produto.estoque} unidades disponíveis`,
          variant: "destructive"
        })
        return
      }
      
      setItensVenda(itensVenda.map(item =>
        item.produto_id === produto.id
          ? {
              ...item,
              quantidade: item.quantidade + 1,
              subtotal: (item.quantidade + 1) * item.preco_unitario
            }
          : item
      ))
    } else {
      setItensVenda([...itensVenda, {
        produto_id: produto.id,
        nome: produto.nome,
        preco_unitario: produto.preco,
        quantidade: 1,
        subtotal: produto.preco
      }])
    }
  }

  const alterarQuantidade = (produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(produtoId)
      return
    }

    const produto = produtos.find(p => p.id === produtoId)
    if (produto && novaQuantidade > produto.estoque) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${produto.estoque} unidades disponíveis`,
        variant: "destructive"
      })
      return
    }

    setItensVenda(itensVenda.map(item =>
      item.produto_id === produtoId
        ? {
            ...item,
            quantidade: novaQuantidade,
            subtotal: novaQuantidade * item.preco_unitario
          }
        : item
    ))
  }

  const removerItem = (produtoId: string) => {
    setItensVenda(itensVenda.filter(item => item.produto_id !== produtoId))
  }

  const calcularTotais = () => {
    const subtotal = itensVenda.reduce((total, item) => total + item.subtotal, 0)
    const valorDesconto = (subtotal * descontoPercentual) / 100
    const total = subtotal - valorDesconto
    
    return { subtotal, valorDesconto, total }
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

    try {
      const { subtotal, total } = calcularTotais()
      
      const vendaData = {
        cliente_id: clienteSelecionado,
        usuario_id: profile.id,
        total: subtotal,
        desconto: descontoPercentual,
        desconto_aplicado: subtotal - total,
        total_final: total
      }

      const { error } = await createVenda(vendaData, itensVenda)

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao finalizar venda: " + (error.message || 'Erro desconhecido'),
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Sucesso",
        description: "Venda realizada com sucesso!"
      })

      // Limpar formulário
      setItensVenda([])
      setClienteSelecionado("")
      setDescontoPercentual(0)
      
      // Recarregar dados para atualizar estoque
      carregarDados()
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao finalizar venda",
        variant: "destructive"
      })
    }
  }

  const { subtotal, valorDesconto, total } = calcularTotais()

  if (loading) {
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
        {/* Produtos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {produtos.map((produto) => (
                <Card key={produto.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{produto.nome}</h3>
                      <Badge variant="secondary">{produto.categoria}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">R$ {produto.preco.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {produto.estoque}
                        </p>
                      </div>
                      <Button
                        onClick={() => adicionarItem(produto)}
                        size="sm"
                        disabled={produto.estoque <= 0}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Carrinho de Compras */}
        <Card>
          <CardHeader>
            <CardTitle>Carrinho de Compras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seleção de Cliente */}
            <div>
              <Label>Cliente *</Label>
              <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{cliente.nome}</span>
                        <Badge variant="outline" className="ml-auto">
                          {cliente.categoria}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campo de Desconto */}
            <div>
              <Label>Desconto (%)</Label>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={descontoPercentual}
                  onChange={(e) => setDescontoPercentual(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Itens do Carrinho */}
            {itensVenda.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Carrinho vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itensVenda.map((item) => (
                      <TableRow key={item.produto_id}>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => alterarQuantidade(item.produto_id, item.quantidade - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantidade}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => alterarQuantidade(item.produto_id, item.quantidade + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>R$ {item.preco_unitario.toFixed(2)}</TableCell>
                        <TableCell>R$ {item.subtotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerItem(item.produto_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Totais */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {descontoPercentual > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({descontoPercentual}%):</span>
                      <span>-R$ {valorDesconto.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button onClick={finalizarVenda} className="w-full" size="lg">
                  Finalizar Venda
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

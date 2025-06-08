
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, ShoppingCart, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Produto {
  id: string
  nome: string
  categoria: "Ingresso" | "Ingresso evento" | "Produtos"
  preco: number
  estoque: number
}

interface Cliente {
  id: string
  nome: string
  categoria: "Bronze" | "Prata" | "Ouro" | "Diamante"
}

interface ItemVenda {
  produto: Produto
  quantidade: number
  desconto?: number
}

export function PontoVenda() {
  const { toast } = useToast()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("")
  const [quantidade, setQuantidade] = useState<number>(1)
  const [descontoPersonalizado, setDescontoPersonalizado] = useState<number>(0)

  // Carregar dados do localStorage
  useEffect(() => {
    const produtosSalvos = localStorage.getItem('estoque')
    const clientesSalvos = localStorage.getItem('clientes')
    
    if (produtosSalvos) {
      setProdutos(JSON.parse(produtosSalvos))
    }
    
    if (clientesSalvos) {
      setClientes(JSON.parse(clientesSalvos))
    }
  }, [])

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um produto",
        variant: "destructive"
      })
      return
    }

    const produto = produtos.find(p => p.id === produtoSelecionado)
    if (!produto) return

    if (produto.estoque < quantidade) {
      toast({
        title: "Erro",
        description: "Estoque insuficiente",
        variant: "destructive"
      })
      return
    }

    const itemExistente = carrinho.find(item => item.produto.id === produto.id)
    
    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.produto.id === produto.id 
          ? { ...item, quantidade: item.quantidade + quantidade }
          : item
      ))
    } else {
      setCarrinho([...carrinho, { produto, quantidade }])
    }

    setProdutoSelecionado("")
    setQuantidade(1)
  }

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter(item => item.produto.id !== produtoId))
  }

  const aplicarDesconto = (produtoId: string, desconto: number) => {
    setCarrinho(carrinho.map(item => 
      item.produto.id === produtoId 
        ? { ...item, desconto }
        : item
    ))
  }

  const calcularDescontoFidelidade = () => {
    if (!clienteSelecionado) return 0
    
    const descontos = {
      "Bronze": 0,
      "Prata": 5,
      "Ouro": 10,
      "Diamante": 15
    }
    
    return descontos[clienteSelecionado.categoria]
  }

  const calcularTotal = () => {
    const subtotal = carrinho.reduce((total, item) => {
      const precoComDesconto = item.produto.preco * (1 - (item.desconto || 0) / 100)
      return total + (precoComDesconto * item.quantidade)
    }, 0)

    const descontoFidelidade = calcularDescontoFidelidade()
    const totalComFidelidade = subtotal * (1 - descontoFidelidade / 100)
    const descontoAdicional = totalComFidelidade * (descontoPersonalizado / 100)
    
    return totalComFidelidade - descontoAdicional
  }

  const finalizarVenda = () => {
    if (!clienteSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para efetuar a venda",
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

    // Atualizar estoque
    const produtosAtualizados = produtos.map(produto => {
      const itemCarrinho = carrinho.find(item => item.produto.id === produto.id)
      if (itemCarrinho) {
        return { ...produto, estoque: produto.estoque - itemCarrinho.quantidade }
      }
      return produto
    })

    localStorage.setItem('estoque', JSON.stringify(produtosAtualizados))
    setProdutos(produtosAtualizados)

    // Registrar compra para fidelidade
    const compra = {
      clienteId: clienteSelecionado.id,
      itens: carrinho,
      total: calcularTotal(),
      data: new Date().toISOString()
    }

    const comprasExistentes = JSON.parse(localStorage.getItem('compras') || '[]')
    localStorage.setItem('compras', JSON.stringify([...comprasExistentes, compra]))

    // Limpar carrinho
    setCarrinho([])
    setClienteSelecionado(null)
    setDescontoPersonalizado(0)

    toast({
      title: "Sucesso",
      description: "Venda realizada com sucesso!",
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Ponto de Venda</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Cliente e Produtos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecionar Cliente *</Label>
                <Select value={clienteSelecionado?.id || ""} onValueChange={(value) => {
                  const cliente = clientes.find(c => c.id === value)
                  setClienteSelecionado(cliente || null)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome} ({cliente.categoria})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {clienteSelecionado && (
                <div className="p-3 bg-ice-blue/10 rounded-lg">
                  <p><strong>Cliente:</strong> {clienteSelecionado.nome}</p>
                  <p><strong>Categoria:</strong> {clienteSelecionado.categoria}</p>
                  <p><strong>Desconto Fidelidade:</strong> {calcularDescontoFidelidade()}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adicionar Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Produto</Label>
                <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.filter(p => p.estoque > 0).map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} - R$ {produto.preco.toFixed(2)} (Estoque: {produto.estoque})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                />
              </div>

              <Button onClick={adicionarAoCarrinho} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Carrinho de Compras</CardTitle>
            </CardHeader>
            <CardContent>
              {carrinho.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Carrinho vazio</p>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrinho.map((item) => (
                        <TableRow key={item.produto.id}>
                          <TableCell>{item.produto.nome}</TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>R$ {item.produto.preco.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={item.desconto || 0}
                                onChange={(e) => aplicarDesconto(item.produto.id, Number(e.target.value))}
                                className="w-16"
                              />
                              <span>%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            R$ {((item.produto.preco * (1 - (item.desconto || 0) / 100)) * item.quantidade).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerDoCarrinho(item.produto.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <Label>Desconto Adicional:</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={descontoPersonalizado}
                          onChange={(e) => setDescontoPersonalizado(Number(e.target.value))}
                          className="w-20"
                        />
                        <span>%</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDescontoPersonalizado(0)}
                        >
                          <Percent className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-right">
                      {clienteSelecionado && calcularDescontoFidelidade() > 0 && (
                        <p>Desconto Fidelidade ({calcularDescontoFidelidade()}%): 
                          R$ {(carrinho.reduce((total, item) => {
                            const precoComDesconto = item.produto.preco * (1 - (item.desconto || 0) / 100)
                            return total + (precoComDesconto * item.quantidade)
                          }, 0) * calcularDescontoFidelidade() / 100).toFixed(2)}
                        </p>
                      )}
                      {descontoPersonalizado > 0 && (
                        <p>Desconto Adicional ({descontoPersonalizado}%): 
                          R$ {((carrinho.reduce((total, item) => {
                            const precoComDesconto = item.produto.preco * (1 - (item.desconto || 0) / 100)
                            return total + (precoComDesconto * item.quantidade)
                          }, 0) * (1 - calcularDescontoFidelidade() / 100)) * descontoPersonalizado / 100).toFixed(2)}
                        </p>
                      )}
                      <p className="text-2xl font-bold">
                        Total: R$ {calcularTotal().toFixed(2)}
                      </p>
                    </div>

                    <Button 
                      onClick={finalizarVenda} 
                      className="w-full"
                      disabled={!clienteSelecionado || carrinho.length === 0}
                    >
                      Finalizar Venda
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

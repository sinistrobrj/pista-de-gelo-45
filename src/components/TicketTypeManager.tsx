
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tickets, Plus, Edit, Trash2, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getProdutos, getClientes, createVenda, updateProduto } from "@/lib/supabase-utils"

interface Produto {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  descricao?: string
}

interface Cliente {
  id: string
  nome: string
  email: string
  categoria: string
}

interface ItemVenda {
  produto_id: string
  nome: string
  quantidade: number
  preco_unitario: number
  subtotal: number
}

export function TicketTypeManager() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVendaDialogOpen, setIsVendaDialogOpen] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Ingresso',
    preco: '',
    estoque: '',
    descricao: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [produtosResult, clientesResult] = await Promise.all([
        getProdutos(),
        getClientes()
      ])

      if (!produtosResult.error) {
        setProdutos(produtosResult.data.filter(p => 
          p.categoria === 'Ingresso' || p.categoria === 'Ingresso evento'
        ))
      }

      if (!clientesResult.error) {
        setClientes(clientesResult.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.preco) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const dadosProduto = {
        nome: formData.nome,
        categoria: formData.categoria,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque) || 0,
        descricao: formData.descricao || null
      }

      if (produtoEditando) {
        const { error } = await updateProduto(produtoEditando.id, dadosProduto)
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Ingresso atualizado com sucesso!"
        })
      } else {
        // Implementar criação se necessário
        toast({
          title: "Info",
          description: "Funcionalidade de criação será implementada em breve"
        })
      }

      setIsDialogOpen(false)
      setProdutoEditando(null)
      setFormData({ nome: '', categoria: 'Ingresso', preco: '', estoque: '', descricao: '' })
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar ingresso:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar ingresso",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const editarProduto = (produto: Produto) => {
    setProdutoEditando(produto)
    setFormData({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString(),
      descricao: produto.descricao || ''
    })
    setIsDialogOpen(true)
  }

  const adicionarAoCarrinho = (produto: Produto) => {
    if (produto.estoque <= 0) {
      toast({
        title: "Estoque insuficiente",
        description: "Este ingresso não está disponível",
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

  const finalizarVenda = async () => {
    if (itensVenda.length === 0 || !clienteSelecionado || !profile?.id) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e adicione itens à venda",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const total = itensVenda.reduce((sum, item) => sum + item.subtotal, 0)
      
      const vendaData = {
        cliente_id: clienteSelecionado.id,
        usuario_id: profile.id,
        total,
        desconto: 0,
        total_final: total,
        data: new Date().toISOString()
      }

      const { error } = await createVenda(vendaData, itensVenda)
      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Venda de ingressos realizada com sucesso!"
      })

      setItensVenda([])
      setClienteSelecionado(null)
      setIsVendaDialogOpen(false)
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

  const ingressosDisponiveis = produtos.filter(p => p.estoque > 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tickets className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestão de Ingressos</h1>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isVendaDialogOpen} onOpenChange={setIsVendaDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Vender Ingressos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Venda de Ingressos</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Seleção de Cliente */}
                <div>
                  <Label>Cliente</Label>
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
                          {cliente.nome} - {cliente.categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ingressos Disponíveis */}
                <div>
                  <Label>Ingressos Disponíveis</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ingressosDisponiveis.map((produto) => (
                      <div key={produto.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{produto.nome}</h4>
                        <p className="text-sm text-muted-foreground">R$ {produto.preco.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Disponível: {produto.estoque}</p>
                        <Button 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => adicionarAoCarrinho(produto)}
                        >
                          Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carrinho */}
                {itensVenda.length > 0 && (
                  <div>
                    <Label>Itens Selecionados</Label>
                    <div className="space-y-2 mt-2">
                      {itensVenda.map((item) => (
                        <div key={item.produto_id} className="flex justify-between items-center p-2 border rounded">
                          <span>{item.nome} x{item.quantidade}</span>
                          <span>R$ {item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>R$ {itensVenda.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={finalizarVenda} 
                  className="w-full"
                  disabled={loading || itensVenda.length === 0 || !clienteSelecionado}
                >
                  {loading ? "Processando..." : "Finalizar Venda"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Novo Ingresso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {produtoEditando ? 'Editar Ingresso' : 'Novo Ingresso'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campos do formulário existentes */}
                <div>
                  <Label htmlFor="nome">Nome do Ingresso *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Ingresso Adulto - Patinação Livre"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ingresso">Ingresso</SelectItem>
                      <SelectItem value="Ingresso evento">Ingresso Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preco">Preço *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="estoque">Quantidade Disponível</Label>
                  <Input
                    id="estoque"
                    type="number"
                    value={formData.estoque}
                    onChange={(e) => setFormData({...formData, estoque: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Salvando..." : produtoEditando ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Ingressos */}
      <Card>
        <CardHeader>
          <CardTitle>Ingressos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {produtos.length === 0 ? (
            <div className="text-center py-8">
              <Tickets className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum ingresso cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>{produto.categoria}</TableCell>
                    <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
                    <TableCell>{produto.estoque}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        produto.estoque > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {produto.estoque > 0 ? 'Disponível' : 'Esgotado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editarProduto(produto)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

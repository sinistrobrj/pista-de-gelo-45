
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Package, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getProdutos, createProduto, updateProduto, deleteProduto } from "@/lib/supabase-utils"

interface Produto {
  id: string
  nome: string
  categoria: "Ingresso" | "Ingresso evento" | "Produtos"
  preco: number
  estoque: number
  descricao?: string
}

export function Estoque() {
  const { toast } = useToast()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [form, setForm] = useState({
    nome: "",
    categoria: "" as "Ingresso" | "Ingresso evento" | "Produtos" | "",
    preco: "",
    estoque: "",
    descricao: ""
  })

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    console.log('Carregando produtos do estoque...')
    setLoadingData(true)
    try {
      const result = await getProdutos()
      console.log('Resultado produtos:', result)

      if (result.error) {
        console.error('Erro ao carregar produtos:', result.error)
        toast({
          title: "Erro",
          description: "Erro ao carregar produtos: " + result.error.message,
          variant: "destructive"
        })
      } else {
        console.log('Produtos carregados no estoque:', result.data)
        setProdutos(result.data || [])
      }
    } catch (error) {
      console.error('Erro geral ao carregar produtos:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos do sistema",
        variant: "destructive"
      })
    } finally {
      setLoadingData(false)
    }
  }

  const resetForm = () => {
    setForm({
      nome: "",
      categoria: "",
      preco: "",
      estoque: "",
      descricao: ""
    })
    setEditandoProduto(null)
  }

  const abrirDialog = (produto?: Produto) => {
    if (produto) {
      setEditandoProduto(produto)
      setForm({
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco.toString(),
        estoque: produto.estoque.toString(),
        descricao: produto.descricao || ""
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const fecharDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const salvarProduto = async () => {
    if (!form.nome || !form.categoria || !form.preco || !form.estoque) {
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
        nome: form.nome,
        categoria: form.categoria as "Ingresso" | "Ingresso evento" | "Produtos",
        preco: parseFloat(form.preco),
        estoque: parseInt(form.estoque),
        descricao: form.descricao || null
      }

      if (editandoProduto) {
        const { error } = await updateProduto(editandoProduto.id, dadosProduto)
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!"
        })
      } else {
        const { error } = await createProduto(dadosProduto)
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Produto cadastrado com sucesso!"
        })
      }

      fecharDialog()
      carregarProdutos()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const excluirProduto = async (id: string) => {
    try {
      const { error } = await deleteProduto(id)
      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!"
      })
      
      carregarProdutos()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast({
        title: "Erro",
        description: "Erro ao excluir produto",
        variant: "destructive"
      })
    }
  }

  const filtrarPorCategoria = (categoria: string) => {
    if (categoria === "Todos") return produtos
    return produtos.filter(p => p.categoria === categoria)
  }

  const [filtroCategoria, setFiltroCategoria] = useState("Todos")
  const produtosFiltrados = filtrarPorCategoria(filtroCategoria)

  if (loadingData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando dados do estoque...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editandoProduto ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Produto *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Digite o nome do produto"
                />
              </div>
              
              <div>
                <Label>Categoria *</Label>
                <Select value={form.categoria} onValueChange={(value) => setForm({ ...form, categoria: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ingresso">Ingresso</SelectItem>
                    <SelectItem value="Ingresso evento">Ingresso evento</SelectItem>
                    <SelectItem value="Produtos">Produtos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label>Quantidade em Estoque *</Label>
                  <Input
                    type="number"
                    value={form.estoque}
                    onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descrição opcional do produto"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={salvarProduto} className="flex-1" disabled={loading}>
                  {loading ? "Salvando..." : editandoProduto ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button variant="outline" onClick={fecharDialog}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos em Estoque</CardTitle>
            <div className="flex items-center gap-4">
              <Label>Filtrar por categoria:</Label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Ingresso">Ingresso</SelectItem>
                  <SelectItem value="Ingresso evento">Ingresso evento</SelectItem>
                  <SelectItem value="Produtos">Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum produto cadastrado</p>
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
                {produtosFiltrados.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        produto.categoria === "Ingresso" ? "bg-blue-100 text-blue-800" :
                        produto.categoria === "Ingresso evento" ? "bg-green-100 text-green-800" :
                        "bg-purple-100 text-purple-800"
                      }`}>
                        {produto.categoria}
                      </span>
                    </TableCell>
                    <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
                    <TableCell>{produto.estoque}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        produto.estoque === 0 ? "bg-red-100 text-red-800" :
                        produto.estoque <= 5 ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {produto.estoque === 0 ? "Sem estoque" :
                         produto.estoque <= 5 ? "Estoque baixo" :
                         "Disponível"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirDialog(produto)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirProduto(produto.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{produtos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sem Estoque</p>
                <p className="text-2xl font-bold">{produtos.filter(p => p.estoque === 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold">{produtos.filter(p => p.estoque > 0 && p.estoque <= 5).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

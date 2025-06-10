import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users, Edit, Trash2, Package, Shield, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getClientes, createCliente, updateCliente, getProdutos, createProduto, updateProduto, createSystemUser } from "@/lib/supabase-utils"
import { PhoneInput } from "./PhoneInput"

interface Cliente {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
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
  descricao?: string
}

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: "Administrador" | "Funcionario"
  permissoes: string[]
  ativo: boolean
  senha_temporaria?: string
}

export function Cadastro() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false)
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false)
  const [isUsuarioDialogOpen, setIsUsuarioDialogOpen] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(false)

  const [clienteForm, setClienteForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  })

  const [produtoForm, setProdutoForm] = useState({
    nome: '',
    categoria: 'Produtos',
    preco: '',
    estoque: '',
    descricao: ''
  })

  const [usuarioForm, setUsuarioForm] = useState({
    nome: '',
    email: '',
    tipo: 'Funcionario' as "Administrador" | "Funcionario",
    permissoes: [] as string[]
  })

  const permissoesDisponiveis = [
    "vendas",
    "estoque", 
    "relatorios",
    "clientes",
    "eventos",
    "pista"
  ]

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const [clientesResult, produtosResult] = await Promise.all([
        getClientes(),
        getProdutos()
      ])

      if (!clientesResult.error) {
        setClientes(clientesResult.data)
      }

      if (!produtosResult.error) {
        setProdutos(produtosResult.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleClienteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clienteForm.nome) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      })
      return
    }

    // Validar telefone (deve ter 11 dígitos)
    const telefoneNumeros = clienteForm.telefone.replace(/\D/g, '')
    if (clienteForm.telefone && telefoneNumeros.length !== 11) {
      toast({
        title: "Erro",
        description: "Telefone deve ter 11 dígitos no formato (12) 34567-8900",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const dadosCliente = {
        nome: clienteForm.nome,
        email: clienteForm.email || null,
        telefone: clienteForm.telefone || null,
        cpf: clienteForm.cpf || null,
        categoria: 'Bronze'
      }

      if (clienteEditando) {
        const { error } = await updateCliente(clienteEditando.id, dadosCliente)
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso!"
        })
      } else {
        const { error } = await createCliente(dadosCliente)
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Cliente cadastrado com sucesso!"
        })
      }

      setIsClienteDialogOpen(false)
      setClienteEditando(null)
      setClienteForm({ nome: '', email: '', telefone: '', cpf: '' })
      carregarDados()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProdutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!produtoForm.nome || !produtoForm.preco) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const dadosProduto = {
        nome: produtoForm.nome,
        categoria: produtoForm.categoria,
        preco: parseFloat(produtoForm.preco),
        estoque: parseInt(produtoForm.estoque) || 0,
        descricao: produtoForm.descricao || null
      }

      if (produtoEditando) {
        const { error } = await updateProduto(produtoEditando.id, dadosProduto)
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

      setIsProdutoDialogOpen(false)
      setProdutoEditando(null)
      setProdutoForm({ nome: '', categoria: 'Produtos', preco: '', estoque: '', descricao: '' })
      carregarDados()
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

  const handleUsuarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!usuarioForm.nome || !usuarioForm.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await createSystemUser(usuarioForm)
      
      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: `Usuário criado! Senha temporária: ${data.senha_temporaria}`,
        duration: 10000
      })

      setIsUsuarioDialogOpen(false)
      setUsuarioForm({ nome: '', email: '', tipo: 'Funcionario', permissoes: [] })
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const editarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente)
    setClienteForm({
      nome: cliente.nome,
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      cpf: cliente.cpf || ''
    })
    setIsClienteDialogOpen(true)
  }

  const editarProduto = (produto: Produto) => {
    setProdutoEditando(produto)
    setProdutoForm({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco.toString(),
      estoque: produto.estoque.toString(),
      descricao: produto.descricao || ''
    })
    setIsProdutoDialogOpen(true)
  }

  const isAdmin = profile?.tipo === "Administrador"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Cadastros</h1>
      </div>

      <Tabs defaultValue="clientes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="clientes">
            <Users className="w-4 h-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <Package className="w-4 h-4 mr-2" />
            Produtos
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="usuarios">
              <Shield className="w-4 h-4 mr-2" />
              Usuários do Sistema
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="clientes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Clientes</CardTitle>
              <Dialog open={isClienteDialogOpen} onOpenChange={setIsClienteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleClienteSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={clienteForm.nome}
                        onChange={(e) => setClienteForm({...clienteForm, nome: e.target.value})}
                        placeholder="Nome completo"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clienteForm.email}
                        onChange={(e) => setClienteForm({...clienteForm, email: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <PhoneInput
                        value={clienteForm.telefone}
                        onChange={(value) => setClienteForm({...clienteForm, telefone: value})}
                        placeholder="(12) 34567-8900"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formato: (12) 34567-8900 (11 dígitos)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={clienteForm.cpf}
                        onChange={(e) => setClienteForm({...clienteForm, cpf: e.target.value})}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Salvando..." : clienteEditando ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {clientes.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.email || '-'}</TableCell>
                        <TableCell>{cliente.telefone || '-'}</TableCell>
                        <TableCell>{cliente.categoria}</TableCell>
                        <TableCell>{cliente.pontos}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editarCliente(cliente)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produtos</CardTitle>
              <Dialog open={isProdutoDialogOpen} onOpenChange={setIsProdutoDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Package className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleProdutoSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nome-produto">Nome *</Label>
                      <Input
                        id="nome-produto"
                        value={produtoForm.nome}
                        onChange={(e) => setProdutoForm({...produtoForm, nome: e.target.value})}
                        placeholder="Nome do produto"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="categoria-produto">Categoria</Label>
                      <Select value={produtoForm.categoria} onValueChange={(value) => setProdutoForm({...produtoForm, categoria: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ingresso">Ingresso</SelectItem>
                          <SelectItem value="Ingresso evento">Ingresso Evento</SelectItem>
                          <SelectItem value="Produtos">Produtos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="preco-produto">Preço *</Label>
                      <Input
                        id="preco-produto"
                        type="number"
                        step="0.01"
                        value={produtoForm.preco}
                        onChange={(e) => setProdutoForm({...produtoForm, preco: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="estoque-produto">Estoque</Label>
                      <Input
                        id="estoque-produto"
                        type="number"
                        value={produtoForm.estoque}
                        onChange={(e) => setProdutoForm({...produtoForm, estoque: e.target.value})}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="descricao-produto">Descrição</Label>
                      <Input
                        id="descricao-produto"
                        value={produtoForm.descricao}
                        onChange={(e) => setProdutoForm({...produtoForm, descricao: e.target.value})}
                        placeholder="Descrição do produto"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Salvando..." : produtoEditando ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {produtos.length === 0 ? (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editarProduto(produto)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="usuarios">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuários do Sistema</CardTitle>
                <Dialog open={isUsuarioDialogOpen} onOpenChange={setIsUsuarioDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Shield className="w-4 h-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Usuário do Sistema</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleUsuarioSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="nome-usuario">Nome *</Label>
                        <Input
                          id="nome-usuario"
                          value={usuarioForm.nome}
                          onChange={(e) => setUsuarioForm({...usuarioForm, nome: e.target.value})}
                          placeholder="Nome completo"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email-usuario">Email *</Label>
                        <Input
                          id="email-usuario"
                          type="email"
                          value={usuarioForm.email}
                          onChange={(e) => setUsuarioForm({...usuarioForm, email: e.target.value})}
                          placeholder="email@exemplo.com"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="tipo-usuario">Tipo de Usuário</Label>
                        <Select value={usuarioForm.tipo} onValueChange={(value: "Administrador" | "Funcionario") => setUsuarioForm({...usuarioForm, tipo: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Funcionario">Funcionário</SelectItem>
                            <SelectItem value="Administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {usuarioForm.tipo === "Funcionario" && (
                        <div>
                          <Label>Permissões</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {permissoesDisponiveis.map((permissao) => (
                              <div key={permissao} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`perm-${permissao}`}
                                  checked={usuarioForm.permissoes.includes(permissao)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setUsuarioForm({
                                        ...usuarioForm,
                                        permissoes: [...usuarioForm.permissoes, permissao]
                                      })
                                    } else {
                                      setUsuarioForm({
                                        ...usuarioForm,
                                        permissoes: usuarioForm.permissoes.filter(p => p !== permissao)
                                      })
                                    }
                                  }}
                                />
                                <label htmlFor={`perm-${permissao}`} className="text-sm capitalize">
                                  {permissao}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Criando..." : "Criar Usuário"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Gerencie usuários do sistema na seção "Usuários" no menu de administração
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

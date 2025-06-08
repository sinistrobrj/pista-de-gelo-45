
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users, Shield, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: "Administrador" | "Funcionario"
  permissoes: string[]
}

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  categoria: "Bronze" | "Prata" | "Ouro" | "Diamante"
}

// Simulando usuário logado
const usuarioLogado = {
  tipo: "Administrador" // ou "Funcionario"
}

export function Cadastro() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  
  const [formUsuario, setFormUsuario] = useState({
    nome: "",
    email: "",
    tipo: "" as "Administrador" | "Funcionario" | "",
    permissoes: [] as string[]
  })

  const [formCliente, setFormCliente] = useState({
    nome: "",
    email: "",
    telefone: ""
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

  const carregarDados = () => {
    const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const clientesSalvos = JSON.parse(localStorage.getItem('clientes') || '[]')
    
    setUsuarios(usuariosSalvos)
    setClientes(clientesSalvos)
  }

  const cadastrarUsuario = () => {
    if (!formUsuario.nome || !formUsuario.email || !formUsuario.tipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    // Verificar se é administrador tentando cadastrar funcionário/admin
    if (usuarioLogado.tipo === "Funcionario" && formUsuario.tipo !== "Funcionario") {
      toast({
        title: "Erro",
        description: "Funcionários só podem cadastrar clientes",
        variant: "destructive"
      })
      return
    }

    const novoUsuario: Usuario = {
      id: Date.now().toString(),
      nome: formUsuario.nome,
      email: formUsuario.email,
      tipo: formUsuario.tipo,
      permissoes: formUsuario.tipo === "Administrador" ? permissoesDisponiveis : formUsuario.permissoes
    }

    const novosUsuarios = [...usuarios, novoUsuario]
    localStorage.setItem('usuarios', JSON.stringify(novosUsuarios))
    setUsuarios(novosUsuarios)

    setFormUsuario({
      nome: "",
      email: "",
      tipo: "",
      permissoes: []
    })

    toast({
      title: "Sucesso",
      description: `${formUsuario.tipo} cadastrado com sucesso`,
    })
  }

  const cadastrarCliente = () => {
    if (!formCliente.nome || !formCliente.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    const novoCliente: Cliente = {
      id: Date.now().toString(),
      nome: formCliente.nome,
      email: formCliente.email,
      telefone: formCliente.telefone,
      categoria: "Bronze" // Categoria inicial
    }

    const novosClientes = [...clientes, novoCliente]
    localStorage.setItem('clientes', JSON.stringify(novosClientes))
    setClientes(novosClientes)

    setFormCliente({
      nome: "",
      email: "",
      telefone: ""
    })

    toast({
      title: "Sucesso",
      description: "Cliente cadastrado com sucesso",
    })
  }

  const togglePermissao = (permissao: string) => {
    const permissoes = formUsuario.permissoes.includes(permissao)
      ? formUsuario.permissoes.filter(p => p !== permissao)
      : [...formUsuario.permissoes, permissao]
    
    setFormUsuario({ ...formUsuario, permissoes })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Cadastro</h1>
      </div>

      <Tabs defaultValue="clientes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="usuarios" disabled={usuarioLogado.tipo !== "Administrador"}>
            Usuários do Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <CardTitle>Cadastrar Cliente</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formCliente.nome}
                    onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })}
                    placeholder="Digite o nome completo"
                  />
                </div>
                
                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={formCliente.email}
                    onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>

              <div>
                <Label>Telefone</Label>
                <Input
                  value={formCliente.telefone}
                  onChange={(e) => setFormCliente({ ...formCliente, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <Button onClick={cadastrarCliente} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Cliente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clientes Cadastrados ({clientes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {clientes.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum cliente cadastrado
                </p>
              ) : (
                <div className="space-y-2">
                  {clientes.slice(-5).map((cliente) => (
                    <div key={cliente.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">{cliente.email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {cliente.categoria}
                      </div>
                    </div>
                  ))}
                  {clientes.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground">
                      E mais {clientes.length - 5} clientes...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <CardTitle>Cadastrar Usuário do Sistema</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formUsuario.nome}
                    onChange={(e) => setFormUsuario({ ...formUsuario, nome: e.target.value })}
                    placeholder="Digite o nome completo"
                  />
                </div>
                
                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={formUsuario.email}
                    onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                    placeholder="usuario@email.com"
                  />
                </div>
              </div>

              <div>
                <Label>Tipo de Usuário *</Label>
                <Select value={formUsuario.tipo} onValueChange={(value) => setFormUsuario({ ...formUsuario, tipo: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Funcionario">Funcionário</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formUsuario.tipo === "Funcionario" && (
                <div>
                  <Label>Permissões</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {permissoesDisponiveis.map((permissao) => (
                      <div key={permissao} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permissao}
                          checked={formUsuario.permissoes.includes(permissao)}
                          onChange={() => togglePermissao(permissao)}
                          className="rounded"
                        />
                        <label htmlFor={permissao} className="text-sm capitalize">
                          {permissao}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={cadastrarUsuario} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Usuário
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema ({usuarios.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {usuarios.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum usuário cadastrado
                </p>
              ) : (
                <div className="space-y-2">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {usuario.tipo === "Administrador" ? (
                          <Shield className="w-5 h-5 text-red-500" />
                        ) : (
                          <User className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{usuario.tipo}</p>
                        {usuario.tipo === "Funcionario" && (
                          <p className="text-xs text-muted-foreground">
                            {usuario.permissoes.length} permissões
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

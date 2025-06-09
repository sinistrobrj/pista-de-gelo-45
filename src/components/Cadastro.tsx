import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users, Shield, User, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { createCliente, getClientes, createSystemUser, getUsuarios } from "@/lib/supabase-utils"

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: "Administrador" | "Funcionario"
  permissoes: string[]
  senha_temporaria?: string
}

interface Cliente {
  id: string
  nome: string
  cpf: string
  telefone: string
  categoria: "Bronze" | "Prata" | "Ouro" | "Diamante"
}

export function Cadastro() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mostrarSenha, setMostrarSenha] = useState<{ [key: string]: boolean }>({})
  
  const [formUsuario, setFormUsuario] = useState({
    nome: "",
    email: "",
    tipo: "" as "Administrador" | "Funcionario" | "",
    permissoes: [] as string[]
  })

  const [formCliente, setFormCliente] = useState({
    nome: "",
    cpf: "",
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

  const carregarDados = async () => {
    try {
      const [clientesData, usuariosData] = await Promise.all([
        getClientes(),
        getUsuarios()
      ])
      
      if (clientesData.error) {
        console.error('Erro ao carregar clientes:', clientesData.error)
      } else {
        setClientes(clientesData.data)
      }

      if (usuariosData.error) {
        console.error('Erro ao carregar usuários:', usuariosData.error)
      } else {
        setUsuarios(usuariosData.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const formatarCPF = (cpf: string) => {
    const numeros = cpf.replace(/\D/g, '')
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  }

  const validarCPF = (cpf: string) => {
    const numeros = cpf.replace(/\D/g, '')
    return numeros.length === 11
  }

  const cadastrarUsuario = async () => {
    if (!formUsuario.nome || !formUsuario.email || !formUsuario.tipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    // Verificar se é administrador
    console.log('Perfil do usuário:', profile)
    if (profile?.tipo !== "Administrador") {
      toast({
        title: "Erro",
        description: "Apenas administradores podem cadastrar usuários do sistema",
        variant: "destructive"
      })
      return
    }

    try {
      const { data, error } = await createSystemUser({
        nome: formUsuario.nome,
        email: formUsuario.email,
        tipo: formUsuario.tipo,
        permissoes: formUsuario.tipo === "Administrador" ? permissoesDisponiveis : formUsuario.permissoes
      })

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao cadastrar usuário: " + (error.message || 'Erro desconhecido'),
          variant: "destructive"
        })
        return
      }

      await carregarDados()

      setFormUsuario({
        nome: "",
        email: "",
        tipo: "",
        permissoes: []
      })

      toast({
        title: "Sucesso",
        description: `${formUsuario.tipo} cadastrado com sucesso! Senha temporária: ${data?.senha_temporaria}`,
      })
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao cadastrar usuário",
        variant: "destructive"
      })
    }
  }

  const cadastrarCliente = async () => {
    if (!formCliente.nome || !formCliente.cpf) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    if (!validarCPF(formCliente.cpf)) {
      toast({
        title: "Erro",
        description: "CPF deve ter 11 dígitos",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await createCliente({
        nome: formCliente.nome,
        cpf: formCliente.cpf.replace(/\D/g, ''),
        telefone: formCliente.telefone,
        categoria: "Bronze"
      })

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao cadastrar cliente: " + (error.message || 'Erro desconhecido'),
          variant: "destructive"
        })
        return
      }

      await carregarDados()

      setFormCliente({
        nome: "",
        cpf: "",
        telefone: ""
      })

      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso",
      })
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao cadastrar cliente",
        variant: "destructive"
      })
    }
  }

  const togglePermissao = (permissao: string) => {
    const permissoes = formUsuario.permissoes.includes(permissao)
      ? formUsuario.permissoes.filter(p => p !== permissao)
      : [...formUsuario.permissoes, permissao]
    
    setFormUsuario({ ...formUsuario, permissoes })
  }

  const toggleMostrarSenha = (usuarioId: string) => {
    setMostrarSenha(prev => ({
      ...prev,
      [usuarioId]: !prev[usuarioId]
    }))
  }

  // Verificar se pode acessar aba de usuários
  const podeAcessarUsuarios = profile?.tipo === "Administrador"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Cadastro</h1>
      </div>

      <Tabs defaultValue="clientes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="usuarios" disabled={!podeAcessarUsuarios}>
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
                  <Label>CPF *</Label>
                  <Input
                    value={formCliente.cpf}
                    onChange={(e) => setFormCliente({ ...formCliente, cpf: formatarCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
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
                        <p className="text-sm text-muted-foreground">CPF: {formatarCPF(cliente.cpf)}</p>
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
          {!podeAcessarUsuarios ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Acesso restrito a administradores
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
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
                              {usuario.senha_temporaria && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-blue-600">
                                    Senha: {mostrarSenha[usuario.id] ? usuario.senha_temporaria : '••••••••'}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleMostrarSenha(usuario.id)}
                                    className="h-4 w-4 p-0"
                                  >
                                    {mostrarSenha[usuario.id] ? (
                                      <EyeOff className="w-3 h-3" />
                                    ) : (
                                      <Eye className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{usuario.tipo}</p>
                            {usuario.tipo === "Funcionario" && (
                              <p className="text-xs text-muted-foreground">
                                {usuario.permissoes?.length || 0} permissões
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

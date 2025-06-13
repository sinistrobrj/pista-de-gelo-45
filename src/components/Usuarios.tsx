
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Shield, Edit, Trash2, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: "Administrador" | "Funcionario"
  permissoes: string[]
  ativo: boolean
  ultimoLogin?: string
}

export function Usuarios() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const permissoesDisponiveis = [
    "vendas",
    "estoque", 
    "relatorios",
    "clientes",
    "eventos",
    "pista"
  ]

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = () => {
    const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios') || '[]')
    setUsuarios(usuariosSalvos)
  }

  const salvarUsuarios = (novosUsuarios: Usuario[]) => {
    localStorage.setItem('usuarios', JSON.stringify(novosUsuarios))
    setUsuarios(novosUsuarios)
  }

  const alterarStatusUsuario = (id: string) => {
    const novosUsuarios = usuarios.map(usuario => 
      usuario.id === id ? { ...usuario, ativo: !usuario.ativo } : usuario
    )
    salvarUsuarios(novosUsuarios)
    
    const usuario = usuarios.find(u => u.id === id)
    toast({
      title: "Sucesso",
      description: `Usuário ${usuario?.ativo ? 'desativado' : 'ativado'} com sucesso`,
    })
  }

  const excluirUsuario = (id: string) => {
    const novosUsuarios = usuarios.filter(usuario => usuario.id !== id)
    salvarUsuarios(novosUsuarios)
    toast({
      title: "Sucesso",
      description: "Usuário excluído com sucesso",
    })
  }

  const abrirPermissoes = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario)
    setIsDialogOpen(true)
  }

  const alterarPermissao = (permissao: string) => {
    if (!usuarioSelecionado) return
    
    const novasPermissoes = usuarioSelecionado.permissoes.includes(permissao)
      ? usuarioSelecionado.permissoes.filter(p => p !== permissao)
      : [...usuarioSelecionado.permissoes, permissao]
    
    setUsuarioSelecionado({
      ...usuarioSelecionado,
      permissoes: novasPermissoes
    })
  }

  const salvarPermissoes = () => {
    if (!usuarioSelecionado) return
    
    const novosUsuarios = usuarios.map(usuario => 
      usuario.id === usuarioSelecionado.id ? usuarioSelecionado : usuario
    )
    salvarUsuarios(novosUsuarios)
    setIsDialogOpen(false)
    setUsuarioSelecionado(null)
    
    toast({
      title: "Sucesso",
      description: "Permissões atualizadas com sucesso",
    })
  }

  const estatisticas = {
    totalUsuarios: usuarios.length,
    administradores: usuarios.filter(u => u.tipo === "Administrador").length,
    funcionarios: usuarios.filter(u => u.tipo === "Funcionario").length,
    ativos: usuarios.filter(u => u.ativo).length,
    inativos: usuarios.filter(u => !u.ativo).length
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{estatisticas.totalUsuarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">{estatisticas.administradores}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Funcionários</p>
                <p className="text-2xl font-bold">{estatisticas.funcionarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">{estatisticas.ativos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.tipo === "Administrador" ? "destructive" : "default"}>
                        {usuario.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.tipo === "Administrador" ? (
                        <span className="text-sm text-muted-foreground">Todas</span>
                      ) : (
                        <span className="text-sm">{usuario.permissoes.length} permissões</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.ativo ? "default" : "secondary"}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.ultimoLogin ? (
                        new Date(usuario.ultimoLogin).toLocaleDateString('pt-BR')
                      ) : (
                        <span className="text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {usuario.tipo === "Funcionario" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirPermissoes(usuario)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => alterarStatusUsuario(usuario.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirUsuario(usuario.id)}
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

      {/* Dialog de Permissões */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Gerenciar Permissões - {usuarioSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {permissoesDisponiveis.map((permissao) => (
                <div key={permissao} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={permissao}
                    checked={usuarioSelecionado?.permissoes.includes(permissao) || false}
                    onChange={() => alterarPermissao(permissao)}
                    className="rounded"
                  />
                  <label htmlFor={permissao} className="text-sm capitalize">
                    {permissao}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={salvarPermissoes} className="flex-1">
                Salvar Permissões
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

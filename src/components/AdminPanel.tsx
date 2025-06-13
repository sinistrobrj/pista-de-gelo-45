import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Users, ShoppingBag, Calendar, BarChart3, Database, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { createDefaultAdmin, fixAdminPermissions } from "@/lib/supabase-utils"
import { supabase } from "@/integrations/supabase/client"
import type { User } from "@supabase/supabase-js"

export function AdminPanel() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalClientes: 0,
    totalProdutos: 0,
    totalVendas: 0
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '101010'
  })

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarEstatisticas = async () => {
    try {
      // Carregar estatísticas reais do Supabase
      const [profilesResult, clientesResult, produtosResult, vendasResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('clientes').select('id', { count: 'exact' }),
        supabase.from('produtos').select('id', { count: 'exact' }),
        supabase.from('vendas').select('id', { count: 'exact' })
      ])

      setStats({
        totalUsuarios: profilesResult.count || 0,
        totalClientes: clientesResult.count || 0,
        totalProdutos: produtosResult.count || 0,
        totalVendas: vendasResult.count || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const criarAdminPadrao = async () => {
    try {
      const result = await createDefaultAdmin()
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message
        })
      } else {
        toast({
          title: "Erro",
          description: "Erro ao criar administrador: " + (result.error?.message || 'Erro desconhecido'),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar administrador",
        variant: "destructive"
      })
    }
  }

  const criarNovoAdmin = async () => {
    if (!formData.nome || !formData.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      console.log('Criando novo administrador:', formData)
      
      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.senha,
        email_confirm: true,
        user_metadata: {
          nome: formData.nome
        }
      })

      console.log('Resultado auth.admin.createUser:', { authData, authError })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        console.log('Usuário criado, inserindo perfil...')
        
        // Inserir perfil com permissões completas de administrador
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            nome: formData.nome,
            email: formData.email,
            tipo: 'Administrador',
            permissoes: ['vendas', 'estoque', 'relatorios', 'clientes', 'eventos', 'pista', 'admin', 'usuarios'],
            ativo: true
          })

        console.log('Resultado insert profile:', { profileError })

        if (profileError) {
          throw profileError
        }

        toast({
          title: "Sucesso",
          description: `Administrador criado com sucesso! 
          Email: ${formData.email}
          Senha: ${formData.senha}
          Tipo: Administrador com acesso total`,
          duration: 10000
        })

        setIsDialogOpen(false)
        setFormData({ nome: '', email: '', senha: '101010' })
        carregarEstatisticas()
      }
    } catch (error: any) {
      console.error('Erro ao criar administrador:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar administrador",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const executarBackup = async () => {
    toast({
      title: "Backup",
      description: "Funcionalidade de backup será implementada em breve"
    })
  }

  const limparCache = async () => {
    try {
      // Limpar localStorage
      localStorage.clear()
      
      toast({
        title: "Sucesso",
        description: "Cache limpo com sucesso"
      })
      
      // Recarregar página para atualizar dados
      window.location.reload()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao limpar cache",
        variant: "destructive"
      })
    }
  }

  const corrigirPermissoesAdmin = async () => {
    try {
      const result = await fixAdminPermissions()
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message
        })
        carregarEstatisticas()
      } else {
        toast({
          title: "Erro",
          description: result.error?.message || "Erro ao corrigir permissões",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error('Erro ao corrigir permissões:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao corrigir permissões",
        variant: "destructive"
      })
    }
  }

  console.log('Profile no AdminPanel:', profile)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      </div>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-2xl font-bold">{stats.totalUsuarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold">{stats.totalClientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produtos</p>
                <p className="text-2xl font-bold">{stats.totalProdutos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas</p>
                <p className="text-2xl font-bold">{stats.totalVendas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ferramentas Administrativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <CardTitle>Gestão de Usuários</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Criar usuário administrador padrão do sistema
            </p>
            <Button onClick={criarAdminPadrao} className="w-full">
              Criar Admin Padrão
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-primary" />
              <CardTitle>Novo Administrador</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Criar novo usuário com acesso total de administrador
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  Criar Novo Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Administrador</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
                      placeholder="Senha padrão: 101010"
                    />
                  </div>
                  <Button 
                    onClick={criarNovoAdmin} 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Criando..." : "Criar Administrador"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <CardTitle>Corrigir Permissões</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Corrigir permissões do usuário admin@icerink.com
            </p>
            <Button onClick={corrigirPermissoesAdmin} className="w-full" variant="outline">
              Corrigir Admin Principal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              <CardTitle>Backup de Dados</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Realizar backup completo do banco de dados
            </p>
            <Button onClick={executarBackup} className="w-full" variant="outline">
              Executar Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <CardTitle>Manutenção</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Limpar cache e dados temporários do sistema
            </p>
            <Button onClick={limparCache} className="w-full" variant="destructive">
              Limpar Cache
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Usuário Logado</h4>
              <p className="text-sm text-muted-foreground">{profile?.nome}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-sm text-muted-foreground">Tipo: {profile?.tipo}</p>
              <p className="text-sm text-muted-foreground">
                Permissões: {profile?.permissoes?.join(', ') || 'Nenhuma'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sistema</h4>
              <p className="text-sm text-muted-foreground">Ice Rink Manager v1.0</p>
              <p className="text-sm text-muted-foreground">Conectado ao Supabase</p>
              <p className="text-sm text-muted-foreground">Status: Online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

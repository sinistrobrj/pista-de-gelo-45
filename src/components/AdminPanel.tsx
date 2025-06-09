
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Users, ShoppingBag, Calendar, BarChart3, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { createDefaultAdmin } from "@/lib/supabase-utils"

export function AdminPanel() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalClientes: 0,
    totalProdutos: 0,
    totalVendas: 0
  })

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarEstatisticas = async () => {
    // Aqui você pode carregar estatísticas reais do Supabase
    // Por enquanto, vou usar valores padrão
    setStats({
      totalUsuarios: 0,
      totalClientes: 0,
      totalProdutos: 0,
      totalVendas: 0
    })
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

  if (profile?.tipo !== "Administrador") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Acesso restrito a administradores</p>
        </div>
      </div>
    )
  }

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

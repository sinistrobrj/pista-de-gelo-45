
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, ChartBar, Tickets, Calendar, User } from "lucide-react"

const adminSections = [
  {
    title: "Gestão de Usuários",
    description: "Controle permissões e acesso de funcionários",
    icon: Users,
    color: "bg-blue-500",
    actions: ["Adicionar Usuário", "Gerenciar Permissões", "Logs de Acesso"],
  },
  {
    title: "Configurações do Sistema",
    description: "Configurações gerais da aplicação",
    icon: Settings,
    color: "bg-green-500",
    actions: ["Configurações Gerais", "Backup & Restore", "Manutenção"],
  },
  {
    title: "Relatórios Avançados",
    description: "Análises detalhadas e exportação de dados",
    icon: ChartBar,
    color: "bg-purple-500",
    actions: ["Relatório Financeiro", "Análise de Clientes", "Exportar Dados"],
  },
  {
    title: "Gestão de Eventos",
    description: "Controle avançado de eventos e programação",
    icon: Calendar,
    color: "bg-orange-500",
    actions: ["Criar Evento", "Programação", "Recursos"],
  },
]

const systemStatus = [
  { name: "Sistema de Vendas", status: "online", uptime: "99.9%" },
  { name: "Banco de Dados", status: "online", uptime: "100%" },
  { name: "API Externa", status: "warning", uptime: "98.5%" },
  { name: "Backup Automático", status: "online", uptime: "100%" },
]

export function AdminPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">Centro de controle e configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminSections.map((section) => (
              <Card key={section.title} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center`}>
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription className="text-sm">{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.actions.map((action, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Status do Sistema
              </CardTitle>
              <CardDescription>Monitoramento em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                    </div>
                    <Badge 
                      variant={
                        service.status === 'online' ? 'default' : 
                        service.status === 'warning' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {service.status === 'online' ? 'Online' : 
                       service.status === 'warning' ? 'Atenção' : 'Offline'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Tickets className="w-4 h-4 mr-2" />
                  Bloquear Vendas
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Backup Manual
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ChartBar className="w-4 h-4 mr-2" />
                  Relatório Diário
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tickets, Users, Calendar, ChartBar } from "lucide-react"

const stats = [
  {
    title: "Ingressos Vendidos",
    value: "2,847",
    description: "+12% em relação ao mês passado",
    icon: Tickets,
    color: "bg-blue-500",
  },
  {
    title: "Clientes Ativos",
    value: "1,245",
    description: "+5% novos clientes este mês",
    icon: Users,
    color: "bg-green-500",
  },
  {
    title: "Eventos Agendados",
    value: "28",
    description: "Próximos 30 dias",
    icon: Calendar,
    color: "bg-purple-500",
  },
  {
    title: "Receita Total",
    value: "R$ 45.200",
    description: "+18% crescimento mensal",
    icon: ChartBar,
    color: "bg-orange-500",
  },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do Ice Rink Manager</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Últimas transações de ingressos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { cliente: "João Silva", evento: "Patinação Livre", valor: "R$ 25,00", tempo: "há 5 min" },
                { cliente: "Maria Santos", evento: "Aula de Hockey", valor: "R$ 45,00", tempo: "há 12 min" },
                { cliente: "Pedro Costa", evento: "Festa de Aniversário", valor: "R$ 120,00", tempo: "há 28 min" },
              ].map((venda, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{venda.cliente}</p>
                    <p className="text-sm text-muted-foreground">{venda.evento}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{venda.valor}</p>
                    <p className="text-sm text-muted-foreground">{venda.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Agenda da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { evento: "Campeonato de Hockey", data: "15 Jun", horario: "19:00", status: "Confirmado" },
                { evento: "Aula para Iniciantes", data: "16 Jun", horario: "14:00", status: "Disponível" },
                { evento: "Festa Infantil", data: "17 Jun", horario: "16:00", status: "Lotado" },
              ].map((evento, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{evento.evento}</p>
                    <p className="text-sm text-muted-foreground">{evento.data} às {evento.horario}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    evento.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
                    evento.status === 'Disponível' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {evento.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

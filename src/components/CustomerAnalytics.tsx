
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, TrendingDown, Calendar } from "lucide-react"

const customerMetrics = [
  {
    title: "Total de Clientes",
    value: "1,245",
    change: "+12%",
    trend: "up",
    description: "Clientes únicos este mês"
  },
  {
    title: "Clientes Recorrentes",
    value: "847",
    change: "+8%",
    trend: "up",
    description: "Retornaram este mês"
  },
  {
    title: "Ticket Médio",
    value: "R$ 38,50",
    change: "-3%",
    trend: "down",
    description: "Valor médio por cliente"
  },
  {
    title: "Frequência Média",
    value: "2.3",
    change: "+15%",
    trend: "up",
    description: "Visitas por mês"
  },
]

const topCustomers = [
  { name: "Maria Silva", visits: 15, spent: "R$ 675,00", lastVisit: "Hoje", category: "VIP" },
  { name: "João Santos", visits: 12, spent: "R$ 540,00", lastVisit: "Ontem", category: "Frequente" },
  { name: "Ana Costa", visits: 10, spent: "R$ 425,00", lastVisit: "2 dias", category: "Frequente" },
  { name: "Pedro Lima", visits: 8, spent: "R$ 320,00", lastVisit: "3 dias", category: "Regular" },
  { name: "Sofia Rocha", visits: 7, spent: "R$ 280,00", lastVisit: "5 dias", category: "Regular" },
]

const ageGroups = [
  { range: "6-12 anos", count: 324, percentage: 26 },
  { range: "13-17 anos", count: 298, percentage: 24 },
  { range: "18-30 anos", count: 387, percentage: 31 },
  { range: "31-50 anos", count: 187, percentage: 15 },
  { range: "51+ anos", count: 49, percentage: 4 },
]

export function CustomerAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Análise de Clientes</h1>
        <p className="text-muted-foreground">Insights detalhados sobre comportamento e preferências dos clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customerMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Clientes
              </CardTitle>
              <CardDescription>Clientes mais ativos e valiosos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{customer.visits} visitas</span>
                          <span>•</span>
                          <span>Última: {customer.lastVisit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{customer.spent}</p>
                      <Badge variant={
                        customer.category === 'VIP' ? 'default' :
                        customer.category === 'Frequente' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {customer.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Distribuição por Idade
              </CardTitle>
              <CardDescription>Perfil etário dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ageGroups.map((group) => (
                  <div key={group.range} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{group.range}</span>
                      <span className="font-medium">{group.count} clientes</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {group.percentage}% do total
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

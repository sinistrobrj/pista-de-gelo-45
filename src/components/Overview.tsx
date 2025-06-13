
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react"
import { getVendasStats } from "@/lib/supabase-stats"
import { getClientes } from "@/lib/supabase-utils"

export function Overview() {
  const [stats, setStats] = useState({
    totalVendas: 0,
    totalClientes: 0,
    totalTransacoes: 0,
    crescimento: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [vendasResult, clientesResult] = await Promise.all([
          getVendasStats(),
          getClientes()
        ])

        if (!vendasResult.error && !clientesResult.error) {
          setStats({
            totalVendas: vendasResult.data?.totalVendas || 0,
            totalClientes: clientesResult.data?.length || 0,
            totalTransacoes: vendasResult.data?.totalTransacoes || 0,
            crescimento: vendasResult.data?.crescimento || 0
          })
        }
      } catch (error) {
        console.error('Erro ao carregar dados overview:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-40 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Receita Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {stats.totalVendas.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.crescimento >= 0 ? '+' : ''}{stats.crescimento.toFixed(1)}% em relação ao mês passado
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Clientes
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClientes}</div>
          <p className="text-xs text-muted-foreground">
            Clientes cadastrados
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTransacoes}</div>
          <p className="text-xs text-muted-foreground">
            Vendas realizadas
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Crescimento
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.crescimento >= 0 ? '+' : ''}{stats.crescimento.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Crescimento mensal
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

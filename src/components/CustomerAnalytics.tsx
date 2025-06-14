
import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { getAnalyticsData } from "@/lib/supabase-stats"
import { StatsCards } from "./analytics/StatsCards"
import { VendasChart } from "./analytics/VendasChart"
import { ClientesCategoriaChart } from "./analytics/ClientesCategoriaChart"
import { ProdutosMaisVendidosChart } from "./analytics/ProdutosMaisVendidosChart"

export function CustomerAnalytics() {
  const [data, setData] = useState({
    stats: {
      totalClientes: 0,
      novosMesAtual: 0,
      ticketMedio: 0,
      taxaRetencao: 0
    },
    vendasPorMes: [],
    categoriaClientes: [],
    produtosMaisVendidos: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const result = await getAnalyticsData()
        if (!result.error && result.data) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Erro ao carregar dados de analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
      </div>

      <StatsCards stats={data.stats} />
      <VendasChart data={data.vendasPorMes} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientesCategoriaChart data={data.categoriaClientes} />
        <ProdutosMaisVendidosChart data={data.produtosMaisVendidos} />
      </div>
    </div>
  )
}

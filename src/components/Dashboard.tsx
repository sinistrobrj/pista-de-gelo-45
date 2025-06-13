
import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "./Overview"
import { RecentSales } from "./RecentSales"
import { useRealtimeVendas } from "@/hooks/useRealtimeVendas"

export function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUpdate = useCallback(() => {
    // Força re-renderização dos componentes filhos
    setRefreshKey(prev => prev + 1)
  }, [])

  const { isConnected } = useRealtimeVendas(handleUpdate)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {isConnected && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Dados em tempo real
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div key={`overview-${refreshKey}`}>
          <Overview />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>
                Suas vendas mais recentes
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div key={`sales-${refreshKey}`}>
                <RecentSales />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

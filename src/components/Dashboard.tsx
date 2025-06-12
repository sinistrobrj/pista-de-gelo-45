
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "./Overview"
import { RecentSales } from "./RecentSales"

export function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <Overview />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>
                Suas vendas mais recentes
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <RecentSales />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

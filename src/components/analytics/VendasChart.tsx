
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ShoppingCart } from "lucide-react"

interface VendasChartProps {
  data: any[]
}

export function VendasChart({ data }: VendasChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Nenhuma venda registrada ainda</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vendas" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

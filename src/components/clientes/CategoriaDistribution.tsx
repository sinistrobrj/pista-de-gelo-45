
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EstatisticasGerais {
  totalClientes: number
  bronze: number
  prata: number
  ouro: number
  diamante: number
  totalFaturamento: number
  ticketMedio: number
}

interface CategoriaDistributionProps {
  estatisticas: EstatisticasGerais
}

export function CategoriaDistribution({ estatisticas }: CategoriaDistributionProps) {
  const categorias = [
    { categoria: "Bronze", count: estatisticas.bronze, color: "bg-amber-600" },
    { categoria: "Prata", count: estatisticas.prata, color: "bg-gray-400" },
    { categoria: "Ouro", count: estatisticas.ouro, color: "bg-yellow-500" },
    { categoria: "Diamante", count: estatisticas.diamante, color: "bg-blue-600" }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria de Fidelidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {categorias.map(({ categoria, count, color }) => (
            <div key={categoria} className="text-center p-4 border rounded-lg">
              <div className={`w-8 h-8 ${color} rounded-full mx-auto mb-2`}></div>
              <h3 className="font-bold">{categoria}</h3>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-muted-foreground">
                {estatisticas.totalClientes > 0 ? ((count / estatisticas.totalClientes) * 100).toFixed(1) : 0}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

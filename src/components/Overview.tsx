
import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export function Overview() {
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([])

  useEffect(() => {
    carregarDadosGrafico()
  }, [])

  const carregarDadosGrafico = () => {
    const compras = JSON.parse(localStorage.getItem('compras') || '[]')
    
    // Agrupar vendas por mês
    const vendasPorMes: Record<string, number> = {}
    
    compras.forEach((compra: any) => {
      const data = new Date(compra.data)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      vendasPorMes[chave] = (vendasPorMes[chave] || 0) + compra.total
    })

    // Criar dados para os últimos 12 meses
    const meses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ]

    const dados = []
    const dataAtual = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1)
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      
      dados.push({
        name: meses[data.getMonth()],
        total: vendasPorMes[chave] || 0
      })
    }

    setDadosGrafico(dados)
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={dadosGrafico}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip
          formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Faturamento"]}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

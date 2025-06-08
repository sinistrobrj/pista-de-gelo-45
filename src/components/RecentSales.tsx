
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface VendaRecente {
  clienteId: string
  clienteNome: string
  total: number
  data: string
}

export function RecentSales() {
  const [vendasRecentes, setVendasRecentes] = useState<VendaRecente[]>([])

  useEffect(() => {
    carregarVendasRecentes()
  }, [])

  const carregarVendasRecentes = () => {
    const compras = JSON.parse(localStorage.getItem('compras') || '[]')
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]')

    // Pegar as 5 vendas mais recentes
    const vendasOrdenadas = compras
      .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5)
      .map((compra: any) => {
        const cliente = clientes.find((c: any) => c.id === compra.clienteId)
        return {
          clienteId: compra.clienteId,
          clienteNome: cliente?.nome || "Cliente não encontrado",
          total: compra.total,
          data: compra.data
        }
      })

    setVendasRecentes(vendasOrdenadas)
  }

  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(palavra => palavra[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (vendasRecentes.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">Nenhuma venda realizada ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {vendasRecentes.map((venda, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{obterIniciais(venda.clienteNome)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {venda.clienteNome}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(venda.data).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="ml-auto font-medium">
            +R$ {venda.total.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
}


import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getVendas } from "@/lib/supabase-utils"

interface VendaRecente {
  id: string
  cliente_id: string
  clienteNome: string
  total_final: number
  desconto_aplicado: number
  data: string
}

export function RecentSales() {
  const [vendasRecentes, setVendasRecentes] = useState<VendaRecente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarVendasRecentes()
  }, [])

  const carregarVendasRecentes = async () => {
    try {
      const { data, error } = await getVendas()
      
      if (error) {
        console.error('Erro ao carregar vendas:', error)
        setVendasRecentes([])
        return
      }

      // Pegar as 5 vendas mais recentes
      const vendasFormatadas = data
        .slice(0, 5)
        .map((venda: any) => ({
          id: venda.id,
          cliente_id: venda.cliente_id,
          clienteNome: venda.clientes?.nome || "Cliente não encontrado",
          total_final: venda.total_final,
          desconto_aplicado: venda.desconto_aplicado || 0,
          data: venda.data || venda.created_at
        }))

      setVendasRecentes(vendasFormatadas)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
      setVendasRecentes([])
    } finally {
      setLoading(false)
    }
  }

  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map(palavra => palavra[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">Carregando vendas...</p>
      </div>
    )
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
      {vendasRecentes.map((venda) => (
        <div key={venda.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{obterIniciais(venda.clienteNome)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {venda.clienteNome}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {new Date(venda.data).toLocaleDateString('pt-BR')}
              </p>
              {venda.desconto_aplicado > 0 && (
                <Badge variant="secondary" className="text-xs">
                  -{venda.desconto_aplicado.toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
          <div className="ml-auto font-medium">
            +R$ {venda.total_final.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
}

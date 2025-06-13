
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ShoppingCart } from "lucide-react"
import { getVendasRecentes } from "@/lib/supabase-stats"

export function RecentSales() {
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarVendas = async () => {
      try {
        const { data, error } = await getVendasRecentes(5)
        if (!error) {
          setVendas(data)
        }
      } catch (error) {
        console.error('Erro ao carregar vendas recentes:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarVendas()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
            <div className="ml-4 space-y-1 flex-1">
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (vendas.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
          <p className="text-muted-foreground text-lg">Nenhuma venda recente</p>
          <p className="text-muted-foreground text-sm">
            As vendas aparecerão aqui quando forem realizadas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {vendas.map((venda) => (
        <div key={venda.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {venda.clientes?.nome?.split(' ').map((n: string) => n[0]).join('') || 'CL'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {venda.clientes?.nome || 'Cliente não identificado'}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(venda.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="ml-auto font-medium">
            +R$ {venda.total_final?.toFixed(2) || '0.00'}
          </div>
        </div>
      ))}
    </div>
  )
}

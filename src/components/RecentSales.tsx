
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ShoppingCart } from "lucide-react"

export function RecentSales() {
  // Lista vazia - mostrando estado vazio até haver vendas reais
  const vendas: any[] = []

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
              {venda.cliente_nome?.split(' ').map((n: string) => n[0]).join('') || 'CL'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {venda.cliente_nome || 'Cliente não identificado'}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(venda.data).toLocaleDateString('pt-BR')}
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

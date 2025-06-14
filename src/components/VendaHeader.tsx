
import { Button } from "@/components/ui/button"
import { ShoppingCart, RefreshCw } from "lucide-react"

interface VendaHeaderProps {
  onRecarregarProdutos: () => void
  loading: boolean
}

export function VendaHeader({ onRecarregarProdutos, loading }: VendaHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Ponto de Venda</h1>
      </div>
      
      <Button onClick={onRecarregarProdutos} variant="outline" disabled={loading}>
        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Atualizar Produtos
      </Button>
    </div>
  )
}

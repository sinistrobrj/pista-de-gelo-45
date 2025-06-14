
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"

interface CarrinhoActionsProps {
  onFinalizarVenda: () => void
  loading: boolean
  carrinhoVazio: boolean
  clienteSelecionado: string
}

export function CarrinhoActions({ 
  onFinalizarVenda, 
  loading, 
  carrinhoVazio, 
  clienteSelecionado 
}: CarrinhoActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Button
          onClick={onFinalizarVenda}
          disabled={loading || carrinhoVazio || !clienteSelecionado}
          className="w-full"
          size="lg"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {loading ? "Finalizando..." : "Finalizar Venda"}
        </Button>
      </CardContent>
    </Card>
  )
}

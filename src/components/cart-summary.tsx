
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"

interface CartItem {
  produto_id: string
  nome: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}

interface CartSummaryProps {
  carrinho: CartItem[]
  descontoPercentual: number
  onDescontoChange: (desconto: number) => void
  onRemoveItem: (produtoId: string) => void
  total: number
  totalComDesconto: number
  descontoAplicado: number
}

export function CartSummary({ 
  carrinho, 
  descontoPercentual, 
  onDescontoChange, 
  onRemoveItem, 
  total, 
  totalComDesconto, 
  descontoAplicado 
}: CartSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da Venda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {carrinho.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum item no carrinho
          </p>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {carrinho.map((item) => (
                <div key={item.produto_id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantidade}x R$ {item.preco_unitario.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">R$ {item.subtotal.toFixed(2)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveItem(item.produto_id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div>
                <Label htmlFor="desconto">Desconto (%)</Label>
                <Input
                  id="desconto"
                  type="number"
                  min="0"
                  max="100"
                  value={descontoPercentual}
                  onChange={(e) => onDescontoChange(Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                
                {descontoAplicado > 0 && (
                  <>
                    <div className="flex justify-between text-red-600">
                      <span>Desconto ({descontoPercentual}%):</span>
                      <span>-R$ {descontoAplicado.toFixed(2)}</span>
                    </div>
                    <Badge variant="destructive" className="w-full justify-center">
                      Desconto de R$ {descontoAplicado.toFixed(2)} aplicado
                    </Badge>
                  </>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>R$ {totalComDesconto.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

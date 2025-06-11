
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"

interface Product {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  tipo?: string
  evento_id?: string
}

interface ProductSelectorProps {
  produtos: Product[]
  carrinho: any[]
  onAddToCart: (produto: Product) => void
  onUpdateQuantity: (produtoId: string, novaQuantidade: number) => void
}

export function ProductSelector({ produtos, carrinho, onAddToCart, onUpdateQuantity }: ProductSelectorProps) {
  const getQuantidadeNoCarrinho = (produtoId: string) => {
    const item = carrinho.find(item => item.produto_id === produtoId)
    return item?.quantidade || 0
  }

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      "Ingresso": "bg-blue-500",
      "Evento": "bg-purple-500", 
      "Produtos": "bg-green-500"
    }
    return colors[categoria as keyof typeof colors] || "bg-gray-500"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {produtos.map((produto) => {
        const quantidade = getQuantidadeNoCarrinho(produto.id)
        const disponivel = produto.estoque > 0

        return (
          <Card key={produto.id} className={`cursor-pointer transition-all hover:shadow-md ${!disponivel ? 'opacity-50' : ''}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm leading-tight">{produto.nome}</h3>
                  <Badge className={`${getCategoriaColor(produto.categoria)} text-white text-xs`}>
                    {produto.categoria}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    R$ {produto.preco.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Estoque: {produto.estoque}
                  </span>
                </div>

                {disponivel ? (
                  <div className="flex items-center justify-between">
                    {quantidade > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(produto.id, quantidade - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{quantidade}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(produto.id, quantidade + 1)}
                          disabled={quantidade >= produto.estoque}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onAddToCart(produto)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    Indisponível
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

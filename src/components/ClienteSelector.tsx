
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "lucide-react"

interface Cliente {
  id: string
  nome: string
  categoria: string
  pontos: number
  total_gasto: number
}

interface ClienteSelectorProps {
  clientes: Cliente[]
  clienteSelecionado: string
  onClienteChange: (clienteId: string) => void
  regrasFidelidade: any[]
  descontoFidelidade: number
}

export function ClienteSelector({ 
  clientes, 
  clienteSelecionado, 
  onClienteChange, 
  regrasFidelidade, 
  descontoFidelidade 
}: ClienteSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Selecionar Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={clienteSelecionado} onValueChange={onClienteChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome} - {cliente.categoria}
                {(() => {
                  const regra = regrasFidelidade.find(r => r.categoria === cliente.categoria)
                  return regra ? ` (${regra.desconto_percentual}% desconto)` : ''
                })()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {clienteSelecionado && descontoFidelidade > 0 && (
          <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
            Desconto de fidelidade: {descontoFidelidade}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}

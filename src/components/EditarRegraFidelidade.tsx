
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateRegraFidelidade } from "@/lib/supabase-utils"

interface RegraFidelidade {
  id: string
  categoria: string
  desconto_percentual: number
  pontos_por_real: number
  requisito_minimo: number
}

interface EditarRegraFidelidadeProps {
  regra: RegraFidelidade
  onUpdate: () => void
}

export function EditarRegraFidelidade({ regra, onUpdate }: EditarRegraFidelidadeProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    desconto_percentual: regra.desconto_percentual,
    pontos_por_real: regra.pontos_por_real,
    requisito_minimo: regra.requisito_minimo
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await updateRegraFidelidade(regra.id, formData)

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar regra: " + (error.message || 'Erro desconhecido'),
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Sucesso",
        description: "Regra atualizada com sucesso!"
      })

      setOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Erro ao atualizar regra:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar regra",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Regra - {regra.categoria}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Desconto Percentual (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.desconto_percentual}
              onChange={(e) => setFormData({ ...formData, desconto_percentual: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <Label>Pontos por Real Gasto</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={formData.pontos_por_real}
              onChange={(e) => setFormData({ ...formData, pontos_por_real: parseFloat(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <Label>Requisito Mínimo (R$)</Label>
            <Input
              type="number"
              min="0"
              value={formData.requisito_minimo}
              onChange={(e) => setFormData({ ...formData, requisito_minimo: parseFloat(e.target.value) || 0 })}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

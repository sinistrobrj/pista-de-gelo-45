
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { CpfInput } from '@/components/cpf-input'
import { PhoneInput } from '@/components/PhoneInput'
import { createVisitante } from '@/lib/supabase-visitors'
import { Loader2 } from 'lucide-react'

interface NovoVisitanteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVisitanteCriado: () => void
}

export function NovoVisitanteDialog({ open, onOpenChange, onVisitanteCriado }: NovoVisitanteDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [visitanteData, setVisitanteData] = useState({
    nome: '',
    cpf: '',
    telefone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!visitanteData.nome || !visitanteData.cpf) {
      toast({
        title: "Erro",
        description: "Nome e CPF são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const result = await createVisitante(visitanteData)
      
      if (result.success && result.visitante) {
        toast({
          title: "Sucesso",
          description: `Visitante criado! Login: ${result.visitante.email} | Senha: ${result.visitante.senha}`,
          duration: 10000
        })
        
        setVisitanteData({ nome: '', cpf: '', telefone: '' })
        onVisitanteCriado()
        onOpenChange(false)
      } else {
        toast({
          title: "Erro",
          description: result.error?.message || "Erro ao criar visitante",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao criar visitante:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar visitante",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Visitante</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={visitanteData.nome}
              onChange={(e) => setVisitanteData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <CpfInput
              id="cpf"
              value={visitanteData.cpf}
              onChange={(value) => setVisitanteData(prev => ({ ...prev, cpf: value }))}
              placeholder="000.000.000-00"
            />
            <p className="text-xs text-muted-foreground">
              A senha será gerada com os 6 primeiros dígitos do CPF
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone (opcional)</Label>
            <PhoneInput
              value={visitanteData.telefone}
              onChange={(value) => setVisitanteData(prev => ({ ...prev, telefone: value }))}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Visitante
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

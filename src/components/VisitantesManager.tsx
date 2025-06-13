
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { NovoVisitanteDialog } from './NovoVisitanteDialog'
import { getVisitantes, adicionarTempoVisitante } from '@/lib/supabase-visitors'
import { UserPlus, Clock, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function VisitantesManager() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [visitantes, setVisitantes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tempoAdicional, setTempoAdicional] = useState<{ [key: string]: number }>({})

  const loadVisitantes = async () => {
    try {
      const { data, error } = await getVisitantes()
      if (error) {
        console.error('Erro ao carregar visitantes:', error)
        toast({
          title: "Erro",
          description: "Erro ao carregar visitantes",
          variant: "destructive"
        })
      } else {
        setVisitantes(data)
      }
    } catch (error) {
      console.error('Erro ao carregar visitantes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVisitantes()
  }, [])

  const handleAdicionarTempo = async (visitanteId: string) => {
    const minutos = tempoAdicional[visitanteId] || 15
    
    try {
      const result = await adicionarTempoVisitante(visitanteId, minutos)
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: `${minutos} minutos adicionados ao visitante`,
        })
        loadVisitantes() // Recarregar lista
        setTempoAdicional(prev => ({ ...prev, [visitanteId]: 15 })) // Reset
      } else {
        toast({
          title: "Erro",
          description: "Erro ao adicionar tempo",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar tempo:', error)
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      })
    }
  }

  const getStatusVisitante = (visitante: any) => {
    if (!visitante.login_expira_em) {
      return { status: 'Inativo', color: 'secondary' }
    }
    
    const expiraEm = new Date(visitante.login_expira_em)
    const agora = new Date()
    const minutosRestantes = Math.floor((expiraEm.getTime() - agora.getTime()) / (1000 * 60))
    
    if (minutosRestantes <= 0) {
      return { status: 'Expirado', color: 'destructive' }
    }
    
    return { 
      status: `${minutosRestantes} min restantes`, 
      color: minutosRestantes <= 5 ? 'destructive' : 'default' 
    }
  }

  // Verificar se é administrador
  if (profile?.tipo !== 'Administrador') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Apenas administradores podem gerenciar visitantes.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Visitantes</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Visitante
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Carregando visitantes...</p>
          </CardContent>
        </Card>
      ) : visitantes.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Nenhum visitante encontrado. Crie o primeiro visitante.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {visitantes.map((visitante) => {
            const statusInfo = getStatusVisitante(visitante)
            
            return (
              <Card key={visitante.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{visitante.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{visitante.email}</p>
                    </div>
                    <Badge variant={statusInfo.color as any}>
                      {statusInfo.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`tempo-${visitante.id}`}>Adicionar tempo:</Label>
                      <Input
                        id={`tempo-${visitante.id}`}
                        type="number"
                        min="1"
                        max="240"
                        value={tempoAdicional[visitante.id] || 15}
                        onChange={(e) => setTempoAdicional(prev => ({ 
                          ...prev, 
                          [visitante.id]: parseInt(e.target.value) || 15 
                        }))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleAdicionarTempo(visitante.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  
                  {visitante.ultimo_login && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Último login: {new Date(visitante.ultimo_login).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <NovoVisitanteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onVisitanteCriado={loadVisitantes}
      />
    </div>
  )
}

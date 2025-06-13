
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from './use-toast'

export function useVisitanteTimer() {
  const { user, profile, signOut } = useAuth()
  const { toast } = useToast()
  const [tempoRestante, setTempoRestante] = useState<number | null>(null)

  useEffect(() => {
    if (!user || !profile || profile.tipo !== 'Visitante') {
      return
    }

    const verificarTempo = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('login_expira_em, tempo_restante_minutos')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Erro ao verificar tempo do visitante:', error)
          return
        }

        if (data.login_expira_em) {
          const expiraEm = new Date(data.login_expira_em)
          const agora = new Date()
          const minutosRestantes = Math.floor((expiraEm.getTime() - agora.getTime()) / (1000 * 60))

          if (minutosRestantes <= 0) {
            toast({
              title: "Tempo esgotado",
              description: "Seu tempo de acesso expirou. Você será desconectado.",
              variant: "destructive"
            })
            await signOut()
            return
          }

          setTempoRestante(minutosRestantes)

          // Avisar quando restam 2 minutos
          if (minutosRestantes === 2) {
            toast({
              title: "Tempo quase esgotado",
              description: "Restam apenas 2 minutos do seu acesso.",
              variant: "destructive"
            })
          }
        }
      } catch (error) {
        console.error('Erro na verificação de tempo:', error)
      }
    }

    // Verificar imediatamente
    verificarTempo()

    // Verificar a cada minuto
    const interval = setInterval(verificarTempo, 60000)

    return () => clearInterval(interval)
  }, [user, profile, signOut, toast])

  return { tempoRestante }
}

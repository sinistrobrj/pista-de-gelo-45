
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useRealtimeVendas(onUpdate?: () => void) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel(`vendas-realtime-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendas'
        },
        (payload) => {
          console.log('Nova venda registrada:', payload)
          if (onUpdate) {
            onUpdate()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clientes'
        },
        (payload) => {
          console.log('Cliente atualizado:', payload)
          if (onUpdate) {
            onUpdate()
          }
        }
      )
      .subscribe((status) => {
        console.log('Status da conexão realtime vendas:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      console.log('Removendo canal realtime vendas')
      supabase.removeChannel(channel)
    }
  }, [onUpdate])

  return { isConnected }
}

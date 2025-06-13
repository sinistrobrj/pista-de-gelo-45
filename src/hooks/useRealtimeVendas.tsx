
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useRealtimeVendas(onUpdate?: () => void) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel('vendas-realtime')
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
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onUpdate])

  return { isConnected }
}

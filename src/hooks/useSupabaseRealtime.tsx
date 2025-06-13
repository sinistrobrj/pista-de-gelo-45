
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useSupabaseRealtime(table: string, onUpdate?: () => void) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel(`schema-db-changes-${table}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`Mudança em ${table}:`, payload)
          if (onUpdate) {
            onUpdate()
          }
        }
      )
      .subscribe((status) => {
        console.log(`Status da conexão realtime para ${table}:`, status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      console.log(`Removendo canal realtime para ${table}`)
      supabase.removeChannel(channel)
    }
  }, [table, onUpdate])

  return { isConnected }
}

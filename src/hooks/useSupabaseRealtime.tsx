
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useSupabaseRealtime(table: string, onUpdate?: () => void) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const channel = supabase
      .channel(`schema-db-changes-${table}`)
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
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, onUpdate])

  return { isConnected }
}

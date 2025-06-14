
import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { getClientes, getRegrasFidelidade } from "@/lib/supabase-utils"

interface Cliente {
  id: string
  nome: string
  categoria: string
  pontos: number
  total_gasto: number
}

export function useClientesData() {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [regrasFidelidade, setRegrasFidelidade] = useState<any[]>([])

  const carregarClientes = useCallback(async () => {
    try {
      console.log('Carregando clientes...')
      const clientesResult = await getClientes()
      console.log('Resultado clientes:', clientesResult)
      
      if (!clientesResult.error) {
        setClientes(clientesResult.data || [])
        console.log('Clientes definidos:', clientesResult.data?.length || 0)
      } else {
        console.error('Erro ao carregar clientes:', clientesResult.error)
        throw clientesResult.error
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  const carregarRegras = useCallback(async () => {
    try {
      console.log('Carregando regras...')
      const regrasResult = await getRegrasFidelidade()
      console.log('Resultado regras:', regrasResult)

      if (!regrasResult.error) {
        setRegrasFidelidade(regrasResult.data || [])
        console.log('Regras definidas:', regrasResult.data?.length || 0)
      } else {
        console.error('Erro ao carregar regras:', regrasResult.error)
        throw regrasResult.error
      }
    } catch (error) {
      console.error('Erro ao carregar regras:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar regras de fidelidade",
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  return {
    clientes,
    regrasFidelidade,
    carregarClientes,
    carregarRegras
  }
}

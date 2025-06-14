
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search } from "lucide-react"
import { getClientes, getVendas } from "@/lib/supabase-utils"
import { NovoClienteDialog } from "./NovoClienteDialog"
import { ClientesStats } from "./clientes/ClientesStats"
import { CategoriaDistribution } from "./clientes/CategoriaDistribution"
import { ClientesTable } from "./clientes/ClientesTable"

interface Cliente {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  categoria: "Bronze" | "Prata" | "Ouro" | "Diamante"
  pontos: number
  total_gasto: number
}

interface Venda {
  id: string
  cliente_id: string
  total_final: number
  data: string
}

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [filtro, setFiltro] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [clientesData, vendasData] = await Promise.all([
        getClientes(),
        getVendas()
      ])
      
      if (clientesData.error) {
        console.error('Erro ao carregar clientes:', clientesData.error)
      } else {
        setClientes(clientesData.data)
      }

      if (vendasData.error) {
        console.error('Erro ao carregar vendas:', vendasData.error)
      } else {
        setVendas(vendasData.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const estatisticasGerais = {
    totalClientes: clientes.length,
    bronze: clientes.filter(c => c.categoria === "Bronze").length,
    prata: clientes.filter(c => c.categoria === "Prata").length,
    ouro: clientes.filter(c => c.categoria === "Ouro").length,
    diamante: clientes.filter(c => c.categoria === "Diamante").length,
    totalFaturamento: vendas.reduce((total, venda) => total + venda.total_final, 0),
    ticketMedio: vendas.length > 0 ? vendas.reduce((total, venda) => total + venda.total_final, 0) / vendas.length : 0
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
      </div>

      <ClientesStats estatisticas={estatisticasGerais} />
      <CategoriaDistribution estatisticas={estatisticasGerais} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <NovoClienteDialog onClienteAdicionado={carregarDados} />
              <Button onClick={carregarDados}>
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ClientesTable clientes={clientes} vendas={vendas} filtro={filtro} />
        </CardContent>
      </Card>
    </div>
  )
}

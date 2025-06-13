import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Heart, TrendingUp } from "lucide-react"
import { getClientes, getVendas } from "@/lib/supabase-utils"
import { NovoClienteDialog } from "./NovoClienteDialog"

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

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (cliente.email && cliente.email.toLowerCase().includes(filtro.toLowerCase())) ||
    (cliente.cpf && cliente.cpf.includes(filtro))
  )

  const obterEstatisticasCliente = (clienteId: string) => {
    const vendasCliente = vendas.filter(venda => venda.cliente_id === clienteId)
    const totalGasto = vendasCliente.reduce((total, venda) => total + venda.total_final, 0)
    const totalCompras = vendasCliente.length
    const ultimaCompra = vendasCliente.length > 0 
      ? new Date(Math.max(...vendasCliente.map(v => new Date(v.data).getTime())))
      : null

    return { totalGasto, totalCompras, ultimaCompra }
  }

  const formatarCPF = (cpf: string) => {
    if (!cpf) return ''
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      "Bronze": "bg-amber-600",
      "Prata": "bg-gray-400", 
      "Ouro": "bg-yellow-500",
      "Diamante": "bg-blue-600"
    }
    return colors[categoria as keyof typeof colors]
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{estatisticasGerais.totalClientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold">R$ {estatisticasGerais.totalFaturamento.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Premium</p>
                <p className="text-2xl font-bold">{estatisticasGerais.ouro + estatisticasGerais.diamante}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {estatisticasGerais.ticketMedio.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria de Fidelidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { categoria: "Bronze", count: estatisticasGerais.bronze, color: "bg-amber-600" },
              { categoria: "Prata", count: estatisticasGerais.prata, color: "bg-gray-400" },
              { categoria: "Ouro", count: estatisticasGerais.ouro, color: "bg-yellow-500" },
              { categoria: "Diamante", count: estatisticasGerais.diamante, color: "bg-blue-600" }
            ].map(({ categoria, count, color }) => (
              <div key={categoria} className="text-center p-4 border rounded-lg">
                <div className={`w-8 h-8 ${color} rounded-full mx-auto mb-2`}></div>
                <h3 className="font-bold">{categoria}</h3>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">
                  {estatisticasGerais.totalClientes > 0 ? ((count / estatisticasGerais.totalClientes) * 100).toFixed(1) : 0}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
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
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filtro ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Última Compra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => {
                  const stats = obterEstatisticasCliente(cliente.id)
                  
                  return (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{formatarCPF(cliente.cpf)}</TableCell>
                      <TableCell>
                        <div>
                          {cliente.email && <p className="text-sm">{cliente.email}</p>}
                          {cliente.telefone && (
                            <p className="text-xs text-muted-foreground">{cliente.telefone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getCategoriaColor(cliente.categoria)} text-white`}>
                          {cliente.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>R$ {(cliente.total_gasto || 0).toFixed(2)}</TableCell>
                      <TableCell>{stats.totalCompras}</TableCell>
                      <TableCell>
                        {stats.ultimaCompra ? (
                          <span className="text-sm">
                            {stats.ultimaCompra.toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Nunca</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

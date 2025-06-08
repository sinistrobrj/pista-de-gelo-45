
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Heart, TrendingUp, Users, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Cliente {
  id: string
  nome: string
  categoria: "Bronze" | "Prata" | "Ouro" | "Diamante"
  totalCompras: number
  pontos: number
}

interface Compra {
  clienteId: string
  itens: any[]
  total: number
  data: string
}

export function Fidelidade() {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [compras, setCompras] = useState<Compra[]>([])

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = () => {
    const clientesSalvos = JSON.parse(localStorage.getItem('clientes') || '[]')
    const comprasSalvas = JSON.parse(localStorage.getItem('compras') || '[]')
    
    // Calcular pontos e categoria para cada cliente
    const clientesComFidelidade = clientesSalvos.map((cliente: any) => {
      const comprasCliente = comprasSalvas.filter((compra: Compra) => compra.clienteId === cliente.id)
      const totalCompras = comprasCliente.reduce((total: number, compra: Compra) => total + compra.total, 0)
      const pontos = Math.floor(totalCompras / 10) // 1 ponto a cada R$ 10 gastos
      
      let categoria: "Bronze" | "Prata" | "Ouro" | "Diamante" = "Bronze"
      if (pontos >= 1000) categoria = "Diamante"
      else if (pontos >= 500) categoria = "Ouro"
      else if (pontos >= 200) categoria = "Prata"
      
      return {
        ...cliente,
        totalCompras,
        pontos,
        categoria
      }
    })

    // Atualizar categoria no localStorage
    localStorage.setItem('clientes', JSON.stringify(clientesComFidelidade))
    
    setClientes(clientesComFidelidade)
    setCompras(comprasSalvas)
  }

  const getCategoriaInfo = (categoria: string) => {
    const info = {
      "Bronze": { color: "bg-amber-600", desconto: 0, requisito: "0 - 199 pontos" },
      "Prata": { color: "bg-gray-400", desconto: 5, requisito: "200 - 499 pontos" },
      "Ouro": { color: "bg-yellow-500", desconto: 10, requisito: "500 - 999 pontos" },
      "Diamante": { color: "bg-blue-600", desconto: 15, requisito: "1000+ pontos" }
    }
    return info[categoria as keyof typeof info]
  }

  const proximaCategoria = (pontos: number) => {
    if (pontos < 200) return { categoria: "Prata", pontosNecessarios: 200 - pontos }
    if (pontos < 500) return { categoria: "Ouro", pontosNecessarios: 500 - pontos }
    if (pontos < 1000) return { categoria: "Diamante", pontosNecessarios: 1000 - pontos }
    return null
  }

  const estatisticas = {
    totalClientes: clientes.length,
    bronze: clientes.filter(c => c.categoria === "Bronze").length,
    prata: clientes.filter(c => c.categoria === "Prata").length,
    ouro: clientes.filter(c => c.categoria === "Ouro").length,
    diamante: clientes.filter(c => c.categoria === "Diamante").length,
    totalVendas: compras.reduce((total, compra) => total + compra.total, 0)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Programa de Fidelidade</h1>
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
                <p className="text-2xl font-bold">{estatisticas.totalClientes}</p>
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
                <p className="text-sm text-muted-foreground">Total em Vendas</p>
                <p className="text-2xl font-bold">R$ {estatisticas.totalVendas.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ouro+</p>
                <p className="text-2xl font-bold">{estatisticas.ouro + estatisticas.diamante}</p>
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
                <p className="text-sm text-muted-foreground">Clientes Diamante</p>
                <p className="text-2xl font-bold">{estatisticas.diamante}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Fidelidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Bronze", "Prata", "Ouro", "Diamante"].map((categoria) => {
              const info = getCategoriaInfo(categoria)
              const quantidade = estatisticas[categoria.toLowerCase() as keyof typeof estatisticas] as number
              
              return (
                <div key={categoria} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${info.color}`}></div>
                    <h3 className="font-bold">{categoria}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{info.requisito}</p>
                  <p className="text-sm text-muted-foreground mb-2">Desconto: {info.desconto}%</p>
                  <p className="font-bold">{quantidade} clientes</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Clientes do Programa de Fidelidade</CardTitle>
            <Button onClick={carregarDados}>
              Atualizar Dados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente cadastrado no programa</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Total Compras</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Próxima Categoria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => {
                  const info = getCategoriaInfo(cliente.categoria)
                  const proxima = proximaCategoria(cliente.pontos)
                  
                  return (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>
                        <Badge className={`${info.color} text-white`}>
                          {cliente.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>{cliente.pontos} pts</TableCell>
                      <TableCell>R$ {cliente.totalCompras.toFixed(2)}</TableCell>
                      <TableCell>{info.desconto}%</TableCell>
                      <TableCell>
                        {proxima ? (
                          <span className="text-sm text-muted-foreground">
                            {proxima.categoria} ({proxima.pontosNecessarios} pts)
                          </span>
                        ) : (
                          <span className="text-sm text-green-600">Máximo atingido</span>
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

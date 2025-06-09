
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Heart, Gift, Star, Crown, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getRegrasFidelidade, getClientes } from "@/lib/supabase-utils"
import { EditarRegraFidelidade } from "./EditarRegraFidelidade"

interface RegraFidelidade {
  id: string
  categoria: string
  desconto_percentual: number
  pontos_por_real: number
  requisito_minimo: number
}

interface Cliente {
  id: string
  nome: string
  categoria: "Bronze" | "Prata" | "Ouro" | "Diamante"
  pontos: number
  total_gasto: number
}

export function Fidelidade() {
  const { profile } = useAuth()
  const [regras, setRegras] = useState<RegraFidelidade[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [regrasData, clientesData] = await Promise.all([
        getRegrasFidelidade(),
        getClientes()
      ])
      
      if (regrasData.error) {
        console.error('Erro ao carregar regras:', regrasData.error)
      } else {
        setRegras(regrasData.data)
      }

      if (clientesData.error) {
        console.error('Erro ao carregar clientes:', clientesData.error)
      } else {
        setClientes(clientesData.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (categoria: string) => {
    switch (categoria) {
      case "Bronze": return <Gift className="w-5 h-5" />
      case "Prata": return <Star className="w-5 h-5" />
      case "Ouro": return <Crown className="w-5 h-5" />
      case "Diamante": return <Heart className="w-5 h-5" />
      default: return <Gift className="w-5 h-5" />
    }
  }

  const getColor = (categoria: string) => {
    switch (categoria) {
      case "Bronze": return "text-amber-600"
      case "Prata": return "text-gray-500"
      case "Ouro": return "text-yellow-500"
      case "Diamante": return "text-blue-600"
      default: return "text-gray-400"
    }
  }

  const getBgColor = (categoria: string) => {
    switch (categoria) {
      case "Bronze": return "bg-amber-100"
      case "Prata": return "bg-gray-100"
      case "Ouro": return "bg-yellow-100"
      case "Diamante": return "bg-blue-100"
      default: return "bg-gray-50"
    }
  }

  const calcularProximaCategoria = (cliente: Cliente) => {
    const regrasOrdenadas = regras.sort((a, b) => a.requisito_minimo - b.requisito_minimo)
    const regraAtual = regrasOrdenadas.find(r => r.categoria === cliente.categoria)
    const indexAtual = regrasOrdenadas.findIndex(r => r.categoria === cliente.categoria)
    
    if (indexAtual < regrasOrdenadas.length - 1) {
      const proximaRegra = regrasOrdenadas[indexAtual + 1]
      const progresso = ((cliente.total_gasto || 0) / proximaRegra.requisito_minimo) * 100
      return {
        proximaCategoria: proximaRegra.categoria,
        requisito: proximaRegra.requisito_minimo,
        progresso: Math.min(progresso, 100),
        faltam: Math.max(proximaRegra.requisito_minimo - (cliente.total_gasto || 0), 0)
      }
    }
    
    return null
  }

  const estatisticas = {
    totalClientes: clientes.length,
    bronze: clientes.filter(c => c.categoria === "Bronze").length,
    prata: clientes.filter(c => c.categoria === "Prata").length,
    ouro: clientes.filter(c => c.categoria === "Ouro").length,
    diamante: clientes.filter(c => c.categoria === "Diamante").length
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Programa de Fidelidade</h1>
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
        <Heart className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Programa de Fidelidade</h1>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bronze</p>
                <p className="text-2xl font-bold">{estatisticas.bronze}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prata</p>
                <p className="text-2xl font-bold">{estatisticas.prata}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ouro</p>
                <p className="text-2xl font-bold">{estatisticas.ouro}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diamante</p>
                <p className="text-2xl font-bold">{estatisticas.diamante}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regras de Fidelidade */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Regras do Programa</CardTitle>
            {profile?.tipo === "Administrador" && (
              <Button onClick={carregarDados} variant="outline">
                Atualizar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regras.map((regra) => (
              <Card key={regra.id} className={`${getBgColor(regra.categoria)} border-2`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${getColor(regra.categoria)}`}>
                      {getIcon(regra.categoria)}
                    </div>
                    <Badge variant="secondary" className={getColor(regra.categoria)}>
                      {regra.categoria}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Desconto:</span>
                      <span className="font-medium">{regra.desconto_percentual}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pontos/R$:</span>
                      <span className="font-medium">{regra.pontos_por_real}x</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mínimo:</span>
                      <span className="font-medium">R$ {regra.requisito_minimo.toFixed(0)}</span>
                    </div>
                  </div>

                  {profile?.tipo === "Administrador" && (
                    <div className="mt-4">
                      <EditarRegraFidelidade 
                        regra={regra} 
                        onUpdate={carregarDados} 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clientes por Progresso */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso dos Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Categoria Atual</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Progresso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.slice(0, 10).map((cliente) => {
                  const proximaCategoria = calcularProximaCategoria(cliente)
                  
                  return (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>
                        <Badge className={`${getColor(cliente.categoria)} border`} variant="outline">
                          {getIcon(cliente.categoria)}
                          <span className="ml-1">{cliente.categoria}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{cliente.pontos || 0}</TableCell>
                      <TableCell>R$ {(cliente.total_gasto || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {proximaCategoria ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Para {proximaCategoria.proximaCategoria}</span>
                              <span>{proximaCategoria.progresso.toFixed(0)}%</span>
                            </div>
                            <Progress value={proximaCategoria.progresso} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Faltam R$ {proximaCategoria.faltam.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Categoria máxima</span>
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


import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, Play, Pause, UserPlus, UserMinus, Search, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientePista {
  numero: number
  entrada: Date
  saida: Date
  tempo: number
  pausado: boolean
  tempoPausado: number
  momentoPausa: Date | null
}

export function Pista() {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Record<number, ClientePista>>({})
  const [numeroCliente, setNumeroCliente] = useState<string>("")
  const [tempoSelecionado, setTempoSelecionado] = useState<number>(30)
  const [contadorClientes, setContadorClientes] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Atualizar lista a cada segundo
    intervalRef.current = setInterval(() => {
      setClientes(clientesAtuais => ({ ...clientesAtuais }))
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setContadorClientes(Object.keys(clientes).length)
  }, [clientes])

  const registrarEntrada = () => {
    const numero = parseInt(numeroCliente)
    
    if (!numero || numero < 1 || numero > 999) {
      toast({
        title: "Erro",
        description: "Número de cliente inválido. Use números entre 1 e 999.",
        variant: "destructive"
      })
      return
    }

    const agora = new Date()
    
    if (clientes[numero]) {
      // Cliente já está na pista - adicionar tempo
      const tempoRestante = clientes[numero].saida.getTime() - agora.getTime()
      const novoTempo = tempoRestante + (tempoSelecionado * 60000)
      
      setClientes(prev => ({
        ...prev,
        [numero]: {
          ...prev[numero],
          saida: new Date(agora.getTime() + novoTempo),
          tempo: prev[numero].tempo + tempoSelecionado
        }
      }))
      
      toast({
        title: "Tempo Adicionado",
        description: `Tempo adicional registrado para o cliente ${numero}. Novo tempo total: ${clientes[numero].tempo + tempoSelecionado} minutos.`,
      })
    } else {
      // Novo cliente
      const novoCliente: ClientePista = {
        numero,
        entrada: agora,
        saida: new Date(agora.getTime() + (tempoSelecionado * 60000)),
        tempo: tempoSelecionado,
        pausado: false,
        tempoPausado: 0,
        momentoPausa: null
      }
      
      setClientes(prev => ({
        ...prev,
        [numero]: novoCliente
      }))
      
      toast({
        title: "Entrada Registrada",
        description: `Cliente ${numero} registrado com sucesso. Tempo de patinação: ${tempoSelecionado} minutos.`,
      })
    }
    
    setNumeroCliente("")
  }

  const registrarSaida = () => {
    const numero = parseInt(numeroCliente)
    
    if (clientes[numero]) {
      setClientes(prev => {
        const { [numero]: removed, ...rest } = prev
        return rest
      })
      
      toast({
        title: "Saída Registrada",
        description: `Cliente ${numero} removido da pista de patinação.`,
      })
      setNumeroCliente("")
    } else {
      toast({
        title: "Erro",
        description: `Cliente ${numero} não encontrado na pista.`,
        variant: "destructive"
      })
    }
  }

  const verificarCliente = () => {
    const numero = parseInt(numeroCliente)
    
    if (clientes[numero]) {
      const cliente = clientes[numero]
      const agora = new Date()
      let tempoRestante: number
      
      if (cliente.pausado) {
        tempoRestante = cliente.tempoPausado
      } else {
        tempoRestante = cliente.saida.getTime() - agora.getTime()
      }
      
      const minutos = Math.floor(tempoRestante / 60000)
      const segundos = Math.floor((tempoRestante % 60000) / 1000)
      
      toast({
        title: `Cliente ${numero}`,
        description: `Entrada: ${cliente.entrada.toLocaleTimeString()}
Saída prevista: ${cliente.saida.toLocaleTimeString()}
Tempo total: ${cliente.tempo} minutos
Tempo restante: ${minutos}:${segundos < 10 ? '0' : ''}${segundos}
Status: ${cliente.pausado ? 'Pausado' : 'Em andamento'}`,
      })
    } else {
      toast({
        title: "Erro",
        description: `Cliente ${numero} não encontrado na pista.`,
        variant: "destructive"
      })
    }
  }

  const pausarRetomar = () => {
    const numero = numeroCliente ? parseInt(numeroCliente) : null
    const agora = new Date()
    
    if (numero && clientes[numero]) {
      // Pausar/retomar cliente específico
      const cliente = clientes[numero]
      
      if (cliente.pausado) {
        // Retomar
        const tempoPausado = agora.getTime() - (cliente.momentoPausa?.getTime() || 0)
        setClientes(prev => ({
          ...prev,
          [numero]: {
            ...prev[numero],
            saida: new Date(prev[numero].saida.getTime() + tempoPausado),
            pausado: false,
            momentoPausa: null
          }
        }))
        
        toast({
          title: "Tempo Retomado",
          description: `Tempo retomado para o cliente ${numero}.`,
        })
      } else {
        // Pausar
        const tempoRestante = cliente.saida.getTime() - agora.getTime()
        setClientes(prev => ({
          ...prev,
          [numero]: {
            ...prev[numero],
            tempoPausado: tempoRestante,
            pausado: true,
            momentoPausa: agora
          }
        }))
        
        toast({
          title: "Tempo Pausado",
          description: `Tempo pausado para o cliente ${numero}.`,
        })
      }
    } else {
      // Pausar/retomar todos os clientes
      const clientesArray = Object.values(clientes)
      const todosJaPausados = clientesArray.every(c => c.pausado)
      
      const novosClientes = { ...clientes }
      
      Object.keys(clientes).forEach(numeroStr => {
        const num = parseInt(numeroStr)
        const cliente = clientes[num]
        
        if (todosJaPausados) {
          // Retomar todos
          const tempoPausado = agora.getTime() - (cliente.momentoPausa?.getTime() || 0)
          novosClientes[num] = {
            ...cliente,
            saida: new Date(cliente.saida.getTime() + tempoPausado),
            pausado: false,
            momentoPausa: null
          }
        } else {
          // Pausar todos
          const tempoRestante = cliente.saida.getTime() - agora.getTime()
          novosClientes[num] = {
            ...cliente,
            tempoPausado: tempoRestante,
            pausado: true,
            momentoPausa: agora
          }
        }
      })
      
      setClientes(novosClientes)
      
      toast({
        title: todosJaPausados ? "Tempo Retomado" : "Tempo Pausado",
        description: `Tempo ${todosJaPausados ? 'retomado' : 'pausado'} para todos os clientes.`,
      })
    }
  }

  const formatarTempoRestante = (cliente: ClientePista) => {
    const agora = new Date()
    let tempoRestante: number
    
    if (cliente.pausado) {
      tempoRestante = cliente.tempoPausado
    } else {
      tempoRestante = cliente.saida.getTime() - agora.getTime()
    }
    
    const minutos = Math.floor(tempoRestante / 60000)
    const segundos = Math.floor((tempoRestante % 60000) / 1000)
    
    const tempoFormatado = tempoRestante >= 0 
      ? `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`
      : `-${Math.abs(minutos)}:${Math.abs(segundos) < 10 ? '0' : ''}${Math.abs(segundos)}`
    
    return tempoFormatado
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Snow On Ice - Gerenciador da Pista</h1>
      </div>

      {/* Contador */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">
              Total de clientes no Snow On Ice: {contadorClientes}
            </h2>
          </div>
        </CardContent>
      </Card>

      {/* Controles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Controles da Pista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Número do Cliente (1-999)</Label>
              <Input
                type="number"
                min="1"
                max="999"
                value={numeroCliente}
                onChange={(e) => setNumeroCliente(e.target.value)}
                placeholder="Digite o número do cliente"
              />
            </div>

            <div>
              <Label>Tempo de Patinação</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="30"
                    checked={tempoSelecionado === 30}
                    onChange={(e) => setTempoSelecionado(parseInt(e.target.value))}
                  />
                  30 minutos
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="60"
                    checked={tempoSelecionado === 60}
                    onChange={(e) => setTempoSelecionado(parseInt(e.target.value))}
                  />
                  60 minutos
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={registrarEntrada} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Registrar Entrada
              </Button>
              <Button onClick={registrarSaida} variant="outline" className="w-full">
                <UserMinus className="w-4 h-4 mr-2" />
                Registrar Saída
              </Button>
              <Button onClick={verificarCliente} variant="outline" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Verificar Cliente
              </Button>
              <Button onClick={pausarRetomar} variant="outline" className="w-full">
                {numeroCliente && clientes[parseInt(numeroCliente)]?.pausado ? (
                  <Play className="w-4 h-4 mr-2" />
                ) : (
                  <Pause className="w-4 h-4 mr-2" />
                )}
                Pausar/Retomar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas da Pista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{contadorClientes}</div>
                <div className="text-sm text-blue-600">Clientes Ativos</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(clientes).filter(c => !c.pausado).length}
                </div>
                <div className="text-sm text-green-600">Em Patinação</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(clientes).filter(c => c.pausado).length}
                </div>
                <div className="text-sm text-yellow-600">Pausados</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.values(clientes).reduce((total, c) => total + c.tempo, 0)}
                </div>
                <div className="text-sm text-purple-600">Min. Totais</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes no Snow On Ice</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(clientes).length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente na pista</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída Prevista</TableHead>
                  <TableHead>Tempo Restante</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(clientes).map((cliente) => (
                  <TableRow 
                    key={cliente.numero}
                    className={cliente.pausado ? "bg-red-50" : ""}
                  >
                    <TableCell className="font-medium">
                      Cliente {cliente.numero}
                    </TableCell>
                    <TableCell>
                      {cliente.entrada.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      {cliente.saida.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatarTempoRestante(cliente)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={cliente.pausado ? "destructive" : "default"}
                      >
                        {cliente.pausado ? "Pausado" : "Em andamento"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

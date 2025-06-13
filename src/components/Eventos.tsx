import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2, Users, Ticket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getEventos, createEvento, updateEvento, deleteEvento } from "@/lib/supabase-utils"

interface Evento {
  id: string
  nome: string
  descricao: string
  data: string
  horario: string
  capacidade: number
  preco: number
  ingressos_vendidos: number
  status: "Programado" | "Em andamento" | "Finalizado" | "Cancelado"
}

export function Eventos() {
  const { toast } = useToast()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    data: "",
    horario: "",
    capacidade: "",
    preco: ""
  })

  useEffect(() => {
    carregarEventos()
  }, [])

  const carregarEventos = async () => {
    console.log('Carregando eventos...')
    setLoadingData(true)
    try {
      const result = await getEventos()
      console.log('Resultado eventos:', result)

      if (result.error) {
        console.error('Erro ao carregar eventos:', result.error)
        toast({
          title: "Erro",
          description: "Erro ao carregar eventos: " + result.error.message,
          variant: "destructive"
        })
      } else {
        console.log('Eventos carregados:', result.data)
        setEventos(result.data || [])
      }
    } catch (error) {
      console.error('Erro geral ao carregar eventos:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos do sistema",
        variant: "destructive"
      })
    } finally {
      setLoadingData(false)
    }
  }

  const resetForm = () => {
    setForm({
      nome: "",
      descricao: "",
      data: "",
      horario: "",
      capacidade: "",
      preco: ""
    })
    setEditandoEvento(null)
  }

  const abrirDialog = (evento?: Evento) => {
    if (evento) {
      setEditandoEvento(evento)
      setForm({
        nome: evento.nome,
        descricao: evento.descricao,
        data: evento.data,
        horario: evento.horario,
        capacidade: evento.capacidade.toString(),
        preco: evento.preco.toString()
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const fecharDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const salvarEvento = async () => {
    if (!form.nome || !form.data || !form.horario || !form.capacidade || !form.preco) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const dadosEvento = {
        nome: form.nome,
        descricao: form.descricao || null,
        data: form.data,
        horario: form.horario,
        capacidade: parseInt(form.capacidade),
        preco: parseFloat(form.preco),
        ingressos_vendidos: editandoEvento?.ingressos_vendidos || 0,
        status: (editandoEvento?.status || "Programado") as "Programado" | "Em andamento" | "Finalizado" | "Cancelado"
      }

      console.log('Salvando evento:', dadosEvento)

      if (editandoEvento) {
        const { error } = await updateEvento(editandoEvento.id, dadosEvento)
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Evento atualizado com sucesso!"
        })
      } else {
        const { error } = await createEvento(dadosEvento)
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Evento criado com sucesso!"
        })
      }

      fecharDialog()
      carregarEventos()
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar evento",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const excluirEvento = async (id: string) => {
    try {
      console.log('Excluindo evento:', id)
      
      const { error } = await deleteEvento(id)
      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!",
      })
      
      carregarEventos()
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      toast({
        title: "Erro",
        description: "Erro ao excluir evento",
        variant: "destructive"
      })
    }
  }

  const alterarStatus = async (id: string, novoStatus: Evento['status']) => {
    try {
      const { error } = await updateEvento(id, { status: novoStatus })
      if (error) throw error

      toast({
        title: "Sucesso",
        description: `Status do evento alterado para ${novoStatus}`,
      })
      
      carregarEventos()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: "Erro",
        description: "Erro ao alterar status do evento",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "Programado": "bg-blue-100 text-blue-800",
      "Em andamento": "bg-green-100 text-green-800",
      "Finalizado": "bg-gray-100 text-gray-800",
      "Cancelado": "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors]
  }

  const estatisticas = {
    totalEventos: eventos.length,
    programados: eventos.filter(e => e.status === "Programado").length,
    emAndamento: eventos.filter(e => e.status === "Em andamento").length,
    finalizados: eventos.filter(e => e.status === "Finalizado").length,
    totalIngressos: eventos.reduce((total, evento) => total + evento.ingressos_vendidos, 0),
    faturamento: eventos.reduce((total, evento) => total + (evento.ingressos_vendidos * evento.preco), 0)
  }

  if (loadingData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestão de Eventos</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestão de Eventos</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editandoEvento ? "Editar Evento" : "Novo Evento"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Nome do Evento *</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Digite o nome do evento"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <Textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descrição do evento"
                  rows={3}
                />
              </div>

              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Horário *</Label>
                <Input
                  type="time"
                  value={form.horario}
                  onChange={(e) => setForm({ ...form, horario: e.target.value })}
                />
              </div>

              <div>
                <Label>Capacidade *</Label>
                <Input
                  type="number"
                  value={form.capacidade}
                  onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
                  placeholder="Número de vagas"
                />
              </div>
              
              <div>
                <Label>Preço do Ingresso (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <Button onClick={salvarEvento} className="flex-1" disabled={loading}>
                  {loading ? "Salvando..." : editandoEvento ? "Atualizar" : "Criar Evento"}
                </Button>
                <Button variant="outline" onClick={fecharDialog}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{estatisticas.totalEventos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingressos Vendidos</p>
                <p className="text-2xl font-bold">{estatisticas.totalIngressos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eventos Ativos</p>
                <p className="text-2xl font-bold">{estatisticas.programados + estatisticas.emAndamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold">R$ {estatisticas.faturamento.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum evento cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Vendidos</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.map((evento) => (
                  <TableRow key={evento.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{evento.nome}</p>
                        {evento.descricao && (
                          <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{new Date(evento.data).toLocaleDateString('pt-BR')}</p>
                        <p className="text-sm text-muted-foreground">{evento.horario}</p>
                      </div>
                    </TableCell>
                    <TableCell>{evento.capacidade}</TableCell>
                    <TableCell>
                      {evento.ingressos_vendidos} 
                      <span className="text-sm text-muted-foreground">
                        / {evento.capacidade}
                      </span>
                    </TableCell>
                    <TableCell>R$ {evento.preco.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(evento.status)}>
                        {evento.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirDialog(evento)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirEvento(evento.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

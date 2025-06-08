
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tickets, Settings, Users } from "lucide-react"

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  maxCapacity: number
  currentSold: number
  isActive: boolean
}

export function TicketTypeManager() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: "1",
      name: "Patinação Livre",
      description: "Entrada para patinação livre na pista",
      price: 25,
      maxCapacity: 50,
      currentSold: 32,
      isActive: true,
    },
    {
      id: "2",
      name: "Aula de Hockey",
      description: "Aula de hockey para iniciantes",
      price: 45,
      maxCapacity: 20,
      currentSold: 18,
      isActive: true,
    },
    {
      id: "3",
      name: "Festa de Aniversário",
      description: "Pacote completo para festa de aniversário",
      price: 120,
      maxCapacity: 30,
      currentSold: 15,
      isActive: true,
    },
  ])

  const [newTicketType, setNewTicketType] = useState({
    name: "",
    description: "",
    price: 0,
    maxCapacity: 0,
  })

  const handleAddTicketType = () => {
    const ticketType: TicketType = {
      id: Date.now().toString(),
      ...newTicketType,
      currentSold: 0,
      isActive: true,
    }
    setTicketTypes([...ticketTypes, ticketType])
    setNewTicketType({ name: "", description: "", price: 0, maxCapacity: 0 })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Ingressos</h1>
          <p className="text-muted-foreground">Gerencie tipos de ingressos e vendas</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Tickets className="w-4 h-4 mr-2" />
              Novo Tipo de Ingresso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Tipo de Ingresso</DialogTitle>
              <DialogDescription>
                Configure um novo tipo de ingresso para eventos na pista
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Ingresso</Label>
                <Input
                  id="name"
                  value={newTicketType.name}
                  onChange={(e) => setNewTicketType({ ...newTicketType, name: e.target.value })}
                  placeholder="Ex: Patinação Livre"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTicketType.description}
                  onChange={(e) => setNewTicketType({ ...newTicketType, description: e.target.value })}
                  placeholder="Descreva o que inclui este ingresso"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newTicketType.price}
                    onChange={(e) => setNewTicketType({ ...newTicketType, price: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacidade Máxima</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newTicketType.maxCapacity}
                    onChange={(e) => setNewTicketType({ ...newTicketType, maxCapacity: Number(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
              <Button onClick={handleAddTicketType} className="w-full">
                Criar Tipo de Ingresso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ticketTypes.map((ticketType) => (
          <Card key={ticketType.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ticketType.name}</CardTitle>
                  <CardDescription className="mt-1">{ticketType.description}</CardDescription>
                </div>
                <Badge variant={ticketType.isActive ? "default" : "secondary"}>
                  {ticketType.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço</span>
                  <span className="text-lg font-bold text-primary">R$ {ticketType.price.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vendidos</span>
                    <span>{ticketType.currentSold} / {ticketType.maxCapacity}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(ticketType.currentSold / ticketType.maxCapacity) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((ticketType.currentSold / ticketType.maxCapacity) * 100)}% ocupado
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="w-3 h-3 mr-1" />
                    Vendas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

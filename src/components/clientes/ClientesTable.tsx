
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

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

interface ClientesTableProps {
  clientes: Cliente[]
  vendas: Venda[]
  filtro: string
}

export function ClientesTable({ clientes, vendas, filtro }: ClientesTableProps) {
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

  if (clientesFiltrados.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          {filtro ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
        </p>
      </div>
    )
  }

  return (
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
  )
}

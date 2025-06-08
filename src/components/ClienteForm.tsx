
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

interface ClienteFormProps {
  onClienteAdicionado: () => void
}

export function ClienteForm({ onClienteAdicionado }: ClienteFormProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cpf: ""
  })
  const [errors, setErrors] = useState({
    nome: "",
    telefone: "",
    cpf: ""
  })

  const formatarTelefone = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '')
    
    // Limita a 11 dígitos
    const limitado = numeros.slice(0, 11)
    
    // Aplica a formatação (01) 234567890
    if (limitado.length <= 2) {
      return limitado
    } else if (limitado.length <= 11) {
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`
    }
    
    return limitado
  }

  const formatarCPF = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '')
    
    // Limita a 11 dígitos
    const limitado = numeros.slice(0, 11)
    
    // Aplica a formatação 123456789-00
    if (limitado.length <= 9) {
      return limitado
    } else {
      return `${limitado.slice(0, 9)}-${limitado.slice(9)}`
    }
  }

  const validarFormulario = () => {
    const novosErros = {
      nome: "",
      telefone: "",
      cpf: ""
    }

    // Validar nome
    if (!formData.nome.trim()) {
      novosErros.nome = "Nome é obrigatório"
    }

    // Validar telefone (deve ter exatamente 11 dígitos)
    const telefoneNumeros = formData.telefone.replace(/\D/g, '')
    if (telefoneNumeros.length !== 11) {
      novosErros.telefone = "Telefone deve ter 11 dígitos"
    }

    // Validar CPF (deve ter exatamente 11 dígitos)
    const cpfNumeros = formData.cpf.replace(/\D/g, '')
    if (cpfNumeros.length !== 11) {
      novosErros.cpf = "CPF deve ter 11 dígitos"
    }

    setErrors(novosErros)
    return !Object.values(novosErros).some(erro => erro !== "")
  }

  const handleInputChange = (field: string, value: string) => {
    let valorFormatado = value

    if (field === 'telefone') {
      valorFormatado = formatarTelefone(value)
    } else if (field === 'cpf') {
      valorFormatado = formatarCPF(value)
    }

    setFormData(prev => ({
      ...prev,
      [field]: valorFormatado
    }))

    // Limpar erro quando usuário começar a digitar
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarFormulario()) {
      return
    }

    // Obter clientes existentes
    const clientesExistentes = JSON.parse(localStorage.getItem('clientes') || '[]')
    
    // Verificar se CPF já existe
    const cpfNumeros = formData.cpf.replace(/\D/g, '')
    const cpfJaExiste = clientesExistentes.some((cliente: any) => {
      const cpfExistente = (cliente.cpf || '').replace(/\D/g, '')
      return cpfExistente === cpfNumeros
    })

    if (cpfJaExiste) {
      setErrors(prev => ({
        ...prev,
        cpf: "CPF já cadastrado"
      }))
      return
    }

    // Criar novo cliente
    const novoCliente = {
      id: Math.random().toString(36).substr(2, 9),
      nome: formData.nome.trim(),
      email: "", // Email não é obrigatório neste formulário
      telefone: formData.telefone,
      cpf: formData.cpf,
      categoria: "Bronze" as const
    }

    // Salvar no localStorage
    const novosClientes = [...clientesExistentes, novoCliente]
    localStorage.setItem('clientes', JSON.stringify(novosClientes))

    // Resetar formulário
    setFormData({
      nome: "",
      telefone: "",
      cpf: ""
    })
    setErrors({
      nome: "",
      telefone: "",
      cpf: ""
    })

    setIsOpen(false)
    onClienteAdicionado()

    toast({
      title: "Sucesso",
      description: "Cliente cadastrado com sucesso!",
    })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4" />
        Adicionar Cliente
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Digite o nome completo"
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 999999999"
              />
              {errors.telefone && (
                <p className="text-sm text-destructive">{errors.telefone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="123456789-00"
              />
              {errors.cpf && (
                <p className="text-sm text-destructive">{errors.cpf}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Cadastrar Cliente
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

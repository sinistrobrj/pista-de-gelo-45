
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"

interface UserFormProps {
  onUserAdded: () => void
}

export function UserForm({ onUserAdded }: UserFormProps) {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    tipo: "Funcionario" as "Administrador" | "Funcionario",
    permissoes: [] as string[]
  })

  const permissoesDisponiveis = [
    "vendas",
    "estoque", 
    "relatorios",
    "clientes",
    "eventos",
    "pista"
  ]

  // Só mostrar o botão se for administrador
  if (profile?.tipo !== 'Administrador') {
    return null
  }

  const handlePermissaoChange = (permissao: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissoes: [...prev.permissoes, permissao]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissoes: prev.permissoes.filter(p => p !== permissao)
      }))
    }
  }

  const handleTipoChange = (tipo: "Administrador" | "Funcionario") => {
    setFormData(prev => ({
      ...prev,
      tipo,
      permissoes: tipo === "Administrador" 
        ? [...permissoesDisponiveis, "usuarios", "admin"]
        : []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.email || !formData.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome
          }
        }
      })

      if (authError) {
        toast({
          title: "Erro ao criar usuário",
          description: authError.message,
          variant: "destructive"
        })
        return
      }

      if (authData.user) {
        // Criar perfil na tabela profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            nome: formData.nome,
            email: formData.email,
            tipo: formData.tipo,
            permissoes: formData.permissoes,
            ativo: true
          })

        if (profileError) {
          toast({
            title: "Erro ao criar perfil",
            description: profileError.message,
            variant: "destructive"
          })
          return
        }

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
        })

        // Resetar formulário
        setFormData({
          nome: "",
          email: "",
          password: "",
          tipo: "Funcionario",
          permissoes: []
        })

        setIsOpen(false)
        onUserAdded()
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast({
        title: "Erro",
        description: "Erro interno do sistema",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Senha temporária"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Usuário *</Label>
            <Select value={formData.tipo} onValueChange={handleTipoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Funcionario">Funcionário</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === "Funcionario" && (
            <div className="space-y-2">
              <Label>Permissões</Label>
              <div className="grid grid-cols-2 gap-2">
                {permissoesDisponiveis.map((permissao) => (
                  <div key={permissao} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`perm-${permissao}`}
                      checked={formData.permissoes.includes(permissao)}
                      onChange={(e) => handlePermissaoChange(permissao, e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor={`perm-${permissao}`} className="text-sm capitalize">
                      {permissao}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Criando..." : "Criar Usuário"}
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
  )
}

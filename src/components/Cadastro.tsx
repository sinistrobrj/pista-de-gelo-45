import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { User } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { UserPlus, Users, Package, Calendar, DollarSign, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from "sonner"
import { PhoneInput } from "@/components/PhoneInput"
import { CpfInput } from "@/components/cpf-input"

interface Produto {
  id: string;
  nome: string;
  categoria: 'Ingresso' | 'Ingresso evento' | 'Produtos';
  preco: number;
  estoque: number;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  categoria: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  pontos: number;
  total_gasto: number;
  created_at: string;
  updated_at: string;
}

interface Evento {
  id: string;
  nome: string;
  descricao: string | null;
  data: string;
  horario: string;
  capacidade: number;
  preco: number;
  ingressos_vendidos: number;
  status: 'Programado' | 'Em andamento' | 'Finalizado' | 'Cancelado';
  created_at: string;
  updated_at: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'Administrador' | 'Funcionario' | 'Visitante';
  permissoes: string[];
  ativo: boolean;
  ultimo_login: string | null;
  created_at: string;
  updated_at: string;
  tempo_acesso_minutos?: number | null;
  login_expira_em?: string | null;
  tempo_restante_minutos?: number | null;
  senha_temporaria?: string | null;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function Cadastro() {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para Usuários
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<'Administrador' | 'Funcionario' | 'Visitante'>("Funcionario");
  const [senhaUsuario, setSenhaUsuario] = useState("");
  const [confirmarSenhaUsuario, setConfirmarSenhaUsuario] = useState("");
  const [ativoUsuario, setAtivoUsuario] = useState(true);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  // Estados para Clientes
  const [nomeCliente, setNomeCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [categoriaCliente, setCategoriaCliente] = useState<'Bronze' | 'Prata' | 'Ouro' | 'Diamante'>("Bronze");
  const [cpfCliente, setCpfCliente] = useState("");

  // Estados para Produtos
  const [nomeProduto, setNomeProduto] = useState("");
  const [categoriaProduto, setCategoriaProduto] = useState<'Ingresso' | 'Ingresso evento' | 'Produtos'>("Ingresso");
  const [precoProduto, setPrecoProduto] = useState<number>(0);
  const [estoqueProduto, setEstoqueProduto] = useState<number>(0);
  const [descricaoProduto, setDescricaoProduto] = useState<string | null>("");

  // Estados para Eventos
  const [nomeEvento, setNomeEvento] = useState("");
  const [descricaoEvento, setDescricaoEvento] = useState<string | null>("");
  const [dataEvento, setDataEvento] = useState<Date | null>(null);
  const [horarioEvento, setHorarioEvento] = useState("");
  const [capacidadeEvento, setCapacidadeEvento] = useState<number>(0);
  const [precoEvento, setPrecoEvento] = useState<number>(0);
  const [statusEvento, setStatusEvento] = useState<'Programado' | 'Em andamento' | 'Finalizado' | 'Cancelado'>("Programado");

  // Funções para buscar dados
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Erro ao buscar usuários.");
      } else {
        setUsuarios(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('clientes').select('*');
      if (error) {
        console.error("Erro ao buscar clientes:", error);
        toast.error("Erro ao buscar clientes.");
      } else {
        setClientes(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) {
        console.error("Erro ao buscar produtos:", error);
        toast.error("Erro ao buscar produtos.");
      } else {
        setProdutos(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('eventos').select('*');
      if (error) {
        console.error("Erro ao buscar eventos:", error);
        toast.error("Erro ao buscar eventos.");
      } else {
        setEventos(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchClientes();
    fetchProdutos();
    fetchEventos();
  }, []);

  // Funções para criar novos registros
  const criarUsuario = async () => {
    if (senhaUsuario !== confirmarSenhaUsuario) {
      toast.error("Senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailUsuario,
        password: senhaUsuario,
      });

      if (authError) {
        console.error("Erro ao criar usuário na autenticação:", authError);
        toast.error(`Erro ao criar usuário na autenticação: ${authError.message}`);
        return;
      }

      const newUser = authData.user;

      if (newUser) {
        const { error } = await supabase.from('profiles').insert([
          {
            id: newUser.id,
            nome: nomeUsuario,
            email: emailUsuario,
            tipo: tipoUsuario,
            ativo: ativoUsuario,
            permissoes: [],
          },
        ]);

        if (error) {
          console.error("Erro ao criar usuário:", error);
          toast.error("Erro ao criar usuário.");
          // Optionally delete the user from auth if profile creation fails
          await supabase.auth.admin.deleteUser(newUser.id);
        } else {
          toast.success("Usuário criado com sucesso!");
          setNomeUsuario("");
          setEmailUsuario("");
          setSenhaUsuario("");
          setConfirmarSenhaUsuario("");
          setAtivoUsuario(true);
          fetchUsuarios(); // Refresh user list
        }
      }
    } catch (err: any) {
      console.error("Erro ao criar usuário:", err.message);
      toast.error(`Erro ao criar usuário: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const criarCliente = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('clientes').insert([
        {
          nome: nomeCliente,
          email: emailCliente,
          telefone: telefoneCliente,
          categoria: categoriaCliente,
          pontos: 0,
          total_gasto: 0,
        },
      ]);

      if (error) {
        console.error("Erro ao criar cliente:", error);
        toast.error("Erro ao criar cliente.");
      } else {
        toast.success("Cliente criado com sucesso!");
        setNomeCliente("");
        setEmailCliente("");
        setTelefoneCliente("");
        setCpfCliente("");
        setCategoriaCliente("Bronze");
        fetchClientes(); // Refresh client list
      }
    } finally {
      setLoading(false);
    }
  };

  const criarProduto = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('produtos').insert([
        {
          nome: nomeProduto,
          categoria: categoriaProduto,
          preco: precoProduto,
          estoque: estoqueProduto,
          descricao: descricaoProduto,
        },
      ]);

      if (error) {
        console.error("Erro ao criar produto:", error);
        toast.error("Erro ao criar produto.");
      } else {
        toast.success("Produto criado com sucesso!");
        setNomeProduto("");
        setCategoriaProduto("Ingresso");
        setPrecoProduto(0);
        setEstoqueProduto(0);
        setDescricaoProduto("");
        fetchProdutos(); // Refresh product list
      }
    } finally {
      setLoading(false);
    }
  };

  const criarEvento = async () => {
    if (!dataEvento) {
      toast.error("Por favor, selecione a data do evento.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('eventos').insert([
        {
          nome: nomeEvento,
          descricao: descricaoEvento,
          data: formatDate(dataEvento),
          horario: horarioEvento,
          capacidade: capacidadeEvento,
          preco: precoEvento,
          ingressos_vendidos: 0,
          status: statusEvento,
        },
      ]);

      if (error) {
        console.error("Erro ao criar evento:", error);
        toast.error("Erro ao criar evento.");
      } else {
        toast.success("Evento criado com sucesso!");
        setNomeEvento("");
        setDescricaoEvento("");
        setDataEvento(null);
        setHorarioEvento("");
        setCapacidadeEvento(0);
        setPrecoEvento(0);
        setStatusEvento("Programado");
        fetchEventos(); // Refresh event list
      }
    } finally {
      setLoading(false);
    }
  };

  // Funções para excluir registros
  const excluirUsuario = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);

      if (error) {
        console.error("Erro ao excluir usuário:", error);
        toast.error("Erro ao excluir usuário.");
      } else {
        toast.success("Usuário excluído com sucesso!");
        fetchUsuarios(); // Refresh user list
      }
    } finally {
      setLoading(false);
    }
  };

  const excluirCliente = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);

      if (error) {
        console.error("Erro ao excluir cliente:", error);
        toast.error("Erro ao excluir cliente.");
      } else {
        toast.success("Cliente excluído com sucesso!");
        fetchClientes(); // Refresh client list
      }
    } finally {
      setLoading(false);
    }
  };

  const excluirProduto = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);

      if (error) {
        console.error("Erro ao excluir produto:", error);
        toast.error("Erro ao excluir produto.");
      } else {
        toast.success("Produto excluído com sucesso!");
        fetchProdutos(); // Refresh product list
      }
    } finally {
      setLoading(false);
    }
  };

  const excluirEvento = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('eventos').delete().eq('id', id);

      if (error) {
        console.error("Erro ao excluir evento:", error);
        toast.error("Erro ao excluir evento.");
      } else {
        toast.success("Evento excluído com sucesso!");
        fetchEventos(); // Refresh event list
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Cadastros</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="usuarios">
                <Users className="mr-2 h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="clientes">
                <UserPlus className="mr-2 h-4 w-4" />
                Clientes
              </TabsTrigger>
              <TabsTrigger value="produtos">
                <Package className="mr-2 h-4 w-4" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="eventos">
                <Calendar className="mr-2 h-4 w-4" />
                Eventos
              </TabsTrigger>
            </TabsList>
            <Separator className="my-4" />

            {/* Cadastro de Usuários */}
            <TabsContent value="usuarios" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeUsuario">Nome</Label>
                  <Input
                    type="text"
                    id="nomeUsuario"
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emailUsuario">Email</Label>
                  <Input
                    type="email"
                    id="emailUsuario"
                    value={emailUsuario}
                    onChange={(e) => setEmailUsuario(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tipoUsuario">Tipo</Label>
                  <Select value={tipoUsuario} onValueChange={(value) => setTipoUsuario(value as 'Administrador' | 'Funcionario' | 'Visitante')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Funcionario">Funcionário</SelectItem>
                      <SelectItem value="Visitante">Visitante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="senhaUsuario">Senha</Label>
                  <div className="relative">
                    <Input
                      type={senhaVisivel ? "text" : "password"}
                      id="senhaUsuario"
                      value={senhaUsuario}
                      onChange={(e) => setSenhaUsuario(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setSenhaVisivel(!senhaVisivel)}
                      type="button"
                    >
                      {senhaVisivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmarSenhaUsuario">Confirmar Senha</Label>
                  <Input
                    type="password"
                    id="confirmarSenhaUsuario"
                    value={confirmarSenhaUsuario}
                    onChange={(e) => setConfirmarSenhaUsuario(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="ativoUsuario">Ativo</Label>
                  <Switch
                    id="ativoUsuario"
                    checked={ativoUsuario}
                    onCheckedChange={(checked) => setAtivoUsuario(checked)}
                  />
                </div>
              </div>
              <Button onClick={criarUsuario} disabled={loading}>
                Criar Usuário
              </Button>

              <Separator className="my-4" />

              {/* Listagem de Usuários */}
              <div>
                <h3>Lista de Usuários</h3>
                {loading ? (
                  <p>Carregando usuários...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usuarios.map((usuario) => (
                          <tr key={usuario.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{usuario.nome}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{usuario.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{usuario.tipo}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {usuario.ativo ? <Badge>Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => excluirUsuario(usuario.id)}
                                disabled={loading}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Cadastro de Clientes */}
            <TabsContent value="clientes" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeCliente">Nome</Label>
                  <Input
                    type="text"
                    id="nomeCliente"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emailCliente">Email</Label>
                  <Input
                    type="email"
                    id="emailCliente"
                    value={emailCliente}
                    onChange={(e) => setEmailCliente(e.target.value)}
                  />
                </div>
                 <div>
                    <Label htmlFor="cpfCliente">CPF</Label>
                    <CpfInput
                      id="cpfCliente"
                      value={cpfCliente}
                      onChange={(value) => setCpfCliente(value)}
                    />
                  </div>
                <div>
                  <Label htmlFor="telefoneCliente">Telefone</Label>
                  <PhoneInput
                    id="telefoneCliente"
                    value={telefoneCliente}
                    onChange={(value) => setTelefoneCliente(value)}
                  />
                </div>
                <div>
                  <Label htmlFor="categoriaCliente">Categoria</Label>
                  <Select value={categoriaCliente} onValueChange={(value) => setCategoriaCliente(value as 'Bronze' | 'Prata' | 'Ouro' | 'Diamante')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                      <SelectItem value="Prata">Prata</SelectItem>
                      <SelectItem value="Ouro">Ouro</SelectItem>
                      <SelectItem value="Diamante">Diamante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={criarCliente} disabled={loading}>
                Criar Cliente
              </Button>

              <Separator className="my-4" />

              {/* Listagem de Clientes */}
              <div>
                <h3>Lista de Clientes</h3>
                {loading ? (
                  <p>Carregando clientes...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Telefone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clientes.map((cliente) => (
                          <tr key={cliente.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{cliente.nome}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cliente.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cliente.telefone}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{cliente.categoria}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => excluirCliente(cliente.id)}
                                disabled={loading}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Cadastro de Produtos */}
            <TabsContent value="produtos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeProduto">Nome</Label>
                  <Input
                    type="text"
                    id="nomeProduto"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="categoriaProduto">Categoria</Label>
                  <Select value={categoriaProduto} onValueChange={(value) => setCategoriaProduto(value as 'Ingresso' | 'Ingresso evento' | 'Produtos')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ingresso">Ingresso</SelectItem>
                      <SelectItem value="Ingresso evento">Ingresso evento</SelectItem>
                      <SelectItem value="Produtos">Produtos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="precoProduto">Preço</Label>
                  <Input
                    type="number"
                    id="precoProduto"
                    value={precoProduto}
                    onChange={(e) => setPrecoProduto(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="estoqueProduto">Estoque</Label>
                  <Input
                    type="number"
                    id="estoqueProduto"
                    value={estoqueProduto}
                    onChange={(e) => setEstoqueProduto(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="descricaoProduto">Descrição</Label>
                  <Input
                    type="text"
                    id="descricaoProduto"
                    value={descricaoProduto || ""}
                    onChange={(e) => setDescricaoProduto(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={criarProduto} disabled={loading}>
                Criar Produto
              </Button>

              <Separator className="my-4" />

              {/* Listagem de Produtos */}
              <div>
                <h3>Lista de Produtos</h3>
                {loading ? (
                  <p>Carregando produtos...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estoque
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {produtos.map((produto) => (
                          <tr key={produto.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{produto.nome}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{produto.categoria}</td>
                            <td className="px-6 py-4 whitespace-nowrap">R$ {produto.preco.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{produto.estoque}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => excluirProduto(produto.id)}
                                disabled={loading}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Cadastro de Eventos */}
            <TabsContent value="eventos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeEvento">Nome</Label>
                  <Input
                    type="text"
                    id="nomeEvento"
                    value={nomeEvento}
                    onChange={(e) => setNomeEvento(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="descricaoEvento">Descrição</Label>
                  <Input
                    type="text"
                    id="descricaoEvento"
                    value={descricaoEvento || ""}
                    onChange={(e) => setDescricaoEvento(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dataEvento">Data</Label>
                  <Input
                    type="date"
                    id="dataEvento"
                    onChange={(e) => setDataEvento(new Date(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="horarioEvento">Horário</Label>
                  <Input
                    type="time"
                    id="horarioEvento"
                    value={horarioEvento}
                    onChange={(e) => setHorarioEvento(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="capacidadeEvento">Capacidade</Label>
                  <Input
                    type="number"
                    id="capacidadeEvento"
                    value={capacidadeEvento}
                    onChange={(e) => setCapacidadeEvento(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="precoEvento">Preço</Label>
                  <Input
                    type="number"
                    id="precoEvento"
                    value={precoEvento}
                    onChange={(e) => setPrecoEvento(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="statusEvento">Status</Label>
                  <Select value={statusEvento} onValueChange={(value) => setStatusEvento(value as 'Programado' | 'Em andamento' | 'Finalizado' | 'Cancelado')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programado">Programado</SelectItem>
                      <SelectItem value="Em andamento">Em andamento</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={criarEvento} disabled={loading}>
                Criar Evento
              </Button>

              <Separator className="my-4" />

              {/* Listagem de Eventos */}
              <div>
                <h3>Lista de Eventos</h3>
                {loading ? (
                  <p>Carregando eventos...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Horário
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Capacidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {eventos.map((evento) => (
                          <tr key={evento.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{evento.nome}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{evento.data}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{evento.horario}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{evento.capacidade}</td>
                            <td className="px-6 py-4 whitespace-nowrap">R$ {evento.preco.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{evento.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => excluirEvento(evento.id)}
                                disabled={loading}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

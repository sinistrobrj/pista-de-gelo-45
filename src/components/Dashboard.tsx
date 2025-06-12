
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Overview } from "./Overview";
import { RecentSales } from "./RecentSales";
import { CalendarDays, DollarSign, Package, Users, TrendingUp, ShoppingCart, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cleanUsers, getProdutos, getEventos, getClientes, getVendas } from "@/lib/supabase-utils";

export function Dashboard() {
  const { toast } = useToast();
  const [estatisticas, setEstatisticas] = useState({
    totalVendas: 0,
    clientesAtivos: 0,
    produtosEstoque: 0,
    eventosProgramados: 0,
    faturamentoMes: 0,
    clientesPista: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      console.log('Carregando estatísticas do dashboard...');
      
      const [produtosResult, eventosResult, clientesResult, vendasResult] = await Promise.all([
        getProdutos(),
        getEventos(),
        getClientes(),
        getVendas()
      ]);

      const produtos = produtosResult.data || [];
      const eventos = eventosResult.data || [];
      const clientes = clientesResult.data || [];
      const vendas = vendasResult.data || [];

      // Calcular estatísticas de forma otimizada
      const produtosEstoque = produtos.reduce((total: number, produto: any) => total + produto.estoque, 0);
      const ingressosEventosDisponiveis = eventos
        .filter((evento: any) => evento.status === "Programado")
        .reduce((total: number, evento: any) => total + (evento.capacidade - evento.ingressos_vendidos), 0);
      
      const totalEstoque = produtosEstoque + ingressosEventosDisponiveis;
      const clientesAtivos = clientes.length;
      const eventosProgramados = eventos.filter((evento: any) => evento.status === "Programado").length;

      // Calcular faturamento e vendas do período atual
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      const hojeDateString = hoje.toDateString();

      const faturamentoMes = vendas
        .filter((venda: any) => {
          const dataVenda = new Date(venda.data);
          return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
        })
        .reduce((total: number, venda: any) => total + (venda.total_final || 0), 0);

      const vendasHoje = vendas.filter((venda: any) => {
        const dataVenda = new Date(venda.data).toDateString();
        return dataVenda === hojeDateString;
      }).length;

      setEstatisticas({
        totalVendas: vendasHoje,
        clientesAtivos,
        produtosEstoque: totalEstoque,
        eventosProgramados,
        faturamentoMes,
        clientesPista: 0
      });

      console.log('Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanUsers = async () => {
    try {
      const result = await cleanUsers();
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message
        });
      } else {
        toast({
          title: "Erro",
          description: result.error?.message || "Erro ao limpar usuários",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Erro ao limpar usuários:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao limpar usuários",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao Pista de Gelo Manager</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {estatisticas.faturamentoMes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Receita total do mês atual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{estatisticas.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.produtosEstoque}</div>
            <p className="text-xs text-muted-foreground">
              Produtos e ingressos disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Programados</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.eventosProgramados}</div>
            <p className="text-xs text-muted-foreground">
              Eventos aguardando realização
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimas vendas realizadas
            </p>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Hoje
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.totalVendas}
            </div>
            <p className="text-xs text-muted-foreground">
              Transações realizadas hoje
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Crescimento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              Comparado ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes na Pista
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.clientesPista}</div>
            <p className="text-xs text-muted-foreground">
              Patinando no momento
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            <CardTitle>Administração do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleCleanUsers} variant="destructive">
              Limpar Todos os Usuários (Manter apenas Admin)
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Esta ação removerá todos os usuários do sistema, mantendo apenas o admin@icerink.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

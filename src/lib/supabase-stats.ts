
import { supabase } from '@/integrations/supabase/client'

export async function getVendasStats() {
  try {
    const { data: vendas, error } = await supabase
      .from('vendas')
      .select(`
        *,
        clientes!inner(nome),
        itens_venda(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const totalVendas = vendas?.reduce((acc, venda) => acc + (venda.total_final || 0), 0) || 0
    const totalTransacoes = vendas?.length || 0
    
    // Calcular crescimento (comparando com mês anterior)
    const agora = new Date()
    const mesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const mesPassado = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
    
    const vendasMesAtual = vendas?.filter(v => new Date(v.created_at) >= mesAtual) || []
    const vendasMesPassado = vendas?.filter(v => {
      const dataVenda = new Date(v.created_at)
      return dataVenda >= mesPassado && dataVenda < mesAtual
    }) || []
    
    const totalMesAtual = vendasMesAtual.reduce((acc, v) => acc + (v.total_final || 0), 0)
    const totalMesPassado = vendasMesPassado.reduce((acc, v) => acc + (v.total_final || 0), 0)
    
    const crescimento = totalMesPassado > 0 ? ((totalMesAtual - totalMesPassado) / totalMesPassado) * 100 : 0

    return {
      data: {
        totalVendas,
        totalTransacoes,
        crescimento,
        vendas: vendas || []
      },
      error: null
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas de vendas:', error)
    return { data: null, error }
  }
}

export async function getVendasRecentes(limit = 5) {
  try {
    const { data: vendas, error } = await supabase
      .from('vendas')
      .select(`
        *,
        clientes!inner(nome)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { data: vendas || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar vendas recentes:', error)
    return { data: [], error }
  }
}

export async function getAnalyticsData() {
  try {
    // Buscar dados de clientes
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')

    if (clientesError) throw clientesError

    // Buscar vendas com itens
    const { data: vendas, error: vendasError } = await supabase
      .from('vendas')
      .select(`
        *,
        clientes!inner(nome),
        itens_venda!inner(*, produtos!inner(nome))
      `)

    if (vendasError) throw vendasError

    // Estatísticas de clientes
    const totalClientes = clientes?.length || 0
    const agora = new Date()
    const mesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const novosMesAtual = clientes?.filter(c => new Date(c.created_at) >= mesAtual).length || 0
    
    // Ticket médio
    const totalVendas = vendas?.reduce((acc, v) => acc + (v.total_final || 0), 0) || 0
    const ticketMedio = vendas?.length ? totalVendas / vendas.length : 0
    
    // Taxa de retenção (clientes que compraram mais de uma vez)
    const clientesComMultiplasCompras = vendas?.reduce((acc, venda) => {
      acc[venda.cliente_id] = (acc[venda.cliente_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    const clientesRecorrentes = Object.values(clientesComMultiplasCompras).filter(count => count > 1).length
    const taxaRetencao = totalClientes > 0 ? (clientesRecorrentes / totalClientes) * 100 : 0

    // Vendas por mês (últimos 6 meses)
    const vendasPorMes = []
    for (let i = 5; i >= 0; i--) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      const proximoMes = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1)
      
      const vendasDoMes = vendas?.filter(v => {
        const dataVenda = new Date(v.created_at)
        return dataVenda >= data && dataVenda < proximoMes
      }) || []
      
      vendasPorMes.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        vendas: vendasDoMes.length
      })
    }

    // Categorias de clientes
    const categoriaClientes = clientes?.reduce((acc, cliente) => {
      const categoria = cliente.categoria || 'Bronze'
      acc[categoria] = (acc[categoria] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const categoriaClientesData = Object.entries(categoriaClientes).map(([nome, value]) => ({
      name: nome,
      value
    }))

    // Produtos mais vendidos
    const produtosMaisVendidos = vendas?.reduce((acc, venda) => {
      venda.itens_venda?.forEach((item: any) => {
        const nomeProduto = item.produtos?.nome || 'Produto não identificado'
        if (!acc[nomeProduto]) {
          acc[nomeProduto] = { nome: nomeProduto, quantidade: 0 }
        }
        acc[nomeProduto].quantidade += item.quantidade
      })
      return acc
    }, {} as Record<string, { nome: string; quantidade: number }>) || {}

    const produtosMaisVendidosData = Object.values(produtosMaisVendidos)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5)

    return {
      data: {
        stats: {
          totalClientes,
          novosMesAtual,
          ticketMedio,
          taxaRetencao
        },
        vendasPorMes,
        categoriaClientes: categoriaClientesData,
        produtosMaisVendidos: produtosMaisVendidosData
      },
      error: null
    }
  } catch (error) {
    console.error('Erro ao buscar dados de analytics:', error)
    return { data: null, error }
  }
}

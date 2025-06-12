
import { supabase } from '@/integrations/supabase/client'

export async function createVenda(venda: any, itens: any[]) {
  try {
    console.log('Criando venda:', venda)
    console.log('Itens da venda:', itens)

    // Criar venda
    const { data: vendaData, error: vendaError } = await supabase
      .from('vendas')
      .insert(venda)
      .select()
      .single()

    if (vendaError || !vendaData) {
      console.error('Erro ao criar venda:', vendaError)
      throw vendaError
    }

    console.log('Venda criada:', vendaData)

    // Criar itens da venda
    const itensComVendaId = itens.map(item => ({
      venda_id: vendaData.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.subtotal
    }))

    console.log('Inserindo itens da venda:', itensComVendaId)

    const { error: itensError } = await supabase
      .from('itens_venda')
      .insert(itensComVendaId)

    if (itensError) {
      console.error('Erro ao inserir itens da venda:', itensError)
      throw itensError
    }

    // Usar uma única transação para atualizar estoque
    const produtoIds = itens.map(item => item.produto_id)
    const { data: produtosAtuais, error: produtosError } = await supabase
      .from('produtos')
      .select('id, estoque')
      .in('id', produtoIds)

    if (produtosError) {
      console.error('Erro ao buscar produtos:', produtosError)
      throw produtosError
    }

    // Atualizar estoque em lote
    const atualizacoesEstoque = itens.map(item => {
      const produtoAtual = produtosAtuais?.find(p => p.id === item.produto_id)
      if (produtoAtual) {
        return supabase
          .from('produtos')
          .update({ estoque: produtoAtual.estoque - item.quantidade })
          .eq('id', item.produto_id)
      }
      return null
    }).filter(Boolean)

    await Promise.all(atualizacoesEstoque)

    // Atualizar cliente em uma única operação
    if (venda.cliente_id) {
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('pontos, total_gasto')
        .eq('id', venda.cliente_id)
        .single()

      if (!clienteError && cliente) {
        const pontosGanhos = Math.floor(venda.total_final)
        await supabase
          .from('clientes')
          .update({
            pontos: (cliente.pontos || 0) + pontosGanhos,
            total_gasto: (cliente.total_gasto || 0) + venda.total_final
          })
          .eq('id', venda.cliente_id)
      }
    }

    console.log('Venda finalizada com sucesso')
    return { data: vendaData, error: null }
  } catch (error) {
    console.error('Erro geral na criação da venda:', error)
    return { data: null, error }
  }
}

let cachedItens: any[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 30000 // 30 segundos

export async function getItensVenda() {
  try {
    const now = Date.now()
    
    // Usar cache se os dados foram buscados recentemente
    if (cachedItens && (now - lastFetchTime) < CACHE_DURATION) {
      return { data: cachedItens, error: null }
    }

    const [produtosResult, eventosResult] = await Promise.all([
      supabase.from('produtos').select('*').order('nome'),
      supabase.from('eventos').select('*').eq('status', 'Programado').order('data', { ascending: true })
    ])

    const produtos = produtosResult.data || []
    const eventos = eventosResult.data || []

    // Converter eventos em "produtos" de ingresso apenas se tiverem capacidade
    const ingressosEventos = eventos
      .filter(evento => evento.ingressos_vendidos < evento.capacidade)
      .map(evento => ({
        id: `evento_${evento.id}`,
        nome: `Ingresso - ${evento.nome}`,
        categoria: 'Evento',
        preco: evento.preco,
        estoque: evento.capacidade - evento.ingressos_vendidos,
        descricao: `${evento.descricao} - ${new Date(evento.data).toLocaleDateString()} às ${evento.horario}`,
        tipo: 'evento',
        evento_id: evento.id
      }))

    // Adicionar tipo aos produtos normais
    const produtosComTipo = produtos.map(produto => ({
      ...produto,
      tipo: 'produto'
    }))

    const todosItens = [...produtosComTipo, ...ingressosEventos]
    
    // Atualizar cache
    cachedItens = todosItens
    lastFetchTime = now

    return { data: todosItens, error: null }
  } catch (error) {
    console.error('Erro ao buscar itens para venda:', error)
    return { data: [], error }
  }
}

// Função para limpar cache quando necessário
export function clearItensCache() {
  cachedItens = null
  lastFetchTime = 0
}

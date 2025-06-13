
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

    // Processar itens para vendas de eventos e produtos
    const itensVendaPromises = itens.map(async (item) => {
      // Se for um ingresso de evento, atualizar a quantidade vendida
      if (item.produto_id.startsWith('evento_')) {
        const eventoId = item.produto_id.replace('evento_', '')
        
        // Buscar evento atual
        const { data: evento, error: eventoError } = await supabase
          .from('eventos')
          .select('ingressos_vendidos')
          .eq('id', eventoId)
          .maybeSingle()

        if (!eventoError && evento) {
          // Atualizar ingressos vendidos
          await supabase
            .from('eventos')
            .update({ 
              ingressos_vendidos: evento.ingressos_vendidos + item.quantidade 
            })
            .eq('id', eventoId)
        }

        // Criar item de venda com produto_id do evento
        return {
          venda_id: vendaData.id,
          produto_id: eventoId, // usar o ID real do evento
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal
        }
      } else {
        // Para produtos normais, atualizar estoque
        const { data: produtoAtual, error: produtoError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.produto_id)
          .maybeSingle()

        if (!produtoError && produtoAtual) {
          await supabase
            .from('produtos')
            .update({ estoque: produtoAtual.estoque - item.quantidade })
            .eq('id', item.produto_id)
        }

        return {
          venda_id: vendaData.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal
        }
      }
    })

    const itensProcessados = await Promise.all(itensVendaPromises)

    console.log('Inserindo itens da venda:', itensProcessados)

    const { error: itensError } = await supabase
      .from('itens_venda')
      .insert(itensProcessados)

    if (itensError) {
      console.error('Erro ao inserir itens da venda:', itensError)
      throw itensError
    }

    // Atualizar cliente
    if (venda.cliente_id) {
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('pontos, total_gasto')
        .eq('id', venda.cliente_id)
        .maybeSingle()

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

    // Limpar cache após venda
    clearItensCache()

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
      console.log('Usando cache de itens de venda')
      return { data: cachedItens, error: null }
    }

    console.log('Buscando itens de venda do banco...')

    const [produtosResult, eventosResult] = await Promise.all([
      supabase.from('produtos').select('*').order('nome'),
      supabase.from('eventos').select('*').eq('status', 'Programado').order('data', { ascending: true })
    ])

    const produtos = produtosResult.data || []
    const eventos = eventosResult.data || []

    console.log('Produtos encontrados:', produtos.length)
    console.log('Eventos encontrados:', eventos.length)

    // Converter eventos em "produtos" de ingresso apenas se tiverem capacidade
    const ingressosEventos = eventos
      .filter(evento => evento.ingressos_vendidos < evento.capacidade)
      .map(evento => ({
        id: `evento_${evento.id}`,
        nome: `Ingresso - ${evento.nome}`,
        categoria: 'Evento',
        preco: evento.preco,
        estoque: evento.capacidade - evento.ingressos_vendidos,
        descricao: `${evento.descricao || ''} - ${new Date(evento.data).toLocaleDateString()} às ${evento.horario}`,
        tipo: 'evento',
        evento_id: evento.id
      }))

    console.log('Ingressos de eventos processados:', ingressosEventos.length)

    // Adicionar tipo aos produtos normais
    const produtosComTipo = produtos.map(produto => ({
      ...produto,
      tipo: 'produto'
    }))

    const todosItens = [...produtosComTipo, ...ingressosEventos]
    
    console.log('Total de itens disponíveis:', todosItens.length)
    
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
  console.log('Limpando cache de itens de venda')
  cachedItens = null
  lastFetchTime = 0
}

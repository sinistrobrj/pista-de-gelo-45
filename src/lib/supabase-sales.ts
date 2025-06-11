
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

    // Atualizar estoque dos produtos
    for (const item of itens) {
      const { data: produto } = await supabase
        .from('produtos')
        .select('estoque')
        .eq('id', item.produto_id)
        .single()

      if (produto) {
        await supabase
          .from('produtos')
          .update({ estoque: produto.estoque - item.quantidade })
          .eq('id', item.produto_id)
      }
    }

    // Atualizar pontos e total gasto do cliente
    if (venda.cliente_id) {
      const { data: cliente } = await supabase
        .from('clientes')
        .select('pontos, total_gasto')
        .eq('id', venda.cliente_id)
        .single()

      if (cliente) {
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

export async function getItensVenda() {
  try {
    const [produtosResult, eventosResult] = await Promise.all([
      supabase.from('produtos').select('*').order('nome'),
      supabase.from('eventos').select('*').order('data', { ascending: true })
    ])

    const produtos = produtosResult.data || []
    const eventos = eventosResult.data || []

    // Converter eventos em "produtos" de ingresso
    const ingressosEventos = eventos
      .filter(evento => evento.status === 'Programado' && evento.ingressos_vendidos < evento.capacidade)
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

    return { data: todosItens, error: null }
  } catch (error) {
    console.error('Erro ao buscar itens para venda:', error)
    return { data: [], error }
  }
}

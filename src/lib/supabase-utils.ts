
import { supabase } from '@/integrations/supabase/client'

// Funções para clientes
export async function getClientes() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export async function createCliente(cliente: any) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateCliente(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Funções para produtos
export async function getProdutos() {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome')
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export async function createProduto(produto: any) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert(produto)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateProduto(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function deleteProduto(id: string) {
  try {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
    
    return { error }
  } catch (error) {
    return { error }
  }
}

// Funções para eventos
export async function getEventos() {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('data', { ascending: true })
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export async function createEvento(evento: any) {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .insert(evento)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateEvento(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Funções para vendas
export async function getVendas() {
  try {
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        *,
        clientes(nome, email, cpf),
        profiles(nome),
        itens_venda(
          *,
          produtos(nome, categoria)
        )
      `)
      .order('data', { ascending: false })
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export async function createVenda(venda: any, itens: any[]) {
  try {
    // Criar venda
    const { data: vendaData, error: vendaError } = await supabase
      .from('vendas')
      .insert(venda)
      .select()
      .single()

    if (vendaError || !vendaData) {
      throw vendaError
    }

    // Criar itens da venda
    const itensComVendaId = itens.map(item => ({
      venda_id: vendaData.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      subtotal: item.subtotal
    }))

    const { error: itensError } = await supabase
      .from('itens_venda')
      .insert(itensComVendaId)

    if (itensError) {
      throw itensError
    }

    return { data: vendaData, error: null }
  } catch (error) {
    console.error('Erro na criação da venda:', error)
    return { data: null, error }
  }
}

// Funções para regras de fidelidade
export async function getRegrasFidelidade() {
  try {
    const { data, error } = await supabase
      .from('regras_fidelidade')
      .select('*')
      .order('requisito_minimo')
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export async function updateRegraFidelidade(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('regras_fidelidade')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Função para obter todos os itens disponíveis para venda
export async function getItensVenda() {
  try {
    const [produtosResult, eventosResult] = await Promise.all([
      getProdutos(),
      getEventos()
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

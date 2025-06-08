
import { supabase } from '@/integrations/supabase/client'

// Função para criar usuário administrador padrão
export async function createDefaultAdmin() {
  try {
    console.log('Verificando se admin já existe...')
    
    // Verificar se já existe um usuário admin
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@icerink.com')
      .maybeSingle()

    if (existingAdmin) {
      console.log('Usuário administrador já existe')
      return { success: true, message: 'Administrador já existe' }
    }

    console.log('Chamando edge function para criar admin...')

    // Chamar a edge function para criar o admin
    const { data, error } = await supabase.functions.invoke('create-admin')

    if (error) {
      console.error('Erro na edge function:', error)
      throw error
    }

    console.log('Resposta da edge function:', data)
    return { success: true, message: 'Administrador criado com sucesso', data }
  } catch (error) {
    console.error('Erro ao criar administrador:', error)
    return { success: false, error }
  }
}

// Funções para clientes
export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nome')
  
  return { data: data || [], error }
}

export async function createCliente(cliente: any) {
  const { data, error } = await supabase
    .from('clientes')
    .insert(cliente)
    .select()
    .single()
  
  return { data, error }
}

export async function updateCliente(id: string, updates: any) {
  const { data, error } = await supabase
    .from('clientes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// Funções para produtos
export async function getProdutos() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome')
  
  return { data: data || [], error }
}

export async function createProduto(produto: any) {
  const { data, error } = await supabase
    .from('produtos')
    .insert(produto)
    .select()
    .single()
  
  return { data, error }
}

export async function updateProduto(id: string, updates: any) {
  const { data, error } = await supabase
    .from('produtos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// Funções para eventos
export async function getEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: true })
  
  return { data: data || [], error }
}

export async function createEvento(evento: any) {
  const { data, error } = await supabase
    .from('eventos')
    .insert(evento)
    .select()
    .single()
  
  return { data, error }
}

export async function updateEvento(id: string, updates: any) {
  const { data, error } = await supabase
    .from('eventos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// Funções para vendas
export async function getVendas() {
  const { data, error } = await supabase
    .from('vendas')
    .select(`
      *,
      clientes(nome, email),
      profiles(nome),
      itens_venda(
        *,
        produtos(nome, categoria)
      )
    `)
    .order('data', { ascending: false })
  
  return { data: data || [], error }
}

export async function createVenda(venda: any, itens: any[]) {
  try {
    // Criar venda
    const { data: vendaData, error: vendaError } = await supabase
      .from('vendas')
      .insert(venda)
      .select()
      .single()

    if (vendaError || !vendaData) throw vendaError

    // Criar itens da venda
    const itensComVendaId = itens.map(item => ({
      ...item,
      venda_id: vendaData.id
    }))

    const { error: itensError } = await supabase
      .from('itens_venda')
      .insert(itensComVendaId)

    if (itensError) throw itensError

    // Atualizar estoque
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

    return { data: vendaData, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Funções para controle da pista
export async function getPistaControle() {
  const { data, error } = await supabase
    .from('pista_controle')
    .select('*')
    .order('entrada', { ascending: false })
  
  return { data: data || [], error }
}

export async function createPistaControle(controle: any) {
  const { data, error } = await supabase
    .from('pista_controle')
    .insert(controle)
    .select()
    .single()
  
  return { data, error }
}

export async function updatePistaControle(id: string, updates: any) {
  const { data, error } = await supabase
    .from('pista_controle')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deletePistaControle(id: string) {
  const { error } = await supabase
    .from('pista_controle')
    .delete()
    .eq('id', id)
  
  return { error }
}

// Função para obter usuários
export async function getUsuarios() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nome')
  
  return { data: data || [], error }
}

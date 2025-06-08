
import { supabase } from '@/integrations/supabase/client'

// Função para criar usuário administrador padrão
export async function createDefaultAdmin() {
  try {
    // Verificar se já existe um usuário admin
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@icerink.com')
      .single()

    if (existingAdmin) {
      console.log('Usuário administrador já existe')
      return { success: true, message: 'Administrador já existe' }
    }

    // Criar usuário administrador
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@icerink.com',
      password: '101010',
      email_confirm: true,
      user_metadata: {
        nome: 'Administrador'
      }
    })

    if (error) {
      throw error
    }

    // Atualizar perfil para administrador
    if (data.user) {
      await supabase
        .from('profiles')
        .update({
          tipo: 'Administrador',
          permissoes: ['todos']
        })
        .eq('id', data.user.id)
    }

    return { success: true, message: 'Administrador criado com sucesso' }
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

    if (vendaError) throw vendaError

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
      await supabase
        .from('produtos')
        .update({
          estoque: supabase.rpc('decrement_estoque', {
            produto_id: item.produto_id,
            quantidade: item.quantidade
          })
        })
        .eq('id', item.produto_id)
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

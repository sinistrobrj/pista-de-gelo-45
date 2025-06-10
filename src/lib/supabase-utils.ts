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

// Função para criar usuário do sistema com senha temporária
export async function createSystemUser(userData: any) {
  try {
    // Gerar senha temporária
    const senhaTemporaria = Math.random().toString(36).slice(-8) + '123'
    
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: senhaTemporaria,
      email_confirm: true,
      user_metadata: {
        nome: userData.nome
      }
    })

    if (authError) throw authError

    // Atualizar perfil com informações adicionais
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        nome: userData.nome,
        tipo: userData.tipo,
        permissoes: userData.permissoes || [],
        senha_temporaria: senhaTemporaria
      })
      .eq('id', authData.user.id)

    if (profileError) throw profileError

    return { data: { ...authData.user, senha_temporaria: senhaTemporaria }, error: null }
  } catch (error) {
    return { data: null, error }
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

export async function deleteProduto(id: string) {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)
  
  return { error }
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
      clientes(nome, email, cpf),
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

    // Atualizar estoque e cliente
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

// Funções para regras de fidelidade
export async function getRegrasFidelidade() {
  const { data, error } = await supabase
    .from('regras_fidelidade')
    .select('*')
    .order('requisito_minimo')
  
  return { data: data || [], error }
}

export async function updateRegraFidelidade(id: string, updates: any) {
  const { data, error } = await supabase
    .from('regras_fidelidade')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

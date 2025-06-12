import { supabase } from '@/integrations/supabase/client'

// Cache para reduzir consultas desnecessárias
let cachedData: { [key: string]: { data: any, timestamp: number } } = {}
const CACHE_DURATION = 30000 // 30 segundos

function getCachedData(key: string) {
  const cached = cachedData[key]
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cachedData[key] = { data, timestamp: Date.now() }
}

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

// Função para limpar todos os usuários exceto admin@icerink.com
export async function cleanUsers() {
  try {
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: {
        action: 'cleanUsers'
      }
    })

    if (error) throw error

    return { success: true, message: data.message }
  } catch (error) {
    console.error('Erro ao limpar usuários:', error)
    return { success: false, error }
  }
}

// Função para criar usuário do sistema com senha temporária
export async function createSystemUser(userData: any) {
  try {
    // Gerar senha temporária
    const senhaTemporaria = Math.random().toString(36).slice(-8) + '123'
    
    // Chamar edge function para criar usuário
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: {
        action: 'createUser',
        email: userData.email,
        password: senhaTemporaria,
        nome: userData.nome,
        tipo: userData.tipo,
        permissoes: userData.permissoes || []
      }
    })

    if (error) throw error

    return { 
      data: { 
        ...data.user, 
        senha_temporaria: data.senha_temporaria 
      }, 
      error: null 
    }
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return { data: null, error }
  }
}

// Função para corrigir permissões do admin
export async function fixAdminPermissions() {
  try {
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: {
        action: 'fixAdminPermissions'
      }
    })

    if (error) throw error

    return { success: true, message: data.message }
  } catch (error) {
    console.error('Erro ao corrigir permissões:', error)
    return { success: false, error }
  }
}

// Funções para clientes
export async function getClientes() {
  try {
    const cached = getCachedData('clientes')
    if (cached) {
      return { data: cached, error: null }
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')
    
    if (!error && data) {
      setCachedData('clientes', data)
    }
    
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
    
    // Limpar cache
    delete cachedData['clientes']
    
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
    
    // Limpar cache
    delete cachedData['clientes']
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Funções para produtos
export async function getProdutos() {
  try {
    const cached = getCachedData('produtos')
    if (cached) {
      return { data: cached, error: null }
    }

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome')
    
    if (!error && data) {
      setCachedData('produtos', data)
    }
    
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
    
    // Limpar cache
    delete cachedData['produtos']
    
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
    
    // Limpar cache
    delete cachedData['produtos']
    
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
    
    // Limpar cache
    delete cachedData['produtos']
    
    return { error }
  } catch (error) {
    return { error }
  }
}

// Funções para eventos
export async function getEventos() {
  try {
    const cached = getCachedData('eventos')
    if (cached) {
      return { data: cached, error: null }
    }

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('data', { ascending: true })
    
    if (!error && data) {
      setCachedData('eventos', data)
    }
    
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
    
    // Limpar cache
    delete cachedData['eventos']
    
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
    
    // Limpar cache
    delete cachedData['eventos']
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Funções para vendas
export async function getVendas() {
  try {
    const cached = getCachedData('vendas')
    if (cached) {
      return { data: cached, error: null }
    }

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
    
    if (!error && data) {
      setCachedData('vendas', data)
    }
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

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

    // Limpar caches relacionados
    delete cachedData['vendas']
    delete cachedData['produtos']
    delete cachedData['clientes']
    delete cachedData['itens_venda']

    console.log('Venda finalizada com sucesso')
    return { data: vendaData, error: null }
  } catch (error) {
    console.error('Erro geral na criação da venda:', error)
    return { data: null, error }
  }
}

// Funções para controle da pista
export async function getPistaControle() {
  try {
    const { data, error } = await supabase
      .from('pista_controle')
      .select('*')
      .order('entrada', { ascending: false })
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

export async function createPistaControle(controle: any) {
  try {
    const { data, error } = await supabase
      .from('pista_controle')
      .insert(controle)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updatePistaControle(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('pista_controle')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export async function deletePistaControle(id: string) {
  try {
    const { error } = await supabase
      .from('pista_controle')
      .delete()
      .eq('id', id)
    
    return { error }
  } catch (error) {
    return { error }
  }
}

// Função para obter usuários
export async function getUsuarios() {
  try {
    const cached = getCachedData('usuarios')
    if (cached) {
      return { data: cached, error: null }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nome')
    
    if (!error && data) {
      setCachedData('usuarios', data)
    }
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

// Funções para regras de fidelidade
export async function getRegrasFidelidade() {
  try {
    const cached = getCachedData('regras_fidelidade')
    if (cached) {
      return { data: cached, error: null }
    }

    const { data, error } = await supabase
      .from('regras_fidelidade')
      .select('*')
      .order('requisito_minimo')
    
    if (!error && data) {
      setCachedData('regras_fidelidade', data)
    }
    
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
    
    // Limpar cache
    delete cachedData['regras_fidelidade']
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Função para obter todos os itens disponíveis para venda (produtos + eventos como ingressos)
export async function getItensVenda() {
  try {
    const cached = getCachedData('itens_venda')
    if (cached) {
      return { data: cached, error: null }
    }

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
    
    setCachedData('itens_venda', todosItens)

    return { data: todosItens, error: null }
  } catch (error) {
    console.error('Erro ao buscar itens para venda:', error)
    return { data: [], error }
  }
}

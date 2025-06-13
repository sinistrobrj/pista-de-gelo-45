
import { supabase } from '@/integrations/supabase/client'

// Cache simples para otimização
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

function getCacheKey(table: string, params?: any) {
  return `${table}_${JSON.stringify(params || {})}`
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

function getCache(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

// Funções de administração
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
      return { 
        success: true, 
        message: 'Usuário administrador já existe',
        admin: {
          email: 'admin@icerink.com',
          senha: '101010'
        }
      }
    }

    console.log('Criando novo usuário administrador...')

    // Criar usuário administrador
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: 'admin@icerink.com',
      password: '101010',
      options: {
        data: {
          nome: 'Administrador'
        }
      }
    })

    if (userError) {
      console.error('Erro ao criar usuário:', userError)
      return { success: false, error: userError }
    }

    console.log('Usuário criado, aguardando confirmação...')

    return { 
      success: true, 
      message: 'Administrador criado com sucesso',
      admin: {
        email: 'admin@icerink.com',
        senha: '101010'
      }
    }

  } catch (error) {
    console.error('Erro ao criar admin:', error)
    return { success: false, error }
  }
}

export async function fixAdminPermissions() {
  try {
    console.log('Corrigindo permissões do administrador...')
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        tipo: 'Administrador',
        permissoes: ['vendas', 'estoque', 'relatorios', 'clientes', 'eventos', 'pista', 'admin', 'usuarios'],
        ativo: true
      })
      .eq('email', 'admin@icerink.com')
      .select()

    if (error) {
      console.error('Erro ao corrigir permissões:', error)
      return { success: false, error }
    }

    return { 
      success: true, 
      message: 'Permissões do administrador corrigidas com sucesso',
      data
    }

  } catch (error) {
    console.error('Erro ao corrigir permissões:', error)
    return { success: false, error }
  }
}

// Função para criar novo usuário/administrador/visitante
export async function createUser(userData: {
  nome: string
  email: string
  senha: string
  tipo: 'Administrador' | 'Funcionario' | 'Visitante'
  permissoes: string[]
}) {
  try {
    console.log('Criando novo usuário:', userData.email)

    // Criar usuário na autenticação
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.senha,
      options: {
        data: {
          nome: userData.nome
        }
      }
    })

    if (userError) {
      console.error('Erro ao criar usuário:', userError)
      return { success: false, error: userError }
    }

    console.log('Usuário criado com sucesso')

    return { 
      success: true, 
      message: 'Usuário criado com sucesso',
      user
    }

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return { success: false, error }
  }
}

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

export async function deleteEvento(id: string) {
  try {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id)
    
    return { error }
  } catch (error) {
    return { error }
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

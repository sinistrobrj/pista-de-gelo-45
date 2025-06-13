
import { supabase } from '@/integrations/supabase/client'

export async function createVisitante(visitanteData: {
  nome: string
  cpf: string
  telefone: string
}) {
  try {
    console.log('Criando visitante:', visitanteData.nome)

    // Gerar email automaticamente
    const nomeUsuario = visitanteData.nome.toLowerCase().replace(/\s+/g, '')
    const email = `${nomeUsuario}@visitante.com`
    
    // Gerar senha com os 6 primeiros dígitos do CPF
    const cpfDigits = visitanteData.cpf.replace(/\D/g, '')
    const senha = cpfDigits.substring(0, 6)

    if (senha.length < 6) {
      throw new Error('CPF deve ter pelo menos 6 dígitos para gerar a senha')
    }

    // Criar usuário na autenticação
    const { data: user, error: userError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome: visitanteData.nome
        }
      }
    })

    if (userError) {
      console.error('Erro ao criar usuário visitante:', userError)
      return { success: false, error: userError }
    }

    console.log('Visitante criado com sucesso')

    return { 
      success: true, 
      message: 'Visitante criado com sucesso',
      visitante: {
        email,
        senha,
        nome: visitanteData.nome
      }
    }

  } catch (error) {
    console.error('Erro ao criar visitante:', error)
    return { success: false, error }
  }
}

export async function iniciarSessaoVisitante(userId: string, minutos: number = 15) {
  try {
    // Verificar se a função RPC existe, senão usar UPDATE direto
    try {
      const { error } = await supabase.rpc('atualizar_login_visitante', {
        user_id: userId,
        minutos: minutos
      })

      if (error) {
        throw error
      }
    } catch (rpcError) {
      // Se a função RPC não existir, usar UPDATE direto
      console.log('Função RPC não encontrada, usando UPDATE direto')
      const expiraEm = new Date()
      expiraEm.setMinutes(expiraEm.getMinutes() + minutos)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          login_expira_em: expiraEm.toISOString(),
          tempo_acesso_minutos: minutos,
          tempo_restante_minutos: minutos,
          ultimo_login: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('tipo', 'Visitante')

      if (updateError) {
        throw updateError
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao iniciar sessão do visitante:', error)
    return { success: false, error }
  }
}

export async function adicionarTempoVisitante(userId: string, minutosAdicionais: number) {
  try {
    // Buscar tempo atual
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('login_expira_em, tempo_acesso_minutos')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar perfil do visitante:', fetchError)
      return { success: false, error: fetchError }
    }

    const novoTempo = (profile?.tempo_acesso_minutos || 0) + minutosAdicionais
    
    try {
      const { error } = await supabase.rpc('atualizar_login_visitante', {
        user_id: userId,
        minutos: novoTempo
      })

      if (error) {
        throw error
      }
    } catch (rpcError) {
      // Se a função RPC não existir, usar UPDATE direto
      const expiraEm = new Date()
      expiraEm.setMinutes(expiraEm.getMinutes() + novoTempo)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          login_expira_em: expiraEm.toISOString(),
          tempo_acesso_minutos: novoTempo,
          tempo_restante_minutos: novoTempo
        })
        .eq('id', userId)
        .eq('tipo', 'Visitante')

      if (updateError) {
        throw updateError
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao adicionar tempo ao visitante:', error)
    return { success: false, error }
  }
}

export async function getVisitantes() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('tipo', 'Visitante')
      .order('nome')
    
    return { data: data || [], error }
  } catch (error) {
    return { data: [], error }
  }
}

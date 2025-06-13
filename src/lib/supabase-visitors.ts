
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
    const { error } = await supabase.rpc('atualizar_login_visitante', {
      user_id: userId,
      minutos: minutos
    })

    if (error) {
      console.error('Erro ao iniciar sessão do visitante:', error)
      return { success: false, error }
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

    const novoTempo = (profile.tempo_acesso_minutos || 0) + minutosAdicionais
    
    const { error } = await supabase.rpc('atualizar_login_visitante', {
      user_id: userId,
      minutos: novoTempo
    })

    if (error) {
      console.error('Erro ao adicionar tempo ao visitante:', error)
      return { success: false, error }
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

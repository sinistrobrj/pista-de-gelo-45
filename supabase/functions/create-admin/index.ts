
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Iniciando criação do usuário administrador...')

    // Verificar se já existe um usuário admin
    const { data: existingAdmin } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', 'admin@icerink.com')
      .maybeSingle()

    if (existingAdmin) {
      console.log('Usuário administrador já existe')
      return new Response(
        JSON.stringify({ 
          message: 'Usuário administrador já existe',
          admin: {
            email: 'admin@icerink.com',
            senha: '101010'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log('Criando novo usuário administrador...')

    // Criar usuário administrador
    const { data: user, error: userError } = await supabaseClient.auth.admin.createUser({
      email: 'admin@icerink.com',
      password: '101010',
      email_confirm: true,
      user_metadata: {
        nome: 'Administrador'
      }
    })

    if (userError) {
      console.error('Erro ao criar usuário:', userError)
      throw userError
    }

    console.log('Usuário criado com sucesso:', user.user?.id)

    // Aguardar um pouco para garantir que o trigger foi executado
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Atualizar perfil para administrador
    if (user.user) {
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          tipo: 'Administrador',
          permissoes: ['todos']
        })
        .eq('id', user.user.id)
        .select()

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError)
        throw profileError
      }

      console.log('Perfil atualizado com sucesso:', profileData)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Administrador criado com sucesso',
        admin: {
          email: 'admin@icerink.com',
          senha: '101010'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

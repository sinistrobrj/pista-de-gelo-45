
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

    // Verificar se já existe um usuário admin
    const { data: existingAdmin } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('email', 'admin@icerink.com')
      .single()

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ message: 'Usuário administrador já existe' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

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
      throw userError
    }

    // Atualizar perfil para administrador
    if (user.user) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          tipo: 'Administrador',
          permissoes: ['todos']
        })
        .eq('id', user.user.id)

      if (profileError) {
        throw profileError
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Administrador criado com sucesso',
        user: {
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})


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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { action, ...data } = await req.json()

    switch (action) {
      case 'createUser': {
        const { email, password, nome, tipo, permissoes } = data
        
        // Criar usuário no auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nome }
        })

        if (authError) throw authError

        // Criar/atualizar perfil
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: authData.user.id,
            nome,
            email,
            tipo,
            permissoes: tipo === 'Administrador' ? ['vendas', 'estoque', 'relatorios', 'clientes', 'eventos', 'pista', 'admin', 'usuarios'] : permissoes || [],
            ativo: true
          })

        if (profileError) throw profileError

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: authData.user,
            senha_temporaria: password
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'fixAdminPermissions': {
        // Buscar usuário admin@icerink.com
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) throw listError

        const admin = users.users.find(user => user.email === 'admin@icerink.com')
        
        if (!admin) {
          throw new Error('Usuário admin@icerink.com não encontrado')
        }

        // Atualizar perfil do admin
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: admin.id,
            nome: 'Administrador Principal',
            email: 'admin@icerink.com',
            tipo: 'Administrador',
            permissoes: ['vendas', 'estoque', 'relatorios', 'clientes', 'eventos', 'pista', 'admin', 'usuarios'],
            ativo: true
          })

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ success: true, message: 'Permissões corrigidas com sucesso' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      default:
        throw new Error('Ação não reconhecida')
    }

  } catch (error) {
    console.error('Erro na função manage-users:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

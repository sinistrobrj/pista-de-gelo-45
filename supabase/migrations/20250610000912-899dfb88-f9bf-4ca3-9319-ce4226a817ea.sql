
-- Verificar e corrigir possíveis problemas de RLS na tabela profiles
-- Desabilitar RLS temporariamente para corrigir o problema
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Garantir que o usuário admin existe e tem o tipo correto
INSERT INTO public.profiles (id, nome, email, tipo, permissoes, ativo)
VALUES (
  'd4155715-a09a-41cf-8538-d7fef1fb9b1b',
  'Administrador',
  'admin@icerink.com',
  'Administrador',
  ARRAY['vendas', 'estoque', 'relatorios', 'clientes', 'eventos', 'pista', 'admin', 'usuarios'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  tipo = 'Administrador',
  permissoes = ARRAY['vendas', 'estoque', 'relatorios', 'clientes', 'eventos', 'pista', 'admin', 'usuarios'],
  ativo = true;

-- Reabilitar RLS com políticas mais simples
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Criar políticas mais simples que não causem recursão
CREATE POLICY "Allow authenticated users to view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow insert for new users"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

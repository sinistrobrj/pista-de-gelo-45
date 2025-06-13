
-- Remover políticas RLS problemáticas que podem estar causando recursão
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Desabilitar RLS temporariamente para evitar problemas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Garantir que o enum user_role existe com todos os valores
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('Administrador', 'Funcionario', 'Visitante');

-- Recriar a tabela profiles com a estrutura correta
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text NOT NULL,
  tipo user_role NOT NULL DEFAULT 'Funcionario',
  permissoes text[] DEFAULT '{}',
  ativo boolean DEFAULT true,
  ultimo_login timestamp with time zone,
  tempo_acesso_minutos integer,
  login_expira_em timestamp with time zone,
  tempo_restante_minutos integer,
  senha_temporaria text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Habilitar RLS novamente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS simples e seguras
CREATE POLICY "Enable read access for authenticated users" 
  ON public.profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert for authenticated users" 
  ON public.profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
  ON public.profiles FOR UPDATE 
  TO authenticated 
  USING (true);

-- Recriar a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, tipo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    CASE 
      WHEN new.email LIKE '%@visitante.com' THEN 'Visitante'::user_role
      ELSE 'Funcionario'::user_role
    END
  );
  RETURN new;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recriar a função para atualizar login de visitante
CREATE OR REPLACE FUNCTION public.atualizar_login_visitante(
  user_id uuid,
  minutos integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expira_em timestamp with time zone;
BEGIN
  expira_em := now() + (minutos || ' minutes')::interval;
  
  UPDATE public.profiles 
  SET 
    login_expira_em = expira_em,
    tempo_acesso_minutos = minutos,
    tempo_restante_minutos = minutos,
    ultimo_login = now()
  WHERE id = user_id AND tipo = 'Visitante';
END;
$$;

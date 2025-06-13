
-- Adicionar enum para incluir Visitante
ALTER TYPE user_role ADD VALUE 'Visitante';

-- Adicionar colunas necessárias para controle de visitantes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tempo_acesso_minutos INTEGER,
ADD COLUMN IF NOT EXISTS login_expira_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tempo_restante_minutos INTEGER;

-- Criar função para atualizar login de visitante
CREATE OR REPLACE FUNCTION public.atualizar_login_visitante(
  user_id UUID,
  minutos INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expira_em TIMESTAMP WITH TIME ZONE;
BEGIN
  expira_em := NOW() + (minutos || ' minutes')::INTERVAL;
  
  UPDATE public.profiles 
  SET 
    login_expira_em = expira_em,
    tempo_acesso_minutos = minutos,
    tempo_restante_minutos = minutos,
    ultimo_login = NOW()
  WHERE id = user_id AND tipo = 'Visitante';
END;
$$;

-- Atualizar trigger para incluir visitantes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, tipo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'nome', new.email),
    new.email,
    CASE 
      WHEN new.email LIKE '%@visitante.com' THEN 'Visitante'::user_role
      ELSE 'Funcionario'::user_role
    END
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

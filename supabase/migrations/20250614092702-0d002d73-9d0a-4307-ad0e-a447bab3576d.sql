
-- Verificar e criar tipos apenas se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Administrador', 'Funcionario', 'Visitante');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loyalty_category') THEN
        CREATE TYPE loyalty_category AS ENUM ('Bronze', 'Prata', 'Ouro', 'Diamante');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
        CREATE TYPE product_category AS ENUM ('Ingresso', 'Ingresso evento', 'Produtos');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('Programado', 'Em andamento', 'Finalizado', 'Cancelado');
    END IF;
END $$;

-- Criar tabelas apenas se não existirem
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  tipo user_role NOT NULL DEFAULT 'Funcionario',
  ativo BOOLEAN DEFAULT true,
  permissoes TEXT[] DEFAULT '{}',
  ultimo_login TIMESTAMP WITH TIME ZONE,
  tempo_acesso_minutos INTEGER,
  login_expira_em TIMESTAMP WITH TIME ZONE,
  tempo_restante_minutos INTEGER,
  senha_temporaria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  cpf TEXT,
  telefone TEXT,
  categoria loyalty_category DEFAULT 'Bronze',
  pontos INTEGER DEFAULT 0,
  total_gasto NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria product_category NOT NULL,
  preco NUMERIC NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  capacidade INTEGER NOT NULL,
  preco NUMERIC NOT NULL,
  ingressos_vendidos INTEGER DEFAULT 0,
  status event_status DEFAULT 'Programado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  usuario_id UUID NOT NULL,
  total NUMERIC NOT NULL,
  desconto NUMERIC DEFAULT 0,
  desconto_aplicado NUMERIC DEFAULT 0,
  total_final NUMERIC NOT NULL,
  data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID NOT NULL REFERENCES vendas(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regras_fidelidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  desconto_percentual INTEGER NOT NULL,
  pontos_por_real NUMERIC DEFAULT 1,
  requisito_minimo NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pista_controle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_cliente INTEGER NOT NULL,
  entrada TIMESTAMP WITH TIME ZONE NOT NULL,
  saida_prevista TIMESTAMP WITH TIME ZONE NOT NULL,
  tempo_total INTEGER NOT NULL,
  pausado BOOLEAN DEFAULT false,
  tempo_pausado INTERVAL,
  momento_pausa TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar ou substituir função para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, tipo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN NEW.email LIKE '%@visitante.com' THEN 'Visitante'::user_role
      ELSE 'Funcionario'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_produtos_updated_at ON produtos;
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_regras_fidelidade_updated_at ON regras_fidelidade;
CREATE TRIGGER update_regras_fidelidade_updated_at BEFORE UPDATE ON regras_fidelidade FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pista_controle_updated_at ON pista_controle;
CREATE TRIGGER update_pista_controle_updated_at BEFORE UPDATE ON pista_controle FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para visitantes
CREATE OR REPLACE FUNCTION atualizar_login_visitante(user_id UUID, minutos INTEGER)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND tipo = 'Administrador'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Inserir dados iniciais das regras de fidelidade apenas se não existirem
INSERT INTO regras_fidelidade (categoria, desconto_percentual, pontos_por_real, requisito_minimo) 
SELECT 'Bronze', 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM regras_fidelidade WHERE categoria = 'Bronze');

INSERT INTO regras_fidelidade (categoria, desconto_percentual, pontos_por_real, requisito_minimo) 
SELECT 'Prata', 5, 1.5, 500
WHERE NOT EXISTS (SELECT 1 FROM regras_fidelidade WHERE categoria = 'Prata');

INSERT INTO regras_fidelidade (categoria, desconto_percentual, pontos_por_real, requisito_minimo) 
SELECT 'Ouro', 10, 2, 1500
WHERE NOT EXISTS (SELECT 1 FROM regras_fidelidade WHERE categoria = 'Ouro');

INSERT INTO regras_fidelidade (categoria, desconto_percentual, pontos_por_real, requisito_minimo) 
SELECT 'Diamante', 15, 3, 5000
WHERE NOT EXISTS (SELECT 1 FROM regras_fidelidade WHERE categoria = 'Diamante');

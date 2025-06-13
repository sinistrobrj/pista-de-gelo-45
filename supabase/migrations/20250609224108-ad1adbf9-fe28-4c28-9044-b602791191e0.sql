
-- Adicionar campo senha_temporaria na tabela profiles para usuários do sistema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS senha_temporaria TEXT;

-- Adicionar campos para controle de fidelidade
CREATE TABLE IF NOT EXISTS public.regras_fidelidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  desconto_percentual INTEGER NOT NULL,
  pontos_por_real NUMERIC DEFAULT 1,
  requisito_minimo NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(categoria)
);

-- Inserir regras padrão de fidelidade
INSERT INTO public.regras_fidelidade (categoria, desconto_percentual, pontos_por_real, requisito_minimo) 
VALUES 
  ('Bronze', 0, 1, 0),
  ('Prata', 5, 1.2, 500),
  ('Ouro', 10, 1.5, 1500),
  ('Diamante', 15, 2, 5000)
ON CONFLICT (categoria) DO NOTHING;

-- Adicionar campo CPF na tabela clientes e remover email como obrigatório
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS cpf TEXT UNIQUE,
ALTER COLUMN email DROP NOT NULL;

-- Adicionar campo desconto_aplicado na tabela vendas
ALTER TABLE public.vendas 
ADD COLUMN IF NOT EXISTS desconto_aplicado NUMERIC DEFAULT 0;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_regras_fidelidade_updated_at ON public.regras_fidelidade;
CREATE TRIGGER update_regras_fidelidade_updated_at 
  BEFORE UPDATE ON public.regras_fidelidade 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.regras_fidelidade ENABLE ROW LEVEL SECURITY;

-- Políticas para regras_fidelidade (todos podem ler, só admins podem modificar)
CREATE POLICY "Todos podem ver regras de fidelidade" 
  ON public.regras_fidelidade 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Apenas administradores podem modificar regras de fidelidade" 
  ON public.regras_fidelidade 
  FOR ALL 
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

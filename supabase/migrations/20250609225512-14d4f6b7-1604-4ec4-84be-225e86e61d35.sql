
-- Atualizar o usuário admin para ter tipo Administrador
UPDATE public.profiles 
SET tipo = 'Administrador'
WHERE email = 'admin@icerink.com';

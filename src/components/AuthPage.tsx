
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Snowflake, Clock } from 'lucide-react';
import { createDefaultAdmin } from '@/lib/supabase-utils';
import { iniciarSessaoVisitante } from '@/lib/supabase-visitors';
import { supabase } from '@/integrations/supabase/client';

export function AuthPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Criar administrador padrão na inicialização
  useEffect(() => {
    const initAdmin = async () => {
      try {
        await createDefaultAdmin();
      } catch (error) {
        console.error('Erro ao criar admin:', error);
      }
    };
    initAdmin();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('Iniciando login...');
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message === 'Invalid login credentials' ? "Email ou senha incorretos" : error.message,
        variant: "destructive"
      });
    } else {
      console.log('Login bem-sucedido');
      
      // Verificar se é visitante e iniciar sessão
      if (loginData.email.includes('@visitante.com')) {
        // Aguardar um pouco para garantir que o perfil foi carregado
        setTimeout(async () => {
          try {
            // Buscar o usuário atual para pegar o ID
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await iniciarSessaoVisitante(user.id);
              toast({
                title: "Bem-vindo!",
                description: "Sessão de visitante iniciada. Você tem 15 minutos de acesso.",
                duration: 5000
              });
            }
          } catch (error) {
            console.error('Erro ao iniciar sessão de visitante:', error);
          }
        }, 1000);
      }
      
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-ice-blue p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Snowflake className="w-16 h-16 text-blue-500 animate-pulse" />
              <Snowflake className="w-8 h-8 text-ice-blue absolute -top-2 -right-2 animate-spin" style={{
                animationDuration: '3s'
              }} />
              <Snowflake className="w-6 h-6 text-blue-300 absolute -bottom-1 -left-1 animate-pulse" style={{
                animationDelay: '1s'
              }} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Nome da sua Empresa Aqui</CardTitle>
          <p className="text-muted-foreground">Sistema de Gerenciamento de Pista de Gelo (Beta)</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email:</Label>
              <Input 
                id="login-email" 
                type="email" 
                value={loginData.email} 
                onChange={e => setLoginData({ ...loginData, email: e.target.value })} 
                placeholder="Digite seu email" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha:</Label>
              <Input 
                id="login-password" 
                type="password" 
                value={loginData.password} 
                onChange={e => setLoginData({ ...loginData, password: e.target.value })} 
                placeholder="Digite sua senha" 
                required 
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
              Entrar
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-blue-50 rounded text-sm text-blue-700">
              <strong>Tipos de usuários:</strong><br />
              • <strong>Administrador:</strong> Acesso completo<br />
              • <strong>Visitante:</strong> nome@visitante.com<br />
              <Clock className="w-4 h-4 inline mr-1" />
              <em>Visitantes têm acesso limitado por tempo</em>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, LogIn, UserPlus } from 'lucide-react'
import { createDefaultAdmin } from '@/lib/supabase-utils'
import { useNavigate } from 'react-router-dom'

export function AuthPage() {
  const { signIn, signUp, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [adminCreated, setAdminCreated] = useState(false)
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  const [signupData, setSignupData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Redirecionar se usuário já estiver logado
  useEffect(() => {
    if (user) {
      console.log('Usuário logado, redirecionando...')
      navigate('/')
    }
  }, [user, navigate])

  // Criar administrador padrão na inicialização
  useEffect(() => {
    const initAdmin = async () => {
      try {
        const result = await createDefaultAdmin()
        console.log('Resultado da criação do admin:', result)
        setAdminCreated(true)
      } catch (error) {
        console.error('Erro ao criar admin:', error)
      }
    }
    
    initAdmin()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    console.log('Iniciando login...')
    
    const { error } = await signIn(loginData.email, loginData.password)
    
    if (error) {
      console.error('Erro no login:', error)
      toast({
        title: "Erro no login",
        description: error.message === 'Invalid login credentials' 
          ? "Email ou senha incorretos" 
          : error.message,
        variant: "destructive"
      })
    } else {
      console.log('Login bem-sucedido')
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      })
      // O redirecionamento será feito pelo useEffect que monitora o user
    }
    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signupData.nome || !signupData.email || !signupData.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      })
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    const { error } = await signUp(signupData.email, signupData.password, signupData.nome)
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso! Verifique seu email para confirmar."
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-ice-blue p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Ice Rink Manager
          </CardTitle>
          <p className="text-muted-foreground">
            Sistema de Gerenciamento de Pista de Gelo
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="Sua senha"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  Entrar
                </Button>
                
                <div className="text-sm text-center text-muted-foreground">
                  {adminCreated && (
                    <>
                      <p>Usuário Administrador padrão:</p>
                      <p><strong>Email:</strong> admin@icerink.com</p>
                      <p><strong>Senha:</strong> 101010</p>
                    </>
                  )}
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nome">Nome Completo</Label>
                  <Input
                    id="signup-nome"
                    type="text"
                    value={signupData.nome}
                    onChange={(e) => setSignupData({...signupData, nome: e.target.value})}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    placeholder="Sua senha"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

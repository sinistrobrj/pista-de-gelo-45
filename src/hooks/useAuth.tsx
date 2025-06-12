
import { useState, useEffect, createContext, useContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, nome: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Carregando perfil para usuário:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Erro ao carregar perfil:', error)
        return
      }

      console.log('Perfil carregado:', data)
      setProfile(data)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  useEffect(() => {
    let mounted = true
    let profileLoaded = false

    const initializeAuth = async () => {
      if (!mounted) return
      
      try {
        console.log('Inicializando autenticação...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Sessão inicial obtida:', session?.user?.email, 'Error:', error)
        
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user && !profileLoaded) {
          profileLoaded = true
          await loadUserProfile(session.user.id)
        }
        
        setInitialized(true)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user && event === 'SIGNED_IN' && !profileLoaded) {
          profileLoaded = true
          setTimeout(() => {
            if (mounted) {
              loadUserProfile(session.user.id)
            }
          }, 100)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          profileLoaded = false
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('Resultado do login:', { data: data?.user?.email, error })
      return { error }
    } catch (error) {
      console.error('Erro no signIn:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome
          }
        }
      })
      
      console.log('Resultado do signup:', { data: data?.user?.email, error })
      return { error }
    } catch (error) {
      console.error('Erro no signUp:', error)
      return { error }
    }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setProfile(null)
    setLoading(false)
  }

  const value = {
    user,
    session,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


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

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao carregar perfil:', error)
        return
      }

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

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        }
        
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
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user && event === 'SIGNED_IN') {
          await loadUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
        
        setLoading(false)
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      return { error }
    } catch (error) {
      console.error('Erro no signIn:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome
          }
        }
      })
      
      return { error }
    } catch (error) {
      console.error('Erro no signUp:', error)
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
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

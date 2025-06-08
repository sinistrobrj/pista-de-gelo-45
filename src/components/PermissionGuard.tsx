
import { useAuth } from "@/hooks/useAuth"
import { ReactNode } from "react"

interface PermissionGuardProps {
  children: ReactNode
  requiredPermission?: string
  requireAdmin?: boolean
  fallback?: ReactNode
}

export function PermissionGuard({ 
  children, 
  requiredPermission, 
  requireAdmin = false,
  fallback = null 
}: PermissionGuardProps) {
  const { profile } = useAuth()

  if (!profile) {
    return <>{fallback}</>
  }

  // Se requer admin e não é admin
  if (requireAdmin && profile.tipo !== 'Administrador') {
    return <>{fallback}</>
  }

  // Se é admin, tem acesso a tudo
  if (profile.tipo === 'Administrador') {
    return <>{children}</>
  }

  // Se requer permissão específica e não tem
  if (requiredPermission && !profile.permissoes?.includes(requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

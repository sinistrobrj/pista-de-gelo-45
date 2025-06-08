
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

  console.log('PermissionGuard - Profile:', profile)
  console.log('PermissionGuard - RequiredPermission:', requiredPermission)
  console.log('PermissionGuard - RequireAdmin:', requireAdmin)

  if (!profile) {
    console.log('PermissionGuard - No profile, showing fallback')
    return <>{fallback}</>
  }

  // Se é admin, tem acesso a tudo (SEMPRE)
  if (profile.tipo === 'Administrador') {
    console.log('PermissionGuard - User is admin, granting access')
    return <>{children}</>
  }

  // Se requer admin e não é admin
  if (requireAdmin && profile.tipo !== 'Administrador') {
    console.log('PermissionGuard - Requires admin but user is not admin')
    return <>{fallback}</>
  }

  // Se requer permissão específica e não tem
  if (requiredPermission && !profile.permissoes?.includes(requiredPermission)) {
    console.log('PermissionGuard - User does not have required permission:', requiredPermission)
    return <>{fallback}</>
  }

  console.log('PermissionGuard - Access granted')
  return <>{children}</>
}

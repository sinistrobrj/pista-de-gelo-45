
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Tickets, Users, ChartBar, Settings, Calendar, User, ShoppingCart, Package, Heart, UserPlus, Activity } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { PermissionGuard } from "./PermissionGuard"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: ChartBar,
    permission: null
  },
  {
    title: "Ponto de Venda",
    url: "/ponto-venda",
    icon: ShoppingCart,
    permission: "vendas"
  },
  {
    title: "Estoque",
    url: "/estoque",
    icon: Package,
    permission: "estoque"
  },
  {
    title: "Gestão de Ingressos",
    url: "/tickets",
    icon: Tickets,
    permission: "vendas"
  },
  {
    title: "Eventos",
    url: "/eventos",
    icon: Calendar,
    permission: "eventos"
  },
  {
    title: "Pista",
    url: "/pista",
    icon: Activity,
    permission: "pista"
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
    permission: "clientes"
  },
  {
    title: "Fidelidade",
    url: "/fidelidade",
    icon: Heart,
    permission: "clientes"
  },
  {
    title: "Cadastro",
    url: "/cadastro",
    icon: UserPlus,
    permission: "clientes"
  },
  {
    title: "Relatórios",
    url: "/analytics",
    icon: ChartBar,
    permission: "relatorios"
  },
]

const adminItems = [
  {
    title: "Painel Admin",
    url: "/admin",
    icon: Settings,
    requireAdmin: true
  },
  {
    title: "Usuários",
    url: "/users",
    icon: User,
    requireAdmin: true
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { profile } = useAuth()

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Tickets className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Ice Rink</h2>
            <p className="text-xs text-muted-foreground">Manager</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <PermissionGuard
                  key={item.title}
                  requiredPermission={item.permission || undefined}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="w-full justify-start"
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </PermissionGuard>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <PermissionGuard requireAdmin>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="w-full justify-start"
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </PermissionGuard>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="text-xs text-muted-foreground text-center">
          Ice Rink Manager v1.0
          {profile && (
            <p className="mt-1 font-medium text-foreground">
              {profile.nome} ({profile.tipo})
            </p>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

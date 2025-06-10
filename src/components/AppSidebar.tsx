import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Users, ChartBar, Settings, Calendar, User, ShoppingCart, Package, Heart, UserPlus, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const menuItems = [{
  title: "Dashboard",
  url: "/",
  icon: ChartBar
}, {
  title: "Ponto de Venda",
  url: "/ponto-venda",
  icon: ShoppingCart
}, {
  title: "Estoque",
  url: "/estoque",
  icon: Package
}, {
  title: "Eventos",
  url: "/eventos",
  icon: Calendar
}, {
  title: "Pista",
  url: "/pista",
  icon: Activity
}, {
  title: "Clientes",
  url: "/clientes",
  icon: Users
}, {
  title: "Fidelidade",
  url: "/fidelidade",
  icon: Heart
}, {
  title: "Cadastro",
  url: "/cadastro",
  icon: UserPlus
}, {
  title: "Relatórios",
  url: "/analytics",
  icon: ChartBar
}];
const adminItems = [{
  title: "Painel Admin",
  url: "/admin",
  icon: Settings
}, {
  title: "Usuários",
  url: "/users",
  icon: User
}];
export function AppSidebar() {
  const location = useLocation();
  return <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Pista de Gelo</h2>
            <p className="text-xs text-muted-foreground">Gerenciador</p>
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
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} className="w-full justify-start">
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} className="w-full justify-start">
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="text-xs text-muted-foreground text-center">
          Ice Rink Manager v1.0
        </div>
      </SidebarFooter>
    </Sidebar>;
}
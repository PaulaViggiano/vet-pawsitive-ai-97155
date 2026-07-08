import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PawPrint,
  BookOpen,
  Settings,
  BarChart3,
  Stethoscope,
  Menu,
  LogOut,
  Users,
  MessageSquare,
  Calendar
} from "lucide-react";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Mascotas", url: "/pacientes", icon: PawPrint },
  { title: "Dueños", url: "/duenos", icon: Users },
  { title: "Historia Médica", url: "/historia-medica", icon: Stethoscope },
  { title: "Base de Conocimiento", url: "/conocimiento", icon: BookOpen },
  { title: "Contactos Bot", url: "/contactos-bot", icon: MessageSquare },
  { title: "Calendario", url: "/calendario", icon: Calendar },
  { title: "Reportes", url: "/reports", icon: BarChart3 },
  { title: "Configuración", url: "/configuracion", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const userDisplayName = user?.email?.split('@')[0] || 'Usuario';
  const userInitials = userDisplayName.slice(0, 2).toUpperCase();

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };
  
  const getNavClass = (isActiveRoute: boolean) =>
    isActiveRoute 
      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25" 
      : "text-muted-foreground hover:text-foreground hover:bg-accent/50";

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-gradient-to-b from-purple-50 to-purple-50">
      <SidebarHeader className="border-b border-purple-200/50 bg-white/50">
        {/* Toggle button */}
        <div className="flex items-center justify-between p-4">
          <SidebarTrigger className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-100">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <img src="/2.jpg" alt="VetMed" className="w-10 h-10 rounded-lg object-contain" />
              <div>
                <h2 className="text-lg font-bold text-cyan-700">
                  VetMed
                </h2>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-200">
              <Avatar className="h-10 w-10 ring-2 ring-purple-200">
                <AvatarImage src="" />
                <AvatarFallback className="bg-purple-600 text-white text-sm font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-800 truncate">
                  ¡Hola, {userDisplayName}!
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                    Veterinario
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-purple-50/50 to-purple-50/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-600 font-semibold text-xs uppercase tracking-wider px-3 py-2">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActiveRoute = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size="lg" className="h-11">
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                          isActiveRoute 
                            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25" 
                            : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/70"
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${isActiveRoute ? 'text-white' : 'text-purple-600'}`} />
                        <span className="font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="mt-auto p-4">
          <Button 
            onClick={logout}
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-cyan-700 hover:bg-cyan-50/70 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3 text-cyan-600" />
            Cerrar Sesión
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
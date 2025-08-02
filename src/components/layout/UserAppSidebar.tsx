import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  Home,
  Heart,
  MapPin,
  Clock,
  Settings,
  LogOut,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserAppSidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      title: "Inicio",
      url: "/user",
      icon: Home,
      description: "Descubre las mejores promociones"
    },
    {
      title: "Favoritos",
      url: "/user/favorites",
      icon: Heart,
      description: "Tus promociones guardadas",
      badge: "12"
    },
    {
      title: "Historial",
      url: "/user/history",
      icon: Clock,
      description: "Promociones canjeadas"
    },
    {
      title: "Cerca de mí",
      url: "/user/nearby",
      icon: MapPin,
      description: "Ofertas en tu zona"
    },
    {
      title: "Configuración",
      url: "/user/settings",
      icon: Settings,
      description: "Ajustes de tu cuenta"
    },
  ];

  return (
    <Sidebar className="bg-fuddi-purple">
      <SidebarHeader>
        <div className="p-4 sm:p-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-white text-4xl sm:text-5xl font-lobster">Fuddi</h1>
            <Badge variant="outline" className="text-white border-white/30 text-xs">
              Cliente
            </Badge>
          </div>
          {user && (
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-white/70 text-xs">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-4 sm:p-4 text-base sm:text-base h-auto">
                    <NavLink 
                      to={item.url}
                      end={item.url === "/user"}
                      className={({ isActive }) => 
                        `flex items-center gap-4 rounded-md text-white ${isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5'} px-3 py-4 sm:py-4 text-base sm:text-base`
                      }
                    >
                      <item.icon className="h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-3" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/70 mt-1">{item.description}</p>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 sm:p-4 border-t border-white/10">
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10 text-base sm:text-base py-4"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar sesión
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default UserAppSidebar; 
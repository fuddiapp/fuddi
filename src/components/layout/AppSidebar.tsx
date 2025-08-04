import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  LayoutDashboard, 
  Tag, 
  Settings,
  LogOut,
  Utensils,
  QrCode,
  Building2,
  Package,
  TrendingUp
} from 'lucide-react';

const AppSidebar = () => {
  const navigate = useNavigate();
  
  // Get business information from localStorage
  const userData = localStorage.getItem('fuddi-user');
  const businessInfo = userData ? JSON.parse(userData) : null;
  const businessName = businessInfo?.businessName || 'Fuddi Central';
  const businessLogo = businessInfo?.logo;
  
  const handleLogout = () => {
    localStorage.removeItem('fuddi-user');
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/settings');
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Promociones",
      url: "/promotions/manage", 
      icon: Tag,
    },
    {
      title: "Menú del Día",
      url: "/daily-menu",
      icon: Utensils,
    },
    {
      title: "Productos",
      url: "/products",
      icon: Package,
    },
    {
      title: "Código QR",
      url: "/qr-codes",
      icon: QrCode,
    },
    {
      title: "Rendimiento",
      url: "/analytics",
      icon: TrendingUp,
    },

    {
      title: "Configuración",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="bg-fuddi-purple">
      <SidebarHeader>
        <div className="p-4 sm:p-4">
          <h1 className="text-white text-4xl sm:text-5xl font-lobster">Fuddi</h1>
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
                      end={item.url === "/dashboard"}
                      className={({ isActive }) => 
                        `flex items-center gap-4 rounded-md text-white ${isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5'} px-3 py-4 sm:py-4 text-base sm:text-base`
                      }
                    >
                      <item.icon className="h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-3" />
                      <span>{item.title}</span>
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
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

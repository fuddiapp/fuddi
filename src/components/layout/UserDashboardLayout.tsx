import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import UserAppSidebar from '@/components/layout/UserAppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, MapPin, Bell } from 'lucide-react';

interface UserDashboardLayoutProps {
  children: ReactNode;
}

const UserDashboardLayout = ({ children }: UserDashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-purple-50">
        <UserAppSidebar />
        <SidebarInset>
          <header className="flex h-12 sm:h-14 md:h-16 shrink-0 items-center justify-between border-b bg-white px-2 sm:px-4">
            <SidebarTrigger className="-ml-1 h-10 w-10 sm:h-12 sm:w-12 md:h-10 md:w-10 p-0 bg-white border shadow-lg text-fuddi-purple rounded-full flex items-center justify-center" />
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-lobster text-fuddi-purple absolute left-1/2 transform -translate-x-1/2">Fuddi</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Santiago Centro</span>
              </div>
              
              {/* Notificaciones */}
              <Button variant="ghost" size="sm" className="relative h-8 w-8 sm:h-9 sm:w-9 p-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* Usuario */}
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UserDashboardLayout; 
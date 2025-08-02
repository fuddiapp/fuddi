import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut, 
  Menu,
  Bell
} from 'lucide-react';

const UserNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex items-center gap-3">
      {/* Notificaciones */}
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
          3
        </span>
      </Button>

      {/* Menú de usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">{user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate('/user/favorites')}>
            <Heart className="h-4 w-4 mr-2" />
            Favoritos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/user/history')}>
            <MapPin className="h-4 w-4 mr-2" />
            Historial
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/user/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserNavigation; 
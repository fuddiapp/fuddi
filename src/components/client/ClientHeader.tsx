import React from 'react';
import { MapPin, Bell, User, Settings, Heart, Locate, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LocationSelector } from './LocationSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { useToast } from '@/hooks/use-toast';

interface ClientHeaderProps {
  userName: string;
  userLocation?: string;
  notificationsCount?: number;
  favoritesCount?: number;
  onLocationChange?: () => void;
  onNotificationsClick?: () => void;
  onFavoritesClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({
  userName,
  userLocation: propUserLocation = 'Cerca de ti',
  notificationsCount = 0,
  favoritesCount = 0,
  onLocationChange,
  onNotificationsClick,
  onFavoritesClick,
  onProfileClick,
  onSettingsClick,
}) => {
  const { user } = useAuth();
  const { userLocation: currentLocation } = useUserLocation();
  const { toast } = useToast();

  // Usar la ubicación del contexto si está disponible, sino usar la prop
  const displayLocation = currentLocation?.address || propUserLocation;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        {/* Logo y ubicación */}
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-lobster text-fuddi-purple">
            Fuddi
          </h1>
          
          <div className="hidden sm:flex items-center gap-2">
            <LocationSelector />
          </div>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 p-0 text-gray-600 hover:text-fuddi-purple hover:bg-fuddi-purple/5"
            onClick={onNotificationsClick}
          >
            <Bell className="h-5 w-5" />
            {notificationsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notificationsCount > 9 ? '9+' : notificationsCount}
              </Badge>
            )}
          </Button>

          {/* Favoritos */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 p-0 text-gray-600 hover:text-fuddi-purple hover:bg-fuddi-purple/5"
            onClick={onFavoritesClick}
          >
            <Heart className="h-5 w-5" />
            {favoritesCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
              >
                {favoritesCount > 9 ? '9+' : favoritesCount}
              </Badge>
            )}
          </Button>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-600 hover:text-fuddi-purple hover:bg-fuddi-purple/5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-fuddi-purple/10 text-fuddi-purple text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onProfileClick}>
                <User className="h-4 w-4 mr-2" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFavoritesClick}>
                <Heart className="h-4 w-4 mr-2" />
                Mis Seguidos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Ubicación móvil */}
      <div className="sm:hidden mt-3 flex items-center gap-2">
        <LocationSelector />
      </div>
    </div>
  );
};

export default ClientHeader; 
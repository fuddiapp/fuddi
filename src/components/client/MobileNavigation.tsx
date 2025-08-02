import React from 'react';
import { Home, Search, Heart, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  favoritesCount?: number;
  notificationsCount?: number;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
  notificationsCount = 0
}) => {
  const tabs = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'favorites', label: 'Seguidos', icon: Heart },
    { id: 'businesses', label: 'Negocios', icon: Store },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 relative ${
                isActive 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                
                {/* Badges para notificaciones y favoritos */}
                {tab.id === 'favorites' && favoritesCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {favoritesCount > 9 ? '9+' : favoritesCount}
                  </Badge>
                )}
                
                {tab.id === 'profile' && notificationsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {notificationsCount > 9 ? '9+' : notificationsCount}
                  </Badge>
                )}
              </div>
              
              <span className={`text-xs font-medium ${
                isActive ? 'text-purple-600' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
              
              {/* Indicador activo */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation; 
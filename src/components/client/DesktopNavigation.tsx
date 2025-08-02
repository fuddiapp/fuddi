import React from 'react';
import { Home, Heart, Store, User } from 'lucide-react';

interface DesktopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'favorites', label: 'Seguidos', icon: Heart },
  { id: 'businesses', label: 'Negocios', icon: Store },
  { id: 'profile', label: 'Perfil', icon: User },
];

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="hidden lg:flex w-full bg-white/90 border-b border-fuddi-purple/10 px-8 py-2 items-center justify-center gap-8 fixed top-0 left-0 z-40 backdrop-blur-md">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium text-base transition-colors duration-150
              ${isActive ? 'bg-fuddi-purple/10 text-fuddi-purple' : 'text-gray-700 hover:bg-fuddi-purple/5 hover:text-fuddi-purple'}`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-fuddi-purple' : 'text-gray-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default DesktopNavigation; 
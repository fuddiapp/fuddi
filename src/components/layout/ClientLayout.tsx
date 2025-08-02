import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ClientHeader from '@/components/client/ClientHeader';
import DesktopNavigation from '@/components/client/DesktopNavigation';
import MobileNavigation from '@/components/client/MobileNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';
import { useUserLocation } from '@/contexts/UserLocationContext';

const tabPathMap = {
  home: '/client',
  businesses: '/client/businesses',
  favorites: '/client/followed',
  profile: '/client/profile',
};

const pathTabMap = {
  '/client': 'home',
  '/client/businesses': 'businesses',
  '/client/followed': 'favorites',
  '/client/profile': 'profile',
};

const ClientLayout: React.FC = () => {
  const { user } = useAuth();
  const { followedCount } = useFollowedBusinesses();
  const { userLocation } = useUserLocation();
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar tab activo según la ruta
  const activeTab = pathTabMap[location.pathname] || 'home';

  // Handlers de navegación
  const handleTabChange = (tab: string) => {
    const path = tabPathMap[tab] || '/client';
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  // Handlers para el header
  const handleLocationChange = () => {};
  const handleNotificationsClick = () => {};
  const handleFavoritesClick = () => handleTabChange('favorites');
  const handleProfileClick = () => handleTabChange('profile');
  const handleSettingsClick = () => navigate('/settings');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 lg:from-gray-50 lg:to-purple-50">
      <DesktopNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="hidden lg:block h-14 w-full" />
      <div className="px-4 py-3">
        <ClientHeader
          userName={user?.name || 'Usuario'}
          userLocation={userLocation?.address || user?.address || 'Cerca de ti'}
          notificationsCount={3}
          favoritesCount={followedCount}
          onLocationChange={handleLocationChange}
          onNotificationsClick={handleNotificationsClick}
          onFavoritesClick={handleFavoritesClick}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-20 lg:pb-8">
        <Outlet />
      </div>
      <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} favoritesCount={followedCount} notificationsCount={3} />
    </div>
  );
};

export default ClientLayout; 
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { useClientPromotions } from '@/contexts/ClientPromotionsContext';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';
import { MapPin, Star, Heart, Clock, Tag, Search, Filter, Bell } from 'lucide-react';

const ClientHomePage: React.FC = () => {
  console.log('🚀 ClientHomePage: Componente iniciando...');
  
  const { user, isLoading: authLoading } = useAuth();
  const { userLocation, isLoading: locationLoading } = useUserLocation();
  const { promotions } = useClientPromotions();
  const { followedBusinesses } = useFollowedBusinesses();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  console.log('🔍 ClientHomePage: Estado inicial:', {
    user: !!user,
    authLoading,
    userLocation: !!userLocation,
    locationLoading,
    promotionsCount: promotions?.length || 0,
    businessesCount: followedBusinesses ? followedBusinesses.size : 0
  });

  // Mostrar loading mientras se cargan los datos
  if (authLoading || locationLoading) {
    console.log('⏳ ClientHomePage: Mostrando loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cargando Fuddi</h2>
          <p className="text-gray-600">Preparando las mejores promociones para ti...</p>
        </div>
      </div>
    );
  }

  console.log('🎨 ClientHomePage: Renderizando componente...');

  const categories = [
    { id: 'all', name: 'Todas', icon: '🍽️' },
    { id: 'restaurants', name: 'Restaurantes', icon: '🍕' },
    { id: 'cafes', name: 'Cafés', icon: '☕' },
    { id: 'shopping', name: 'Compras', icon: '🛍️' },
    { id: 'entertainment', name: 'Entretenimiento', icon: '🎬' },
    { id: 'health', name: 'Salud', icon: '💊' },
  ];

  const filteredPromotions = promotions?.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || promotion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Fuddi
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar promociones, restaurantes, cafés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name || 'Usuario'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">
              ¡Hola, {user?.name || 'Usuario'}! 👋
            </h2>
            <p className="text-purple-100 text-lg mb-4">
              Descubre las mejores promociones cerca de ti
            </p>
            
            {/* Location Info */}
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg p-3 inline-flex">
              <MapPin className="w-5 h-5" />
              <span className="text-sm">
                {userLocation ? (
                  `Ubicación: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                ) : (
                  'Ubicación no disponible'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Categorías</h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Promociones Disponibles ({filteredPromotions.length})
          </h3>
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Promotions Grid/List */}
        {filteredPromotions.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Promotion Image */}
                <div className={`bg-gradient-to-br from-purple-100 to-blue-100 p-6 ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <div className="w-full h-32 bg-gradient-to-br from-purple-200 to-blue-200 rounded-xl flex items-center justify-center">
                    <Tag className="w-12 h-12 text-purple-600" />
                  </div>
                </div>

                {/* Promotion Content */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {promotion.title}
                    </h4>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {promotion.description}
                  </p>

                  {/* Business Info */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {promotion.business?.business_name?.charAt(0) || 'N'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {promotion.business?.business_name || 'Negocio'}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">4.5 (120 reseñas)</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-purple-600">
                        ${promotion.discountedPrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${promotion.originalPrice}
                      </span>
                    </div>
                    {promotion.distance && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{promotion.distance.toFixed(1)} km</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
                      Ver Detalles
                    </button>
                    <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tag className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay promociones disponibles
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Intenta ajustar tus filtros de búsqueda'
                : 'No hay promociones en tu área en este momento'
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}

        {/* Followed Businesses Section */}
        {followedBusinesses && followedBusinesses.size > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Negocios que Sigues ({followedBusinesses.size})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from(followedBusinesses).slice(0, 4).map((businessId) => (
                <div key={businessId} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-white font-semibold">
                      {businessId.charAt(0)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Negocio #{businessId.slice(-4)}</h4>
                  <p className="text-sm text-gray-600">Ver promociones</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Section (Hidden in production) */}
        <div className="mt-12 p-4 bg-gray-50 rounded-lg">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 font-medium">Debug Info</summary>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p>Usuario: {user?.type} ({user?.id})</p>
              <p>Ubicación: {userLocation ? 'Disponible' : 'No disponible'}</p>
              <p>Promociones: {promotions?.length || 0}</p>
              <p>Negocios seguidos: {followedBusinesses ? followedBusinesses.size : 0}</p>
              <p>Filtros: "{searchTerm}" - {selectedCategory}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ClientHomePage; 
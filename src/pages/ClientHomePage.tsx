import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { useClientPromotions } from '@/contexts/ClientPromotionsContext';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';

const ClientHomePage: React.FC = () => {
  console.log('🚀 ClientHomePage: Componente iniciando...');
  
  const { user, isLoading: authLoading } = useAuth();
  const { userLocation, isLoading: locationLoading } = useUserLocation();
  const { promotions } = useClientPromotions();
  const { followedBusinesses } = useFollowedBusinesses();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  console.log('🎨 ClientHomePage: Renderizando componente...');
  console.log('📊 ClientHomePage: Estado actual:', {
    user: user?.type,
    userLocation: userLocation?.latitude,
    promotionsCount: promotions?.length || 0,
    businessesCount: followedBusinesses ? followedBusinesses.size : 0
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a Fuddi!
          </h1>
          <p className="text-gray-600 mb-4">
            Descubre las mejores promociones cerca de ti
          </p>
          
          {/* Location Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Tu ubicación</h3>
            {userLocation ? (
              <p className="text-gray-600">
                Lat: {userLocation.latitude}, Lng: {userLocation.longitude}
              </p>
            ) : (
              <p className="text-gray-500">Ubicación no disponible</p>
            )}
          </div>
        </div>

        {/* Promociones */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Promociones Disponibles
          </h2>
          
          {promotions && promotions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">{promotion.title}</h3>
                  <p className="text-gray-600 mb-2">{promotion.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Precio original: ${promotion.originalPrice}</p>
                    <p>Precio con descuento: ${promotion.discountedPrice}</p>
                    <p>Negocio: {promotion.business.business_name}</p>
                    {promotion.distance && <p>Distancia: {promotion.distance.toFixed(2)} km</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No hay promociones disponibles en tu área
              </p>
            </div>
          )}
        </div>

        {/* Negocios Seguidos */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Negocios que Sigues
          </h2>
          
          {followedBusinesses && followedBusinesses.size > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from(followedBusinesses).map((businessId) => (
                <div key={businessId} className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Negocio #{businessId}</h3>
                  <p className="text-gray-600">Información del negocio</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No sigues ningún negocio aún
              </p>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              console.log('🖱️ ClientHomePage: Botón debug clickeado');
              console.log('📊 ClientHomePage: Estado actual:', {
                user: user?.type,
                userLocation: !!userLocation,
                promotionsCount: promotions?.length || 0,
                businessesCount: followedBusinesses ? followedBusinesses.size : 0
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientHomePage; 
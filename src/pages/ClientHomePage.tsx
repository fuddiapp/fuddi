import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { getAllPromotionsWithRealRedemptions } from '@/integrations/supabase/promotions';
import { Promotion } from '@/types/promotion';
import PromotionCard from '@/components/promotions/PromotionCard';
import LocationSelector from '@/components/location/LocationSelector';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ClientHomePage: React.FC = () => {
  console.log('🚀 ClientHomePage: Componente iniciando...');
  
  const { user } = useAuth();
  const { userLocation } = useUserLocation();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 ClientHomePage: Estado inicial:', {
    user: user?.id,
    userLocation: userLocation?.address,
    loading,
    promotionsCount: promotions.length
  });

  const loadPromotions = useCallback(async () => {
    console.log('📥 ClientHomePage: loadPromotions iniciando...');
    
    if (!userLocation) {
      console.log('⚠️ ClientHomePage: No hay ubicación del usuario, esperando...');
      return;
    }

    try {
      console.log('🔍 ClientHomePage: Iniciando consulta de promociones...');
      setLoading(true);
      setError(null);

      console.log('📍 ClientHomePage: Ubicación del usuario:', userLocation);
      
      const promotionsData = await getAllPromotionsWithRealRedemptions(userLocation);
      console.log('✅ ClientHomePage: Promociones obtenidas:', {
        count: promotionsData.length,
        promotions: promotionsData.slice(0, 3) // Solo mostrar las primeras 3 para el log
      });

      setPromotions(promotionsData);
      setLoading(false);
      console.log('🎉 ClientHomePage: loadPromotions completado exitosamente');
      
    } catch (err) {
      console.error('❌ ClientHomePage: Error en loadPromotions:', err);
      setError('Error al cargar las promociones');
      setLoading(false);
    }
  }, [userLocation]);

  // Efecto para cargar promociones cuando cambia la ubicación
  useEffect(() => {
    console.log('⏰ ClientHomePage: useEffect [userLocation] ejecutado');
    console.log('📍 ClientHomePage: userLocation actual:', userLocation);

    if (userLocation) {
      console.log('🚀 ClientHomePage: Iniciando carga de promociones...');
      loadPromotions();
    } else {
      console.log('⏳ ClientHomePage: Esperando ubicación del usuario...');
    }
  }, [userLocation, loadPromotions]);

  // Efecto para verificar el estado del usuario
  useEffect(() => {
    console.log('👤 ClientHomePage: useEffect [user] ejecutado');
    console.log('👤 ClientHomePage: Usuario actual:', {
      id: user?.id,
      email: user?.email,
      type: user?.user_metadata?.type
    });
  }, [user]);

  console.log('🎨 ClientHomePage: Renderizando componente...');
  console.log('📊 ClientHomePage: Estado actual:', {
    loading,
    error,
    promotionsCount: promotions.length,
    hasUserLocation: !!userLocation
  });

  if (!user) {
    console.log('🚫 ClientHomePage: No hay usuario, mostrando mensaje de carga...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header con selector de ubicación */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Promociones cerca de ti
          </h1>
          <LocationSelector />
        </div>
        
        {/* Estado de carga */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Cargando promociones...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadPromotions}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Lista de promociones */}
        {!loading && !error && promotions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        )}
        
        {/* Sin promociones */}
        {!loading && !error && promotions.length === 0 && userLocation && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-600">
                No hay promociones disponibles en tu área.
              </p>
            </div>
          </div>
        )}
        
        {/* Sin ubicación */}
        {!loading && !error && !userLocation && (
          <div className="text-center py-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-600">
                Selecciona tu ubicación para ver promociones cerca de ti.
              </p>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientHomePage; 
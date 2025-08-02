import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { getAllPromotionsWithRealRedemptions, getBusinessPromotions } from '@/integrations/supabase/promotions';
import type { Database } from '@/integrations/supabase/types';
import { useUserLocation } from './UserLocationContext';

type SupabasePromotion = Database['public']['Tables']['promotions']['Row'] & {
  businesses: {
    id: string;
    business_name: string;
    location_lat: number;
    location_lng: number;
    category: string;
    address: string;
  };
};

export interface ClientPromotion {
  id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  startDate: string;
  endDate: string | null;
  category: string;
  categories: string[];
  views: number;
  redemptions: number;
  isIndefinite: boolean;
  createdAt: string;
  business: {
    id: string;
    business_name: string;
    location_lat: number;
    location_lng: number;
    category: string;
    address: string;
  };
  distance?: number; // Distancia desde la ubicación del usuario
}

interface ClientPromotionsContextType {
  promotions: ClientPromotion[];
  loading: boolean;
  error: string | null;
  refreshPromotionsByLocation: (lat: number, lng: number, radius?: number) => Promise<void>;
  refreshBusinessPromotions: (businessId: string) => Promise<void>;
  getActivePromotions: ClientPromotion[];
}

const ClientPromotionsContext = createContext<ClientPromotionsContextType | undefined>(undefined);

export function ClientPromotionsProvider({ children }: { children: ReactNode }) {
  const { userLocation } = useUserLocation();
  const [promotions, setPromotions] = useState<ClientPromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPromotionsByLocation = useCallback(async (lat: number, lng: number, radius: number = 5) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAllPromotionsWithRealRedemptions(lat, lng, radius);
      
      // Convertir el formato de Supabase al formato de la aplicación
      const convertedPromotions: ClientPromotion[] = data.map((promo: any) => ({
        id: promo.id,
        title: promo.title || '',
        description: promo.description || '',
        image: promo.image_url || '',
        originalPrice: Number(promo.original_price) || 0,
        discountedPrice: Number(promo.discounted_price) || 0,
        startDate: promo.start_date || new Date().toISOString().split('T')[0],
        endDate: promo.end_date,
        category: promo.category || '',
        categories: promo.categories || [],
        views: Number(promo.views) || 0,
        redemptions: Number(promo.redemptions) || 0,
        isIndefinite: Boolean(promo.is_indefinite),
        createdAt: promo.created_at || new Date().toISOString(),
        business: {
          id: promo.businesses?.id || '',
          business_name: promo.businesses?.business_name || '',
          location_lat: Number(promo.businesses?.location_lat) || 0,
          location_lng: Number(promo.businesses?.location_lng) || 0,
          category: promo.businesses?.category || '',
          address: promo.businesses?.address || '',
        },
        distance: promo.businesses ? calculateDistance(lat, lng, promo.businesses.location_lat, promo.businesses.location_lng) : 0,
      }));
      
      setPromotions(convertedPromotions);
    } catch (error) {
      console.error('Error refreshing promotions by location:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar promociones');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBusinessPromotions = useCallback(async (businessId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getBusinessPromotions(businessId);
      
      // Convertir el formato de Supabase al formato de la aplicación
      const convertedPromotions: ClientPromotion[] = data.map((promo: any) => ({
        id: promo.id,
        title: promo.title || '',
        description: promo.description || '',
        image: promo.image_url || '',
        originalPrice: Number(promo.original_price) || 0,
        discountedPrice: Number(promo.discounted_price) || 0,
        startDate: promo.start_date || new Date().toISOString().split('T')[0],
        endDate: promo.end_date,
        category: promo.category || '',
        categories: promo.categories || [],
        views: Number(promo.views) || 0,
        redemptions: Number(promo.redemptions) || 0,
        isIndefinite: Boolean(promo.is_indefinite),
        createdAt: promo.created_at || new Date().toISOString(),
        business: {
          id: promo.businesses?.id || '',
          business_name: promo.businesses?.business_name || '',
          location_lat: Number(promo.businesses?.location_lat) || 0,
          location_lng: Number(promo.businesses?.location_lng) || 0,
          category: promo.businesses?.category || '',
          address: promo.businesses?.address || '',
        },
      }));
      
      setPromotions(convertedPromotions);
    } catch (error) {
      console.error('Error refreshing business promotions:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar promociones del negocio');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getActivePromotions = useCallback((): ClientPromotion[] => {
    const now = new Date();
    return promotions.filter(promotion => {
      const startDate = new Date(promotion.startDate);
      const isStarted = startDate <= now;
      
      if (promotion.isIndefinite) {
        return isStarted;
      }
      
      if (!promotion.endDate) {
        return isStarted;
      }
      
      const endDate = new Date(promotion.endDate);
      const isEnded = endDate < now;
      
      return (isStarted && !isEnded) || startDate > now;
    });
  }, [promotions]);

  // Función auxiliar para calcular distancia
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distancia en kilómetros
  };

  // Escuchar cambios de ubicación y actualizar promociones automáticamente
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      refreshPromotionsByLocation(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Escuchar eventos personalizados de cambio de ubicación
  useEffect(() => {
    const handleLocationChange = (event: CustomEvent) => {
      const newLocation = event.detail;
      if (newLocation?.latitude && newLocation?.longitude) {
        refreshPromotionsByLocation(newLocation.latitude, newLocation.longitude);
      }
    };

    window.addEventListener('userLocationChanged', handleLocationChange as EventListener);
    
    return () => {
      window.removeEventListener('userLocationChanged', handleLocationChange as EventListener);
    };
  }, []);

  return (
    <ClientPromotionsContext.Provider value={{
      promotions,
      loading,
      error,
      refreshPromotionsByLocation,
      refreshBusinessPromotions,
      getActivePromotions: getActivePromotions(),
    }}>
      {children}
    </ClientPromotionsContext.Provider>
  );
}

export function useClientPromotions() {
  const context = useContext(ClientPromotionsContext);
  if (context === undefined) {
    throw new Error('useClientPromotions must be used within a ClientPromotionsProvider');
  }
  return context;
} 
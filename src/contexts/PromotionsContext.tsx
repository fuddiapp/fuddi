import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { getPromotions as getPromotionsFromDB, createPromotion as createPromotionInDB, updatePromotion as updatePromotionInDB, deletePromotion as deletePromotionFromDB } from '@/integrations/supabase/promotions';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useStableEffect } from '@/hooks/use-stable-effect';

type SupabasePromotion = Database['public']['Tables']['promotions']['Row'];

export interface AppPromotion {
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
}

interface PromotionsContextType {
  promotions: AppPromotion[];
  addPromotion: (promotion: Omit<AppPromotion, 'id' | 'views' | 'redemptions' | 'createdAt'>) => Promise<void>;
  updatePromotion: (id: string, promotion: Partial<AppPromotion>) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  getActivePromotions: AppPromotion[];
  getAllPromotions: AppPromotion[];
  loading: boolean;
  refreshPromotions: () => Promise<void>;
  databaseError: boolean;
  setDatabaseError: (error: boolean) => void;
}

const PromotionsContext = createContext<PromotionsContextType | undefined>(undefined);

function PromotionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<AppPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState(false);

  const refreshPromotions = useCallback(async () => {
    if (!user?.id) {
      return; // No cargar si no hay usuario
    }
    try {
      setLoading(true);
      setDatabaseError(false); // Reset error state
      
      // Obtener business_id del usuario autenticado
      const businessId = user.id;
      const data = await getPromotionsFromDB(businessId);
      
      // Convertir el formato de Supabase al formato de la aplicación
      const convertedPromotions: AppPromotion[] = data.map(promo => ({
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
      }));
      
      setPromotions(convertedPromotions);
    } catch (error) {
      console.error('Error refreshing promotions:', error);
      
      // Manejar diferentes tipos de errores
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('relation "promotions" does not exist') || 
            errorMessage.includes('table "promotions" does not exist')) {
          console.error('Error de configuración de base de datos');
          setDatabaseError(true);
        } else if (errorMessage.includes('permission denied') || 
                   errorMessage.includes('access denied')) {
          console.error('Error de permisos en Supabase');
          // No mostrar alert para errores de permisos, solo log
        } else if (errorMessage.includes('connection') || 
                   errorMessage.includes('network')) {
          console.error('Error de conexión con Supabase');
          // No mostrar alert para errores de conexión, solo log
        } else {
          console.error('Error desconocido:', errorMessage);
          // No mostrar alert para errores desconocidos, solo log
        }
      } else {
        console.error('Error no reconocido:', error);
        // No mostrar alert para errores no reconocidos, solo log
      }
      
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cargar promociones cuando cambie el usuario
  useEffect(() => {
    if (user?.id) {
      refreshPromotions();
    } else {
      // Limpiar promociones si no hay usuario
      setPromotions([]);
      setLoading(false);
    }
  }, [user?.id, refreshPromotions]); // Incluir refreshPromotions para que se actualice cuando cambie el usuario

  const addPromotion = useCallback(async (promotionData: Omit<AppPromotion, 'id' | 'views' | 'redemptions' | 'createdAt'>) => {
    try {
      const businessId = user?.id;
      if (!businessId) throw new Error('No hay usuario autenticado');
      
      // Convertir el formato de la aplicación al formato de Supabase
      const supabaseData = {
        business_id: businessId,
        title: promotionData.title,
        description: promotionData.description,
        image_url: promotionData.image,
        original_price: promotionData.originalPrice,
        discounted_price: promotionData.discountedPrice,
        start_date: promotionData.startDate,
        end_date: promotionData.endDate,
        category: promotionData.category,
        categories: promotionData.categories,
        is_indefinite: promotionData.isIndefinite,
      };
      
      const newPromotion = await createPromotionInDB(supabaseData);
      
      if (newPromotion) {
        // Convertir de vuelta al formato de la aplicación
        const convertedPromotion: AppPromotion = {
          id: newPromotion.id,
          title: newPromotion.title || '',
          description: newPromotion.description || '',
          image: newPromotion.image_url || '',
          originalPrice: Number(newPromotion.original_price) || 0,
          discountedPrice: Number(newPromotion.discounted_price) || 0,
          startDate: newPromotion.start_date || new Date().toISOString().split('T')[0],
          endDate: newPromotion.end_date,
          category: newPromotion.category || '',
          categories: newPromotion.categories || [],
          views: Number(newPromotion.views) || 0,
          redemptions: Number(newPromotion.redemptions) || 0,
          isIndefinite: Boolean(newPromotion.is_indefinite),
          createdAt: newPromotion.created_at || new Date().toISOString(),
        };
        
        setPromotions(prev => [convertedPromotion, ...prev]);
        
        // Refrescar las promociones para asegurar que se actualice correctamente
        await refreshPromotions();
      } else {
        throw new Error('Failed to create promotion in database');
      }
    } catch (error) {
      console.error('Error adding promotion:', error);
      throw error;
    }
  }, [refreshPromotions, user]);

  const updatePromotion = useCallback(async (id: string, updates: Partial<AppPromotion>) => {
    try {
      const businessId = user?.id;
      if (!businessId) throw new Error('No hay usuario autenticado');
      
      // Convertir el formato de la aplicación al formato de Supabase
      const supabaseUpdates: any = {};
      if (updates.title) supabaseUpdates.title = updates.title;
      if (updates.description) supabaseUpdates.description = updates.description;
      if (updates.image) supabaseUpdates.image_url = updates.image;
      if (updates.originalPrice) supabaseUpdates.original_price = updates.originalPrice;
      if (updates.discountedPrice) supabaseUpdates.discounted_price = updates.discountedPrice;
      if (updates.startDate) supabaseUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) supabaseUpdates.end_date = updates.endDate;
      if (updates.category) supabaseUpdates.category = updates.category;
      if (updates.categories) supabaseUpdates.categories = updates.categories;
      if (updates.isIndefinite !== undefined) supabaseUpdates.is_indefinite = updates.isIndefinite;
      if (updates.views !== undefined) supabaseUpdates.views = updates.views;
      if (updates.redemptions !== undefined) supabaseUpdates.redemptions = updates.redemptions;

      const updatedPromotion = await updatePromotionInDB(id, supabaseUpdates, businessId);
      
      if (updatedPromotion) {
        // Convertir de vuelta al formato de la aplicación
        const convertedPromotion: AppPromotion = {
          id: updatedPromotion.id,
          title: updatedPromotion.title || '',
          description: updatedPromotion.description || '',
          image: updatedPromotion.image_url || '',
          originalPrice: Number(updatedPromotion.original_price) || 0,
          discountedPrice: Number(updatedPromotion.discounted_price) || 0,
          startDate: updatedPromotion.start_date || new Date().toISOString().split('T')[0],
          endDate: updatedPromotion.end_date,
          category: updatedPromotion.category || '',
          categories: updatedPromotion.categories || [],
          views: Number(updatedPromotion.views) || 0,
          redemptions: Number(updatedPromotion.redemptions) || 0,
          isIndefinite: Boolean(updatedPromotion.is_indefinite),
          createdAt: updatedPromotion.created_at || new Date().toISOString(),
        };
        
        setPromotions(prev => prev.map(promotion => 
          promotion.id === id ? convertedPromotion : promotion
        ));
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }, [user]);

  const deletePromotion = useCallback(async (id: string) => {
    try {
      const businessId = user?.id;
      if (!businessId) throw new Error('No hay usuario autenticado');
      
      await deletePromotionFromDB(id, businessId);
      setPromotions(prev => prev.filter(promotion => promotion.id !== id));
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }, [user]);

  const getActivePromotions = useMemo((): AppPromotion[] => {
    const now = new Date();
    const active = promotions.filter(promotion => {
      const startDate = new Date(promotion.startDate);
      const isStarted = startDate <= now;
      
      // Para promociones indefinidas, solo verificar que hayan comenzado
      if (promotion.isIndefinite) {
        return isStarted;
      }
      
      // Para promociones sin fecha de fin, verificar que hayan comenzado
      if (!promotion.endDate) {
        return isStarted;
      }
      
      const endDate = new Date(promotion.endDate);
      const isEnded = endDate < now;
      
      // Mostrar promociones que:
      // 1. Han comenzado y no han terminado, O
      // 2. Comenzarán en el futuro (para mostrar promociones recién creadas)
      return (isStarted && !isEnded) || startDate > now;
    });
    
    return active;
  }, [promotions]);

  const getAllPromotions = useMemo((): AppPromotion[] => {
    return promotions;
  }, [promotions]);

  return (
    <PromotionsContext.Provider value={{
      promotions,
      addPromotion,
      updatePromotion,
      deletePromotion,
      getActivePromotions,
      getAllPromotions,
      loading,
      refreshPromotions,
      databaseError,
      setDatabaseError
    }}>
      {children}
    </PromotionsContext.Provider>
  );
}

function usePromotions() {
  const context = useContext(PromotionsContext);
  
  if (context === undefined) {
    console.error('usePromotions - Error: Contexto no definido');
    throw new Error('usePromotions must be used within a PromotionsProvider');
  }
  
  console.log('usePromotions - Retornando contexto:', context);
  return context;
}

export { PromotionsProvider, usePromotions }; 
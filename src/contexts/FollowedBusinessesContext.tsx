import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getFollowedBusinesses, 
  followBusiness, 
  unfollowBusiness, 
  isFollowingBusiness 
} from '@/integrations/supabase/followed-businesses';

interface FollowedBusinessesContextType {
  followedBusinesses: Set<string>;
  followBusiness: (businessId: string) => Promise<boolean>;
  unfollowBusiness: (businessId: string) => Promise<boolean>;
  isFollowing: (businessId: string) => boolean;
  followedCount: number;
  loading: boolean;
  refreshFollowedBusinesses: () => Promise<void>;
}

const FollowedBusinessesContext = createContext<FollowedBusinessesContextType | undefined>(undefined);

interface FollowedBusinessesProviderProps {
  children: ReactNode;
}

export const FollowedBusinessesProvider: React.FC<FollowedBusinessesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [followedBusinesses, setFollowedBusinesses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Cargar negocios seguidos desde Supabase cuando el usuario cambie
  const loadFollowedBusinesses = async () => {
    if (!user?.id) {
      setFollowedBusinesses(new Set());
      return;
    }

    try {
      setLoading(true);
      
      // Primero intentar cargar desde Supabase
      const followedIds = await getFollowedBusinesses(user.id);
      
      // Si no hay datos en Supabase, intentar migrar desde localStorage
      if (followedIds.length === 0) {
        const localStorageData = localStorage.getItem('fuddi-followed-businesses');
        if (localStorageData) {
      try {
            const localStorageArray = JSON.parse(localStorageData);
            if (Array.isArray(localStorageArray) && localStorageArray.length > 0) {
              console.log('🔄 Migrando datos de localStorage a Supabase...');
              
              // Migrar cada negocio a Supabase
              for (const businessId of localStorageArray) {
                await followBusiness(user.id, businessId);
              }
              
              // Limpiar localStorage después de la migración
              localStorage.removeItem('fuddi-followed-businesses');
              console.log('✅ Migración completada, localStorage limpiado');
              
              // Recargar datos desde Supabase
              const migratedIds = await getFollowedBusinesses(user.id);
              setFollowedBusinesses(new Set(migratedIds));
              return;
            }
      } catch (error) {
            console.error('Error migrando datos de localStorage:', error);
        localStorage.removeItem('fuddi-followed-businesses');
          }
        }
      }
      
      setFollowedBusinesses(new Set(followedIds));
    } catch (error) {
      console.error('Error cargando negocios seguidos:', error);
      setFollowedBusinesses(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando el usuario cambie
  useEffect(() => {
    loadFollowedBusinesses();
  }, [user?.id]);

  const followBusinessHandler = async (businessId: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('Usuario no autenticado');
      return false;
    }

    try {
      const success = await followBusiness(user.id, businessId);
      if (success) {
    setFollowedBusinesses(prev => new Set([...prev, businessId]));
      }
      return success;
    } catch (error) {
      console.error('Error siguiendo negocio:', error);
      return false;
    }
  };

  const unfollowBusinessHandler = async (businessId: string): Promise<boolean> => {
    if (!user?.id) {
      console.error('Usuario no autenticado');
      return false;
    }

    try {
      const success = await unfollowBusiness(user.id, businessId);
      if (success) {
    setFollowedBusinesses(prev => {
      const newSet = new Set(prev);
      newSet.delete(businessId);
      return newSet;
    });
      }
      return success;
    } catch (error) {
      console.error('Error dejando de seguir negocio:', error);
      return false;
    }
  };

  const isFollowingHandler = (businessId: string): boolean => {
    return followedBusinesses.has(businessId);
  };

  const refreshFollowedBusinesses = async (): Promise<void> => {
    await loadFollowedBusinesses();
  };

  const followedCount = followedBusinesses.size;

  const value: FollowedBusinessesContextType = {
    followedBusinesses,
    followBusiness: followBusinessHandler,
    unfollowBusiness: unfollowBusinessHandler,
    isFollowing: isFollowingHandler,
    followedCount,
    loading,
    refreshFollowedBusinesses,
  };

  return (
    <FollowedBusinessesContext.Provider value={value}>
      {children}
    </FollowedBusinessesContext.Provider>
  );
};

export const useFollowedBusinesses = (): FollowedBusinessesContextType => {
  const context = useContext(FollowedBusinessesContext);
  if (context === undefined) {
    throw new Error('useFollowedBusinesses must be used within a FollowedBusinessesProvider');
  }
  return context;
}; 
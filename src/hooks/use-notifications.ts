import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';
import { getFollowedBusinesses } from '@/integrations/supabase/followed-businesses';

export interface NotificationPromotion {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  currentPrice: number;
  discountPercentage: number;
  businessName: string;
  businessAddress: string;
  image: string;
  category: string;
  createdAt: string;
  isNew: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationPromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { followedBusinesses } = useFollowedBusinesses();

  // Función para cargar notificaciones
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener negocios seguidos desde Supabase
      const followedBusinessesArray = Array.from(followedBusinesses);
      
      if (followedBusinessesArray.length === 0) {
        setNotifications([]);
        return;
      }

      // Obtener promociones de los negocios seguidos
      const { data: promotions, error: promotionsError } = await supabase
        .from('promotions')
        .select(`
          *,
          businesses (
            id,
            business_name,
            address
          )
        `)
        .in('business_id', followedBusinessesArray)
        .order('created_at', { ascending: false })
        .limit(20); // Limitar a las 20 más recientes

      if (promotionsError) {
        console.error('Error al cargar notificaciones:', promotionsError);
        setError('Error al cargar las notificaciones');
        return;
      }

      // Convertir a formato de notificación
      const notificationPromotions: NotificationPromotion[] = (promotions || []).map(promo => {
        const discountPercentage = promo.original_price > 0 
          ? Math.round(((promo.original_price - promo.discounted_price) / promo.original_price) * 100)
          : 0;

        // Determinar si es nueva (creada en las últimas 24 horas)
        const createdAt = new Date(promo.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        const isNew = hoursDiff <= 24;

        return {
          id: promo.id,
          title: promo.title,
          description: promo.description,
          originalPrice: promo.original_price,
          currentPrice: promo.discounted_price,
          discountPercentage,
          businessName: promo.businesses.business_name,
          businessAddress: promo.businesses.address,
          image: promo.image_url || '/placeholder.svg',
          category: promo.category,
          createdAt: promo.created_at,
          isNew
        };
      });

      setNotifications(notificationPromotions);
    } catch (error) {
      console.error('Error inesperado al cargar notificaciones:', error);
      setError('Error inesperado al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, [followedBusinesses]);

  // Cargar notificaciones cuando cambien los negocios seguidos
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Función para marcar notificación como vista
  const markAsViewed = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isNew: false }
          : notification
      )
    );
  }, []);

  // Función para marcar todas como vistas
  const markAllAsViewed = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isNew: false }))
    );
  }, []);

  // Contar notificaciones nuevas
  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  return {
    notifications,
    loading,
    error,
    newNotificationsCount,
    loadNotifications,
    markAsViewed,
    markAllAsViewed
  };
} 
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PromotionsLimit {
  current: number;
  max: number;
  remaining: number;
  isAtLimit: boolean;
  isOverLimit: boolean;
}

export const usePromotionsLimit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [limit, setLimit] = useState<PromotionsLimit>({
    current: 0,
    max: 25,
    remaining: 25,
    isAtLimit: false,
    isOverLimit: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPromotionsLimit = useCallback(async () => {
    if (!user?.id || user.type !== 'business') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Obtener el límite máximo del negocio
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('max_promotions')
        .eq('id', user.id)
        .single();

      if (businessError) {
        console.error('Error obteniendo límite de promociones:', businessError);
        return;
      }

      const maxPromotions = businessData?.max_promotions || 25;

      // Contar promociones actuales del negocio
      const { count: currentPromotions, error: countError } = await supabase
        .from('promotions')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', user.id);

      if (countError) {
        console.error('Error contando promociones:', countError);
        return;
      }

      const current = currentPromotions || 0;
      const remaining = Math.max(0, maxPromotions - current);
      const isAtLimit = current >= maxPromotions;
      const isOverLimit = current > maxPromotions;

      setLimit({
        current,
        max: maxPromotions,
        remaining,
        isAtLimit,
        isOverLimit,
      });

    } catch (error) {
      console.error('Error en usePromotionsLimit:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.type]);

  const checkCanCreatePromotion = useCallback(async (): Promise<boolean> => {
    if (!user?.id || user.type !== 'business') {
      return false;
    }

    try {
      // Verificar límite antes de crear
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('max_promotions')
        .eq('id', user.id)
        .single();

      if (businessError) {
        console.error('Error verificando límite:', businessError);
        return false;
      }

      const maxPromotions = businessData?.max_promotions || 25;

      // Contar promociones actuales
      const { count: currentPromotions, error: countError } = await supabase
        .from('promotions')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', user.id);

      if (countError) {
        console.error('Error contando promociones:', countError);
        return false;
      }

      const current = currentPromotions || 0;
      return current < maxPromotions;

    } catch (error) {
      console.error('Error verificando si puede crear promoción:', error);
      return false;
    }
  }, [user?.id, user?.type]);

  const showLimitReachedError = useCallback(() => {
    toast({
      title: "Límite de promociones alcanzado",
      description: `Has alcanzado el límite máximo de ${limit.max} promociones. Elimina algunas promociones existentes para crear nuevas.`,
      variant: "destructive",
    });
  }, [limit.max, toast]);

  // Cargar límite al montar el componente
  useEffect(() => {
    fetchPromotionsLimit();
  }, [fetchPromotionsLimit]);

  return {
    limit,
    isLoading,
    fetchPromotionsLimit,
    checkCanCreatePromotion,
    showLimitReachedError,
  };
};


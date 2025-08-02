import { supabase } from './client';

export interface AnalyticsData {
  promotions: {
    totalRedemptions: number;
    totalRevenue: number;
    conversionRate: number;
    topPromotions: Array<{
      id: string;
      title: string;
      redemptions: number;
      revenue: number;
    }>;
    redemptionsByDate: Array<{
      date: string;
      redemptions: number;
      revenue: number;
    }>;
    redemptionsByCategory: Array<{
      category: string;
      redemptions: number;
      revenue: number;
    }>;
    redemptionsByDayOfWeek: Array<{
      day: string;
      redemptions: number;
    }>;
  };
  menus: {
    totalReservations: number;
    topMenus: Array<{
      id: string;
      title: string;
      reservations: number;
      date: string;
    }>;
    reservationsByDate: Array<{
      date: string;
      reservations: number;
    }>;
    reservationsByDayOfWeek: Array<{
      day: string;
      reservations: number;
    }>;
  };
  trends: {
    redemptions: {
      current: number;
      previous: number;
      change: number;
    };
    revenue: {
      current: number;
      previous: number;
      change: number;
    };
    reservations: {
      current: number;
      previous: number;
      change: number;
    };
  };
}

export const getAnalyticsData = async (businessId: string): Promise<AnalyticsData> => {
  try {
    console.log('🔍 Obteniendo datos de analytics para business:', businessId);

    // Obtener promociones del negocio
    const { data: businessPromotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('id, title, category')
      .eq('business_id', businessId);

    if (promotionsError) {
      console.error('Error obteniendo promociones:', promotionsError);
      throw promotionsError;
    }

    console.log('✅ Promociones encontradas:', businessPromotions?.length || 0);

    // Obtener todos los canjes y filtrar por promociones del negocio
    const { data: allRedemptions, error: redemptionsError } = await supabase
      .from('promotion_redemptions')
      .select('id, promotion_id, amount, created_at')
      .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

    if (redemptionsError) {
      console.error('Error obteniendo canjes:', redemptionsError);
      throw redemptionsError;
    }

    // Filtrar canjes que pertenecen a promociones del negocio
    const promotionIds = new Set(businessPromotions?.map(p => p.id) || []);
    const redemptionsData = allRedemptions?.filter(r => promotionIds.has(r.promotion_id)) || [];

    console.log('✅ Canjes encontrados:', redemptionsData.length);

    // Obtener menús del negocio
    const { data: businessMenus, error: menusError } = await supabase
      .from('menus_dia')
      .select('id, title, date')
      .eq('business_id', businessId);

    if (menusError) {
      console.error('Error obteniendo menús:', menusError);
      throw menusError;
    }

    console.log('✅ Menús encontrados:', businessMenus?.length || 0);

    // Obtener todas las reservas y filtrar por menús del negocio
    const { data: allReservations, error: reservationsError } = await supabase
      .from('menu_reservations')
      .select('id, menu_id, created_at')
      .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

    if (reservationsError) {
      console.error('Error obteniendo reservas:', reservationsError);
      throw reservationsError;
    }

    // Filtrar reservas que pertenecen a menús del negocio
    const menuIds = new Set(businessMenus?.map(m => m.id) || []);
    const reservationsData = allReservations?.filter(r => menuIds.has(r.menu_id)) || [];

    console.log('✅ Reservas encontradas:', reservationsData.length);

    // Obtener promociones activas para calcular tasa de conversión
    const { data: activePromotions, error: activePromotionsError } = await supabase
      .from('promotions')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (activePromotionsError) {
      console.error('Error obteniendo promociones activas:', activePromotionsError);
      throw activePromotionsError;
    }

    // Procesar datos de canjes
    const totalRedemptions = redemptionsData.length;
    const totalRevenue = redemptionsData.reduce((sum, r) => sum + (r.amount || 0), 0);
    const conversionRate = activePromotions?.length ? (totalRedemptions / activePromotions.length) * 100 : 0;

    // Crear mapa de promociones para facilitar el acceso
    const promotionsMap = new Map(businessPromotions?.map(p => [p.id, p]) || []);

    // Top promociones por canjes
    const promotionStats: Record<string, { id: string; title: string; redemptions: number; revenue: number }> = {};
    redemptionsData.forEach((redemption) => {
      const promoId = redemption.promotion_id;
      const promotion = promotionsMap.get(promoId);
      if (!promotion) return;

      if (!promotionStats[promoId]) {
        promotionStats[promoId] = {
          id: promoId,
          title: promotion.title,
          redemptions: 0,
          revenue: 0
        };
      }
      promotionStats[promoId].redemptions++;
      promotionStats[promoId].revenue += redemption.amount || 0;
    });

    const topPromotions = Object.values(promotionStats)
      .sort((a, b) => b.redemptions - a.redemptions)
      .slice(0, 5);

    // Canjes por fecha (últimos 30 días)
    const redemptionsByDate = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRedemptions = redemptionsData.filter(r => 
        r.created_at?.startsWith(dateStr)
      );
      return {
        date: dateStr,
        redemptions: dayRedemptions.length,
        revenue: dayRedemptions.reduce((sum, r) => sum + (r.amount || 0), 0)
      };
    }).reverse();

    // Canjes por categoría
    const categoryStats: Record<string, { redemptions: number; revenue: number }> = {};
    redemptionsData.forEach((redemption) => {
      const promotion = promotionsMap.get(redemption.promotion_id);
      const category = promotion?.category || 'Sin categoría';
      if (!categoryStats[category]) {
        categoryStats[category] = { redemptions: 0, revenue: 0 };
      }
      categoryStats[category].redemptions++;
      categoryStats[category].revenue += redemption.amount || 0;
    });

    const redemptionsByCategory = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      redemptions: stats.redemptions,
      revenue: stats.revenue
    }));

    // Canjes por día de la semana
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const redemptionsByDayOfWeek = dayNames.map((day, index) => {
      const dayRedemptions = redemptionsData.filter(r => {
        const date = new Date(r.created_at);
        return date.getDay() === index;
      });
      return {
        day,
        redemptions: dayRedemptions.length
      };
    });

    // Procesar datos de reservas
    const totalReservations = reservationsData.length;

    // Crear mapa de menús para facilitar el acceso
    const menusMap = new Map(businessMenus?.map(m => [m.id, m]) || []);

    // Top menús por reservas
    const menuStats: Record<string, { id: string; title: string; reservations: number; date: string }> = {};
    reservationsData.forEach((reservation) => {
      const menuId = reservation.menu_id;
      const menu = menusMap.get(menuId);
      if (!menu) return;

      if (!menuStats[menuId]) {
        menuStats[menuId] = {
          id: menuId,
          title: menu.title,
          reservations: 0,
          date: menu.date
        };
      }
      menuStats[menuId].reservations++;
    });

    const topMenus = Object.values(menuStats)
      .sort((a, b) => b.reservations - a.reservations)
      .slice(0, 5);

    // Reservas por fecha (últimos 30 días)
    const reservationsByDate = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayReservations = reservationsData.filter(r => 
        r.created_at?.startsWith(dateStr)
      );
      return {
        date: dateStr,
        reservations: dayReservations.length
      };
    }).reverse();

    // Reservas por día de la semana
    const reservationsByDayOfWeek = dayNames.map((day, index) => {
      const dayReservations = reservationsData.filter(r => {
        const date = new Date(r.created_at);
        return date.getDay() === index;
      });
      return {
        day,
        reservations: dayReservations.length
      };
    });

    // Calcular tendencias (comparar últimos 30 días con los 30 días anteriores)
    const currentPeriodRedemptions = redemptionsData.filter(r => {
      const date = new Date(r.created_at);
      return date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length;

    const previousPeriodRedemptions = redemptionsData.filter(r => {
      const date = new Date(r.created_at);
      return date >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) && 
             date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length;

    const currentPeriodRevenue = redemptionsData
      .filter(r => {
        const date = new Date(r.created_at);
        return date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const previousPeriodRevenue = redemptionsData
      .filter(r => {
        const date = new Date(r.created_at);
        return date >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) && 
               date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const currentPeriodReservations = reservationsData.filter(r => {
      const date = new Date(r.created_at);
      return date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length;

    const previousPeriodReservations = reservationsData.filter(r => {
      const date = new Date(r.created_at);
      return date >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) && 
             date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length;

    console.log('✅ Datos procesados correctamente');

    return {
      promotions: {
        totalRedemptions,
        totalRevenue,
        conversionRate,
        topPromotions,
        redemptionsByDate,
        redemptionsByCategory,
        redemptionsByDayOfWeek
      },
      menus: {
        totalReservations,
        topMenus,
        reservationsByDate,
        reservationsByDayOfWeek
      },
      trends: {
        redemptions: {
          current: currentPeriodRedemptions,
          previous: previousPeriodRedemptions,
          change: previousPeriodRedemptions ? ((currentPeriodRedemptions - previousPeriodRedemptions) / previousPeriodRedemptions) * 100 : 0
        },
        revenue: {
          current: currentPeriodRevenue,
          previous: previousPeriodRevenue,
          change: previousPeriodRevenue ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0
        },
        reservations: {
          current: currentPeriodReservations,
          previous: previousPeriodReservations,
          change: previousPeriodReservations ? ((currentPeriodReservations - previousPeriodReservations) / previousPeriodReservations) * 100 : 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}; 
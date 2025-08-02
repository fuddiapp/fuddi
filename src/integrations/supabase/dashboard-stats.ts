import { supabase } from './client';

export interface DashboardStats {
  totalPromotions: number;
  totalFollowers: number;
  totalRedemptions: number;
  totalRevenue: number;
  recentRedemptions: Array<{
    id: string;
    promotion_title: string;
    client_name: string;
    amount: number;
    date: string;
  }>;
  redemptionsByDate: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  topCategories: Array<{
    category: string;
    redemptions: number;
    revenue: number;
  }>;
  trends: {
    redemptions: { current: number; previous: number };
    revenue: { current: number; previous: number };
    followers: { current: number; previous: number };
  };
}

// Obtener estadísticas completas del dashboard para un negocio
export const getDashboardStats = async (businessId: string): Promise<DashboardStats> => {
  try {
    console.log('📊 Obteniendo estadísticas del dashboard para negocio:', businessId);

    // 1. Obtener total de promociones activas
    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('id, title, redemptions, discounted_price')
      .eq('business_id', businessId);

    if (promotionsError) {
      console.error('Error obteniendo promociones:', promotionsError);
      throw new Error('Error al obtener promociones');
    }

    const totalPromotions = promotions?.length || 0;

    // 2. Obtener total de seguidores usando la función RPC
    let totalFollowers = 0;
    
    try {
      const { data: followersResult, error: followersError } = await (supabase as any)
        .rpc('get_business_followers_count', { business_uuid: businessId });

      if (followersError) {
        console.error('Error obteniendo seguidores (RPC):', followersError);
        // Si hay error, intentar método alternativo
        console.log('Intentando método alternativo para contar seguidores...');
        
        const { data: followersData, error: altError } = await (supabase as any)
          .from('followed_businesses')
          .select('id')
          .eq('business_id', businessId);

        if (altError) {
          console.error('Error método alternativo:', altError);
          console.log('💡 Esto puede ser debido a políticas RLS. El usuario debe estar autenticado.');
          totalFollowers = 0;
        } else {
          totalFollowers = followersData?.length || 0;
          console.log('📊 Seguidores encontrados (método alternativo):', totalFollowers);
        }
      } else {
        totalFollowers = followersResult || 0;
        console.log('📊 Seguidores encontrados (función RPC):', totalFollowers);
      }
    } catch (error) {
      console.error('Error general obteniendo seguidores:', error);
      totalFollowers = 0;
    }

    // 3. Obtener canjes y ingresos
    const { data: redemptions, error: redemptionsError } = await (supabase as any)
      .from('promotion_redemptions')
      .select(`
        id,
        redemption_amount,
        redemption_date,
        created_at,
        promotions (
          id,
          title,
          category
        ),
        clients (
          id,
          first_name,
          last_name
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (redemptionsError) {
      console.error('Error obteniendo canjes:', redemptionsError);
      throw new Error('Error al obtener canjes');
    }

    const totalRedemptions = redemptions?.length || 0;
    const totalRevenue = redemptions?.reduce((sum, r) => sum + (r.redemption_amount || 0), 0) || 0;

    // 4. Obtener canjes recientes (últimos 10)
    const recentRedemptions = redemptions?.slice(0, 10).map(r => ({
      id: r.id,
      promotion_title: r.promotions?.title || 'Promoción',
      client_name: `${r.clients?.first_name || ''} ${r.clients?.last_name || ''}`.trim() || 'Cliente',
      amount: r.redemption_amount || 0,
      date: r.created_at
    })) || [];

    // 5. Obtener canjes por fecha (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const redemptionsByDate = redemptions
      ?.filter(r => new Date(r.created_at) >= thirtyDaysAgo)
      .reduce((acc, r) => {
        const date = new Date(r.created_at).toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        
        if (existing) {
          existing.count += 1;
          existing.revenue += r.redemption_amount || 0;
        } else {
          acc.push({
            date,
            count: 1,
            revenue: r.redemption_amount || 0
          });
        }
        
        return acc;
      }, [] as Array<{ date: string; count: number; revenue: number }>) || [];

    // Ordenar por fecha
    redemptionsByDate.sort((a, b) => a.date.localeCompare(b.date));

    // 6. Obtener categorías más populares
    const categoryStats = redemptions?.reduce((acc, r) => {
      const category = r.promotions?.category || 'Sin categoría';
      const existing = acc.find(item => item.category === category);
      
      if (existing) {
        existing.redemptions += 1;
        existing.revenue += r.redemption_amount || 0;
      } else {
        acc.push({
          category,
          redemptions: 1,
          revenue: r.redemption_amount || 0
        });
      }
      
      return acc;
    }, [] as Array<{ category: string; redemptions: number; revenue: number }>) || [];

    // Ordenar por redemptions y tomar top 5
    const topCategories = categoryStats
      .sort((a, b) => b.redemptions - a.redemptions)
      .slice(0, 5);

    // Calcular tendencias (comparar con período anterior)
    const currentPeriodRedemptions = redemptions?.filter(r => {
      const date = new Date(r.created_at);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= thirtyDaysAgo;
    }).length || 0;

    const previousPeriodRedemptions = redemptions?.filter(r => {
      const date = new Date(r.created_at);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length || 0;

    const currentPeriodRevenue = redemptions?.filter(r => {
      const date = new Date(r.created_at);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= thirtyDaysAgo;
    }).reduce((sum, r) => sum + (r.redemption_amount || 0), 0) || 0;

    const previousPeriodRevenue = redemptions?.filter(r => {
      const date = new Date(r.created_at);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).reduce((sum, r) => sum + (r.redemption_amount || 0), 0) || 0;

    const stats: DashboardStats = {
      totalPromotions,
      totalFollowers,
      totalRedemptions,
      totalRevenue,
      recentRedemptions,
      redemptionsByDate,
      topCategories,
      trends: {
        redemptions: { current: currentPeriodRedemptions, previous: previousPeriodRedemptions },
        revenue: { current: currentPeriodRevenue, previous: previousPeriodRevenue },
        followers: { current: totalFollowers, previous: 0 } // Por ahora no tenemos datos históricos de seguidores
      }
    };

    console.log('✅ Estadísticas obtenidas:', stats);
    return stats;

  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    throw error;
  }
};

// Obtener estadísticas de canjes por período
export const getRedemptionsByPeriod = async (
  businessId: string, 
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<Array<{ date: string; count: number; revenue: number }>> => {
  try {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: redemptions, error } = await (supabase as any)
      .from('promotion_redemptions')
      .select('redemption_amount, created_at')
      .eq('business_id', businessId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error obteniendo canjes por período:', error);
      throw new Error('Error al obtener canjes por período');
    }

    // Agrupar por fecha
    const grouped = redemptions?.reduce((acc, r) => {
      const date = new Date(r.created_at).toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.count += 1;
        existing.revenue += r.redemption_amount || 0;
      } else {
        acc.push({
          date,
          count: 1,
          revenue: r.redemption_amount || 0
        });
      }
      
      return acc;
    }, [] as Array<{ date: string; count: number; revenue: number }>) || [];

    return grouped.sort((a, b) => a.date.localeCompare(b.date));

  } catch (error) {
    console.error('Error en getRedemptionsByPeriod:', error);
    throw error;
  }
};

// Obtener estadísticas de seguidores por período
export const getFollowersByPeriod = async (
  businessId: string, 
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<Array<{ date: string; count: number }>> => {
  try {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: followers, error } = await (supabase as any)
      .from('followed_businesses')
      .select('created_at')
      .eq('business_id', businessId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error obteniendo seguidores por período:', error);
      throw new Error('Error al obtener seguidores por período');
    }

    // Agrupar por fecha
    const grouped = followers?.reduce((acc, f) => {
      const date = new Date(f.created_at).toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({
          date,
          count: 1
        });
      }
      
      return acc;
    }, [] as Array<{ date: string; count: number }>) || [];

    return grouped.sort((a, b) => a.date.localeCompare(b.date));

  } catch (error) {
    console.error('Error en getFollowersByPeriod:', error);
    throw error;
  }
}; 
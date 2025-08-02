import { supabase } from './client';

export interface ClientRedemption {
  id: string;
  promotion_id: string;
  business_id: string;
  redemption_method: 'code' | 'qr';
  code_used: string;
  redemption_amount: number;
  redemption_date: string;
  created_at: string;
  promotion: {
    id: string;
    title: string;
    name?: string;
  };
  business: {
    id: string;
    business_name: string;
  };
}

export interface ClientSavingsData {
  totalSavings: number;
  monthlySavings: number;
  redemptions: ClientRedemption[];
}

// Obtener datos de ahorro y canjes del cliente
export const getClientSavingsData = async (clientId: string): Promise<ClientSavingsData> => {
  try {
    console.log('🔍 Obteniendo datos de ahorro para cliente:', clientId);

    // Consulta simple para obtener canjes básicos usando any para evitar problemas de tipos
    const { data: redemptions, error } = await (supabase as any)
      .from('promotion_redemptions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo canjes:', error);
      // Retornar datos vacíos en lugar de lanzar error
      return {
        totalSavings: 0,
        monthlySavings: 0,
        redemptions: []
      };
    }

    console.log('📊 Canjes encontrados:', redemptions?.length || 0);

    if (!redemptions || redemptions.length === 0) {
      console.log('⚠️ No se encontraron canjes para este cliente');
      return {
        totalSavings: 0,
        monthlySavings: 0,
        redemptions: []
      };
    }

    // Construir el array de canjes con datos básicos
    const redemptionsData: ClientRedemption[] = redemptions.map((redemption: any) => ({
      id: redemption.id,
      promotion_id: redemption.promotion_id,
      business_id: redemption.business_id,
      redemption_method: redemption.redemption_method || 'code',
      code_used: redemption.code_used || 'CODE',
      redemption_amount: redemption.redemption_amount || 0,
      redemption_date: redemption.redemption_date,
      created_at: redemption.created_at || redemption.redemption_date,
      promotion: {
        id: redemption.promotion_id,
        title: 'Promoción',
        name: 'Promoción'
      },
      business: {
        id: redemption.business_id,
        business_name: 'Negocio'
      }
    }));

    // Intentar obtener datos de promociones y negocios si hay canjes
    if (redemptionsData.length > 0) {
      try {
        const promotionIds = [...new Set(redemptionsData.map(r => r.promotion_id))];
        const businessIds = [...new Set(redemptionsData.map(r => r.business_id))];

        // Obtener promociones solo si hay IDs válidos
        let promotions = null;
        if (promotionIds.length > 0) {
          const { data: promotionsData, error: promotionsError } = await supabase
            .from('promotions')
            .select('id, title, name')
            .in('id', promotionIds);
          
          if (!promotionsError) {
            promotions = promotionsData;
          } else {
            console.warn('⚠️ Error obteniendo promociones:', promotionsError);
          }
        }

        // Obtener negocios solo si hay IDs válidos
        let businesses = null;
        if (businessIds.length > 0) {
          const { data: businessesData, error: businessesError } = await supabase
            .from('businesses')
            .select('id, business_name')
            .in('id', businessIds);
          
          if (!businessesError) {
            businesses = businessesData;
          } else {
            console.warn('⚠️ Error obteniendo negocios:', businessesError);
          }
        }

        // Actualizar datos con información real
        if (promotions) {
          const promotionsMap = new Map(promotions.map((p: any) => [p.id, p]));
          redemptionsData.forEach(redemption => {
            const promo = promotionsMap.get(redemption.promotion_id);
            if (promo) {
              redemption.promotion = {
                id: promo.id,
                title: promo.title || promo.name || 'Promoción',
                name: promo.name
              };
            }
          });
        }

        if (businesses) {
          const businessesMap = new Map(businesses.map((b: any) => [b.id, b]));
          redemptionsData.forEach(redemption => {
            const business = businessesMap.get(redemption.business_id);
            if (business) {
              redemption.business = {
                id: business.id,
                business_name: business.business_name || 'Negocio'
              };
            }
          });
        }
      } catch (error) {
        console.warn('⚠️ Error obteniendo datos adicionales:', error);
        // Continuar con datos básicos
      }
    }

    // Calcular ahorro total
    const totalSavings = redemptionsData.reduce((sum, redemption) => {
      return sum + (redemption.redemption_amount || 0);
    }, 0);

    // Calcular ahorro del mes actual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyRedemptions = redemptionsData.filter(redemption => {
      const redemptionDate = new Date(redemption.redemption_date);
      return redemptionDate.getMonth() === currentMonth && 
             redemptionDate.getFullYear() === currentYear;
    });

    const monthlySavings = monthlyRedemptions.reduce((sum, redemption) => {
      return sum + (redemption.redemption_amount || 0);
    }, 0);

    console.log('✅ Datos obtenidos exitosamente:', {
      totalRedemptions: redemptionsData.length,
      totalSavings,
      monthlySavings,
      monthlyRedemptions: monthlyRedemptions.length
    });

    return {
      totalSavings,
      monthlySavings,
      redemptions: redemptionsData
    };
  } catch (error) {
    console.error('❌ Error en getClientSavingsData:', error);
    // Retornar datos vacíos en caso de error
    return {
      totalSavings: 0,
      monthlySavings: 0,
      redemptions: []
    };
  }
};

// Obtener solo el historial de canjes del cliente
export const getClientRedemptions = async (clientId: string): Promise<ClientRedemption[]> => {
  try {
    const { data: redemptions, error } = await (supabase as any)
      .from('promotion_redemptions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error obteniendo historial de canjes:', error);
      return [];
    }

    return redemptions || [];
  } catch (error) {
    console.error('Error en getClientRedemptions:', error);
    return [];
  }
}; 
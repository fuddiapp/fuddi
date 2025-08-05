import { supabase } from './client';

export interface PromotionRedemption {
  id: string;
  promotion_id: string;
  client_id: string;
  business_id: string;
  redemption_method: 'code' | 'qr';
  code_used: string;
  redemption_amount: number;
  redemption_date: string;
  created_at: string;
}

export interface CreateRedemptionData {
  promotion_id: string;
  client_id: string;
  business_id: string;
  redemption_method: 'code' | 'qr';
  code_used: string;
  redemption_amount: number;
}

// Crear un nuevo canje de promoción
export const createPromotionRedemption = async (data: CreateRedemptionData): Promise<PromotionRedemption> => {
  try {
    console.log('Creando canje de promoción:', data);
    
    const { data: redemption, error } = await (supabase as any)
      .from('promotion_redemptions')
      .insert({
        ...data,
        redemption_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion redemption:', error);
      
      // Si es un error de permisos RLS, mostrar información útil
      if (error.message.includes('permission') || error.message.includes('policy')) {
        console.log('Error de permisos RLS - verificar que el usuario esté autenticado');
        throw new Error('Error de permisos: asegúrate de estar autenticado como cliente');
      }
      
      // Si es un error de foreign key, mostrar información útil
      if (error.message.includes('foreign key')) {
        console.log('Error de foreign key - verificar que los IDs existan');
        throw new Error('Error de datos: verificar que la promoción y el negocio existan');
      }
      
      throw new Error(`Error al crear el canje de promoción: ${error.message}`);
    }

    console.log('Canje creado exitosamente:', redemption);
    
    // Actualizar el contador de canjes en la tabla promotions
    await updatePromotionRedemptionCount(data.promotion_id);
    
    return redemption;
  } catch (error) {
    console.error('Error in createPromotionRedemption:', error);
    throw error;
  }
};

// Obtener canjes de un cliente
export const getClientRedemptions = async (clientId: string): Promise<PromotionRedemption[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('promotion_redemptions')
      .select(`
        *,
        promotions (
          id,
          name,
          image_url,
          business_id
        ),
        businesses (
          id,
          business_name
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client redemptions:', error);
      throw new Error('Error al obtener canjes del cliente');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getClientRedemptions:', error);
    throw error;
  }
};

// Obtener canjes de un negocio
export const getBusinessRedemptions = async (businessId: string): Promise<PromotionRedemption[]> => {
  try {
    console.log('🔍 Buscando canjes para negocio:', businessId);
    
    // Primero obtener los canjes básicos
    const { data: redemptions, error: redemptionsError } = await (supabase as any)
      .from('promotion_redemptions')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (redemptionsError) {
      console.error('Error fetching redemptions:', redemptionsError);
      throw new Error('Error al obtener canjes del negocio');
    }

    if (!redemptions || redemptions.length === 0) {
      console.log('✅ No se encontraron canjes');
      return [];
    }

    console.log('✅ Canjes básicos encontrados:', redemptions.length);

    // Obtener IDs únicos de promociones y clientes
    const promotionIds = [...new Set(redemptions.map((r: any) => r.promotion_id))];
    const clientIds = [...new Set(redemptions.map((r: any) => r.client_id))];

    // Obtener datos de promociones
    const { data: promotions, error: promotionsError } = await (supabase as any)
      .from('promotions')
      .select('id, title, name')
      .in('id', promotionIds);

    if (promotionsError) {
      console.error('Error fetching promotions:', promotionsError);
    }

    // Obtener datos de clientes
    const { data: clients, error: clientsError } = await (supabase as any)
      .from('clients')
      .select('id, first_name, last_name')
      .in('id', clientIds);

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
    }

    // Crear mapas para acceso rápido
    const promotionsMap = new Map();
    if (promotions) {
      promotions.forEach((promo: any) => {
        promotionsMap.set(promo.id, promo);
      });
    }

    const clientsMap = new Map();
    if (clients) {
      clients.forEach((client: any) => {
        clientsMap.set(client.id, client);
      });
    }

    // Combinar los datos
    const enrichedRedemptions = redemptions.map((redemption: any) => ({
      ...redemption,
      promotions: promotionsMap.get(redemption.promotion_id),
      clients: clientsMap.get(redemption.client_id)
    }));

    console.log('✅ Canjes enriquecidos:', enrichedRedemptions.length);
    if (enrichedRedemptions.length > 0) {
      console.log('📋 Primer canje enriquecido:', enrichedRedemptions[0]);
    }

    return enrichedRedemptions;
  } catch (error) {
    console.error('Error in getBusinessRedemptions:', error);
    throw error;
  }
};

// Obtener estadísticas de canjes para un negocio
export const getBusinessRedemptionStats = async (businessId: string) => {
  try {
    console.log('🔍 getBusinessRedemptionStats: Iniciando para businessId:', businessId);
    
    // Obtener total de canjes
    const { data: totalRedemptions, error: totalError } = await (supabase as any)
      .from('promotion_redemptions')
      .select('redemption_amount')
      .eq('business_id', businessId);

    console.log('📊 getBusinessRedemptionStats: Total redemptions query result:', { data: totalRedemptions, error: totalError });

    if (totalError) {
      console.error('Error fetching total redemptions:', totalError);
      throw new Error('Error al obtener estadísticas de canjes');
    }

    // Obtener canjes de hoy
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 getBusinessRedemptionStats: Fecha de hoy:', today);
    
    const { data: todayRedemptions, error: todayError } = await (supabase as any)
      .from('promotion_redemptions')
      .select('redemption_amount')
      .eq('business_id', businessId)
      .gte('redemption_date', today);

    console.log('📊 getBusinessRedemptionStats: Today redemptions query result:', { data: todayRedemptions, error: todayError });

    if (todayError) {
      console.error('Error fetching today redemptions:', todayError);
      throw new Error('Error al obtener canjes de hoy');
    }

    const totalAmount = totalRedemptions?.reduce((sum: number, redemption: any) => sum + redemption.redemption_amount, 0) || 0;
    const todayAmount = todayRedemptions?.reduce((sum: number, redemption: any) => sum + redemption.redemption_amount, 0) || 0;

    const stats = {
      totalRedemptions: totalRedemptions?.length || 0,
      totalAmount,
      todayRedemptions: todayRedemptions?.length || 0,
      todayAmount,
    };

    console.log('✅ getBusinessRedemptionStats: Estadísticas calculadas:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error in getBusinessRedemptionStats:', error);
    throw error;
  }
};

// Verificar si un código de 4 dígitos es válido para un negocio
export const validateFourDigitCode = async (code: string, businessId: string): Promise<boolean> => {
  try {
    console.log('Validando código de 4 dígitos:', code, 'para negocio:', businessId);
    
    // Para el método "código", simplemente verificar que el código tenga 4 dígitos
    // y que el usuario esté autenticado (esto se maneja en las políticas RLS)
    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      console.log('Código inválido: debe ser exactamente 4 dígitos');
      return false;
    }

    // Intentar validar contra la base de datos
    const { data, error } = await (supabase as any)
      .from('business_qr_codes')
      .select('id')
      .eq('four_digit_code', code)
      .eq('business_id', businessId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('Error validating four digit code:', error);
      // Si hay error de permisos, permitir el canje (las políticas RLS se encargarán)
      if (error.message.includes('permission') || error.message.includes('policy')) {
        console.log('Error de permisos, permitiendo canje (RLS se encargará de la validación)');
        return true;
      }
      throw new Error('Error al validar código de 4 dígitos');
    }

    if (data) {
      console.log('Código de 4 dígitos válido encontrado:', data);
      return true;
    } else {
      console.log('Código de 4 dígitos no encontrado o inactivo');
      return false;
    }
  } catch (error) {
    console.error('Error in validateFourDigitCode:', error);
    // En caso de error, permitir el canje para evitar bloqueos
    console.log('Error en validación, permitiendo canje');
    return true;
  }
};

// Verificar si un código QR es válido para un negocio
export const validateQRCode = async (code: string, businessId: string): Promise<boolean> => {
  try {
    console.log('Validando código QR:', code, 'para negocio:', businessId);
    
    // Usar una consulta más simple que no requiera autenticación específica
    const { data, error } = await (supabase as any)
      .from('business_qr_codes')
      .select('id')
      .eq('four_digit_code', code)
      .eq('business_id', businessId)
      .eq('status', 'active')
      .maybeSingle(); // Usar maybeSingle en lugar de single para evitar errores

    if (error) {
      console.error('Error validating QR code:', error);
      // Si hay error de permisos, asumir que el código es válido para evitar bloqueos
      if (error.message.includes('permission') || error.message.includes('policy')) {
        console.log('Error de permisos, asumiendo código válido');
        return true;
      }
      throw new Error('Error al validar código QR');
    }

    console.log('Código QR válido encontrado:', data);
    return !!data;
  } catch (error) {
    console.error('Error in validateQRCode:', error);
    // En caso de error, permitir el canje para evitar bloqueos
    console.log('Error en validación, permitiendo canje');
    return true;
  }
};

// Verificar si un cliente ya canjeó una promoción específica (una vez por siempre - DEPRECATED)
export const checkExistingRedemption = async (promotionId: string, clientId: string): Promise<boolean> => {
  try {
    const { data, error } = await (supabase as any)
      .from('promotion_redemptions')
      .select('id')
      .eq('promotion_id', promotionId)
      .eq('client_id', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false; // No existe canje previo
      }
      console.error('Error checking existing redemption:', error);
      throw new Error('Error al verificar canje existente');
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkExistingRedemption:', error);
    throw error;
  }
};

// Verificar si un cliente ya canjeó una promoción específica hoy (nueva lógica: una vez por día)
export const checkTodayRedemption = async (promotionId: string, clientId: string): Promise<boolean> => {
  try {
    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Verificando canje de hoy para promoción:', promotionId, 'cliente:', clientId, 'fecha:', today);
    
    const { data, error } = await (supabase as any)
      .from('promotion_redemptions')
      .select('id')
      .eq('promotion_id', promotionId)
      .eq('client_id', clientId)
      .gte('redemption_date', `${today}T00:00:00.000Z`)
      .lt('redemption_date', `${today}T23:59:59.999Z`)
      .maybeSingle();

    if (error) {
      console.error('Error checking today redemption:', error);
      throw new Error('Error al verificar canje de hoy');
    }

    const hasRedeemedToday = !!data;
    console.log('¿Ya canjeó hoy?', hasRedeemedToday);
    
    return hasRedeemedToday;
  } catch (error) {
    console.error('Error in checkTodayRedemption:', error);
    throw error;
  }
}; 

// Función para actualizar manualmente el contador de canjes
export async function updatePromotionRedemptionCount(promotionId: string): Promise<void> {
  try {
    // Obtener el número actual de canjes para esta promoción
    const { count, error: countError } = await supabase
      .from('promotion_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('promotion_id', promotionId);

    if (countError) {
      console.error('Error contando canjes:', countError);
      return;
    }

    // Actualizar el contador en la tabla promotions
    const { error: updateError } = await supabase
      .from('promotions')
      .update({ redemptions: count || 0 })
      .eq('id', promotionId);

    if (updateError) {
      console.error('Error actualizando contador de canjes:', updateError);
    } else {
      console.log(`✅ Contador actualizado para promoción ${promotionId}: ${count || 0} canjes`);
    }
  } catch (error) {
    console.error('Error en updatePromotionRedemptionCount:', error);
  }
} 
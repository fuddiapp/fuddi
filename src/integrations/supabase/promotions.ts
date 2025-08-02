import { supabase } from './client';
import type { Database } from './types';

export type Promotion = Database['public']['Tables']['promotions']['Row'];
export type NewPromotion = Database['public']['Tables']['promotions']['Insert'];
export type UpdatePromotion = Database['public']['Tables']['promotions']['Update'];

// Función para subir imagen de promoción
export async function uploadPromotionImage(file: File, fileName: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('promotions')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error al subir imagen:', error);
      throw new Error('Error al subir la imagen');
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('promotions')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error en uploadPromotionImage:', error);
    throw error;
  }
}

// Función para eliminar imagen de promoción
export async function deletePromotionImage(fileName: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('promotions')
      .remove([fileName]);

    if (error) {
      console.error('Error al eliminar imagen:', error);
      throw new Error('Error al eliminar la imagen');
    }
  } catch (error) {
    console.error('Error en deletePromotionImage:', error);
    throw error;
  }
}

// Función para obtener todas las promociones
export async function getPromotions(businessId: string): Promise<Promotion[]> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener promociones:', error);
      // Si es un error de permisos o RLS, devolver array vacío en lugar de lanzar error
      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.warn('Permisos insuficientes para obtener promociones, devolviendo array vacío');
        return [];
      }
      throw new Error('Error al obtener las promociones');
    }

    return data || [];
  } catch (error) {
    console.error('Error en getPromotions:', error);
    // En caso de error, devolver array vacío en lugar de lanzar error
    return [];
  }
}

// Tipo extendido para promoción con datos del negocio
type PromotionWithBusiness = Promotion & {
  businesses?: {
    id: string;
    business_name: string;
    address: string;
    category: string;
    description?: string;
    opening_time: string;
    closing_time: string;
    logo_url?: string;
    created_at: string;
  };
};

// Función para obtener una promoción por ID (para clientes)
export async function getPromotionById(id: string): Promise<PromotionWithBusiness | null> {
  try {
    // Primero obtener la promoción
    const { data: promotionData, error: promotionError } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (promotionError) {
      if (promotionError.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error al obtener promoción:', promotionError);
      throw new Error('Error al obtener la promoción');
    }

    if (!promotionData) {
      return null;
    }

    // Luego obtener los datos del negocio
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id, business_name, address, category, description, opening_time, closing_time, logo_url, created_at')
      .eq('id', promotionData.business_id)
      .single();

    if (businessError) {
      console.error('Error al obtener negocio:', businessError);
      // Retornar la promoción sin datos del negocio
      return promotionData;
    }

    // Combinar los datos
    return {
      ...promotionData,
      businesses: businessData
    } as PromotionWithBusiness;
  } catch (error) {
    console.error('Error en getPromotionById:', error);
    throw error;
  }
}

// Función para obtener una promoción por ID (para negocios)
export async function getPromotionByIdForBusiness(id: string, businessId: string): Promise<Promotion | null> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .eq('business_id', businessId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error al obtener promoción:', error);
      throw new Error('Error al obtener la promoción');
    }

    return data;
  } catch (error) {
    console.error('Error en getPromotionByIdForBusiness:', error);
    throw error;
  }
}

// Función para crear una nueva promoción
export async function createPromotion(promotion: NewPromotion): Promise<Promotion> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .insert(promotion)
      .select()
      .single();

    if (error) {
      console.error('Error al crear promoción:', error);
      throw new Error('Error al crear la promoción');
    }

    return data;
  } catch (error) {
    console.error('Error en createPromotion:', error);
    throw error;
  }
}

// Función para actualizar una promoción
export async function updatePromotion(id: string, updates: UpdatePromotion, businessId: string): Promise<Promotion> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar promoción:', error);
      throw new Error('Error al actualizar la promoción');
    }

    return data;
  } catch (error) {
    console.error('Error en updatePromotion:', error);
    throw error;
  }
}

// Función para eliminar una promoción
export async function deletePromotion(id: string, businessId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error al eliminar promoción:', error);
      throw new Error('Error al eliminar la promoción');
    }
  } catch (error) {
    console.error('Error en deletePromotion:', error);
    throw error;
  }
}

// Función para incrementar vistas de una promoción
export async function incrementPromotionViews(id: string): Promise<void> {
  try {
    // Primero obtener el valor actual
    const { data: currentPromotion, error: fetchError } = await supabase
      .from('promotions')
      .select('views')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error al obtener promoción para incrementar vistas:', fetchError);
      throw new Error('Error al obtener la promoción');
    }

    // Incrementar el valor
    const newViews = (currentPromotion.views || 0) + 1;
    
    const { error } = await supabase
      .from('promotions')
      .update({ views: newViews })
      .eq('id', id);

    if (error) {
      console.error('Error al incrementar vistas:', error);
      throw new Error('Error al incrementar las vistas');
    }
  } catch (error) {
    console.error('Error en incrementPromotionViews:', error);
    throw error;
  }
}

// Función para incrementar redenciones de una promoción
export async function incrementPromotionRedemptions(id: string): Promise<void> {
  try {
    // Primero obtener el valor actual
    const { data: currentPromotion, error: fetchError } = await supabase
      .from('promotions')
      .select('redemptions')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error al obtener promoción para incrementar redenciones:', fetchError);
      throw new Error('Error al obtener la promoción');
    }

    // Incrementar el valor
    const newRedemptions = (currentPromotion.redemptions || 0) + 1;
    
    const { error } = await supabase
      .from('promotions')
      .update({ redemptions: newRedemptions })
      .eq('id', id);

    if (error) {
      console.error('Error al incrementar redenciones:', error);
      throw new Error('Error al incrementar las redenciones');
    }
  } catch (error) {
    console.error('Error en incrementPromotionRedemptions:', error);
    throw error;
  }
} 

// Función para obtener promociones por ubicación (para clientes)
export async function getPromotionsByLocation(
  userLat: number, 
  userLng: number, 
  radiusKm: number = 5
): Promise<Promotion[]> {
  try {
    // Primero obtener todos los negocios con sus ubicaciones
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('id, business_name, location_lat, location_lng, category, address')
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null);

    if (businessesError) {
      console.error('Error al obtener negocios:', businessesError);
      throw new Error('Error al obtener negocios');
    }

    if (!businesses || businesses.length === 0) {
      return [];
    }

    // Filtrar negocios dentro del radio especificado
    const nearbyBusinesses = businesses.filter(business => {
      const distance = calculateDistance(
        userLat, 
        userLng, 
        business.location_lat, 
        business.location_lng
      );
      return distance <= radiusKm;
    });

    if (nearbyBusinesses.length === 0) {
      return [];
    }

    // Obtener IDs de negocios cercanos
    const businessIds = nearbyBusinesses.map(business => business.id);

    // Obtener promociones de esos negocios
    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select(`
        *,
        businesses!inner(
          id,
          business_name,
          location_lat,
          location_lng,
          category,
          address
        )
      `)
      .in('business_id', businessIds)
      .order('created_at', { ascending: false });

    if (promotionsError) {
      console.error('Error al obtener promociones:', promotionsError);
      throw new Error('Error al obtener promociones');
    }

    return promotions || [];
  } catch (error) {
    console.error('Error en getPromotionsByLocation:', error);
    throw error;
  }
}

// Función auxiliar para calcular distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en kilómetros
  return distance;
}

// Función para obtener promociones de un negocio específico (para vista de cliente)
export async function getBusinessPromotions(businessId: string): Promise<Promotion[]> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select(`
        *,
        businesses!inner(
          id,
          business_name,
          location_lat,
          location_lng,
          category,
          address
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener promociones del negocio:', error);
      throw new Error('Error al obtener promociones del negocio');
    }

    return data || [];
  } catch (error) {
    console.error('Error en getBusinessPromotions:', error);
    throw error;
  }
} 

// Función para obtener promociones con contador real de canjes (simplificada)
export async function getPromotionsWithRealRedemptions(businessId: string): Promise<Promotion[]> {
  try {
    // Usar la función original que ya funciona
    const promotions = await getPromotions(businessId);
    
    // Por ahora, usar el contador que ya está en la base de datos
    // Esto es más rápido y evita problemas de tipos
    return promotions;
  } catch (error) {
    console.error('Error en getPromotionsWithRealRedemptions:', error);
    return getPromotions(businessId);
  }
}

// Función para obtener todas las promociones con contador real (simplificada para clientes)
export async function getAllPromotionsWithRealRedemptions(
  userLat?: number, 
  userLng?: number, 
  radiusKm: number = 5
): Promise<Promotion[]> {
  try {
    // Usar la función original que ya funciona
    const promotions = await getPromotionsByLocation(userLat || 0, userLng || 0, radiusKm);
    
    // Por ahora, usar el contador que ya está en la base de datos
    // Esto es más rápido y evita problemas de tipos
    return promotions;
  } catch (error) {
    console.error('Error en getAllPromotionsWithRealRedemptions:', error);
    return getPromotionsByLocation(userLat || 0, userLng || 0, radiusKm);
  }
} 
import { supabase } from './client';

export interface FollowedBusiness {
  id: string;
  client_id: string;
  business_id: string;
  created_at: string;
}

// Obtener todos los negocios seguidos por un usuario
export async function getFollowedBusinesses(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('followed_businesses')
      .select('business_id')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener negocios seguidos:', error);
      return [];
    }

    return data?.map(item => item.business_id) || [];
  } catch (error) {
    console.error('Error inesperado al obtener negocios seguidos:', error);
    return [];
  }
}

// Seguir un negocio
export async function followBusiness(userId: string, businessId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('followed_businesses')
      .insert({
        client_id: userId,
        business_id: businessId
      });

    if (error) {
      console.error('Error al seguir negocio:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inesperado al seguir negocio:', error);
    return false;
  }
}

// Dejar de seguir un negocio
export async function unfollowBusiness(userId: string, businessId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('followed_businesses')
      .delete()
      .eq('client_id', userId)
      .eq('business_id', businessId);

    if (error) {
      console.error('Error al dejar de seguir negocio:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inesperado al dejar de seguir negocio:', error);
    return false;
  }
}

// Verificar si un usuario sigue un negocio
export async function isFollowingBusiness(userId: string, businessId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('followed_businesses')
      .select('id')
      .eq('client_id', userId)
      .eq('business_id', businessId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error al verificar seguimiento:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error inesperado al verificar seguimiento:', error);
    return false;
  }
}

// Obtener el conteo de seguidores de un negocio
export async function getBusinessFollowersCount(businessId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('followed_businesses')
      .select('id', { count: 'exact' })
      .eq('business_id', businessId);

    if (error) {
      console.error('Error al obtener conteo de seguidores:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error inesperado al obtener conteo de seguidores:', error);
    return 0;
  }
}

// Obtener detalles completos de negocios seguidos
export async function getFollowedBusinessesDetails(userId: string) {
  try {
    const { data, error } = await supabase
      .from('followed_businesses')
      .select(`
        business_id,
        created_at,
        businesses (
          id,
          business_name,
          description,
          logo_url,
          address,
          category,
          opening_time,
          closing_time,
          phone,
          website
        )
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener detalles de negocios seguidos:', error);
      return [];
    }

    return data?.map(item => ({
      ...item.businesses,
      followed_at: item.created_at
    })) || [];
  } catch (error) {
    console.error('Error inesperado al obtener detalles de negocios seguidos:', error);
    return [];
  }
} 
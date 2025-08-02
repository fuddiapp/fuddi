import { supabase } from './client';
import type { Database } from './types';
import { getCurrentDate } from '@/lib/utils';

export type Business = Database['public']['Tables']['businesses']['Row'];
export type UpdateBusiness = Database['public']['Tables']['businesses']['Update'];

// Obtener datos del negocio por ID
export const getBusinessById = async (businessId: string) => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error fetching business:', error);
      throw new Error('Error al obtener el negocio');
    }

    return data;
  } catch (error) {
    console.error('Error in getBusinessById:', error);
    throw error;
  }
};

// Obtener datos completos del negocio incluyendo promociones, productos y menús
export async function getBusinessDetails(id: string) {
  try {
    // Obtener datos del negocio
    const business = await getBusinessById(id);
    if (!business) {
      return null;
    }

    // Obtener promociones del negocio
    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false });

    if (promotionsError) {
      console.error('Error al obtener promociones:', promotionsError);
    }

    // Obtener productos del negocio
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error al obtener productos:', productsError);
    }

    // Obtener menús del día del negocio (solo de la fecha actual)
    const today = getCurrentDate();
    const { data: menusDia, error: menusError } = await supabase
      .from('menus_dia')
      .select('*')
      .eq('business_id', id)
      .eq('menu_date', today)
      .order('created_at', { ascending: false });

    if (menusError) {
      console.error('Error al obtener menús del día:', menusError);
    }

    return {
      business,
      promotions: promotions || [],
      products: products || [],
      menusDia: menusDia || []
    };
  } catch (error) {
    console.error('Error al obtener detalles del negocio:', error);
    return null;
  }
}

// Actualizar datos del negocio
export async function updateBusiness(id: string, updates: UpdateBusiness): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error al actualizar datos del negocio:', error);
    return null;
  }
  return data;
}

// Eliminar cuenta del negocio y todos sus datos relacionados
export async function deleteBusinessAccount(businessId: string): Promise<boolean> {
  try {
    // 1. Eliminar promociones del negocio
    const { error: promotionsError } = await supabase
      .from('promotions')
      .delete()
      .eq('business_id', businessId);

    if (promotionsError) {
      console.error('Error al eliminar promociones:', promotionsError);
    }

    // 2. Eliminar productos del negocio
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .eq('business_id', businessId);

    if (productsError) {
      console.error('Error al eliminar productos:', productsError);
    }

    // 3. Eliminar menús del día del negocio
    const { error: menusError } = await supabase
      .from('menus_dia')
      .delete()
      .eq('business_id', businessId);

    if (menusError) {
      console.error('Error al eliminar menús del día:', menusError);
    }

    // 4. Eliminar códigos QR del negocio
    const { error: qrCodesError } = await supabase
      .from('business_qr_codes')
      .delete()
      .eq('business_id', businessId);

    if (qrCodesError) {
      console.error('Error al eliminar códigos QR:', qrCodesError);
    }

    // 5. Eliminar el negocio de la tabla businesses
    const { error: businessError } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (businessError) {
      console.error('Error al eliminar negocio:', businessError);
      return false;
    }

    // 6. Eliminar el usuario de Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(businessId);
    
    if (authError) {
      console.error('Error al eliminar usuario de Auth:', authError);
      // Aunque falle la eliminación del usuario de Auth, consideramos que la cuenta se eliminó
      // porque los datos principales ya fueron eliminados
    }

    return true;
  } catch (error) {
    console.error('Error en deleteBusinessAccount:', error);
    return false;
  }
} 
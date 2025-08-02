import { supabase } from './client';
import type { Database } from './types';
import { getCurrentDate } from '@/lib/utils';

type MenuDia = {
  id: string;
  dia: string;
  nombre_menu?: string;
  descripcion_menu?: string;
  precio_menu?: number;
  business_id?: string;
  user_id?: string;
  created_at: string;
  menu_date?: string;
  allow_reservations?: boolean;
};

type CreateMenuDiaData = {
  dia: string;
  nombre_menu?: string;
  descripcion_menu?: string;
  precio_menu?: number;
  allow_reservations?: boolean;
  user_id?: string;
};

type CleanupStatus = {
  date: string;
  menus: {
    current: number;
    expired: number;
    total: number;
  };
  reservations: {
    current: number;
    expired: number;
    total: number;
  };
  needs_cleanup: boolean;
  timestamp: string;
};

type CleanupResult = {
  success: boolean;
  date: string;
  deleted_menus: number;
  deleted_reservations: number;
  timestamp: string;
};

export const menusDiaService = {
  // Obtener todos los menús del día del negocio actual (solo de la fecha actual)
  async getMenusDia(businessId?: string): Promise<MenuDia[]> {
    const today = getCurrentDate();
    
    let query = supabase
      .from('menus_dia')
      .select('*')
      .eq('menu_date', today)
      .order('created_at', { ascending: false });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching menus del día:', error);
      throw error;
    }

    return data || [];
  },

  // Obtener menús del día por día específico (solo de la fecha actual)
  async getMenusDiaByDay(dia: string): Promise<MenuDia[]> {
    const today = getCurrentDate();
    
    const { data, error } = await supabase
      .from('menus_dia')
      .select('*')
      .eq('dia', dia)
      .eq('menu_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching menus del día por día:', error);
      throw error;
    }

    return data || [];
  },

  // Verificar si existe un menú del día para un día específico
  async checkMenuDiaExists(dia: string): Promise<boolean> {
    const today = getCurrentDate();
    
    const { data, error } = await supabase
      .from('menus_dia')
      .select('id')
      .eq('dia', dia)
      .eq('menu_date', today)
      .limit(1);

    if (error) {
      console.error('Error checking menu del día exists:', error);
      throw error;
    }

    return data && data.length > 0;
  },

  // Crear un nuevo menú del día
  async createMenuDia(menuData: CreateMenuDiaData, businessId: string): Promise<MenuDia> {
    const today = getCurrentDate();
    
    const { data, error } = await supabase
      .from('menus_dia')
      .insert({
        ...menuData,
        business_id: businessId,
        menu_date: today,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating menu del día:', error);
      throw error;
    }

    return data;
  },

  // Actualizar un menú del día existente
  async updateMenuDia(id: string, menuData: Partial<CreateMenuDiaData>): Promise<MenuDia> {
    const { data, error } = await supabase
      .from('menus_dia')
      .update(menuData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating menu del día:', error);
      throw error;
    }

    return data;
  },

  // Eliminar un menú del día
  async deleteMenuDia(id: string): Promise<void> {
    const { error } = await supabase
      .from('menus_dia')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting menu del día:', error);
      throw error;
    }
  },

  // NUEVA FUNCIÓN: Obtener estado de limpieza (implementación manual)
  async getCleanupStatus(): Promise<CleanupStatus> {
    const today = getCurrentDate();
    
    try {
      // Contar menús vigentes
      const { count: currentMenus } = await supabase
        .from('menus_dia')
        .select('*', { count: 'exact', head: true })
        .eq('menu_date', today);

      // Contar menús expirados
      const { count: expiredMenus } = await supabase
        .from('menus_dia')
        .select('*', { count: 'exact', head: true })
        .neq('menu_date', today);

      // Contar reservas vigentes
      const { count: currentReservations } = await supabase
        .from('menu_reservations')
        .select('*', { count: 'exact', head: true })
        .eq('reservation_date', today);

      // Contar reservas expiradas
      const { count: expiredReservations } = await supabase
        .from('menu_reservations')
        .select('*', { count: 'exact', head: true })
        .neq('reservation_date', today);

      return {
        date: today,
        menus: {
          current: currentMenus || 0,
          expired: expiredMenus || 0,
          total: (currentMenus || 0) + (expiredMenus || 0)
        },
        reservations: {
          current: currentReservations || 0,
          expired: expiredReservations || 0,
          total: (currentReservations || 0) + (expiredReservations || 0)
        },
        needs_cleanup: (expiredMenus || 0) > 0 || (expiredReservations || 0) > 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting cleanup status:', error);
      throw error;
    }
  },

  // NUEVA FUNCIÓN: Ejecutar limpieza manual (usando función existente)
  async executeCleanup(): Promise<CleanupResult> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_daily_menus');

      if (error) {
        console.error('Error executing cleanup:', error);
        throw error;
      }

      return {
        success: true,
        date: getCurrentDate(),
        deleted_menus: 0,
        deleted_reservations: 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error executing cleanup:', error);
      // Fallback a limpieza manual
      return this.cleanupExpiredMenus();
    }
  },

  // NUEVA FUNCIÓN: Limpiar menús expirados manualmente (método anterior)
  async cleanupExpiredMenus(): Promise<{ deletedMenus: number; deletedReservations: number }> {
    const today = getCurrentDate();
    
    try {
      // Eliminar menús que no son de la fecha actual
      const { data: oldMenus, error: fetchError } = await supabase
        .from('menus_dia')
        .select('id')
        .neq('menu_date', today);

      if (fetchError) {
        console.error('Error obteniendo menús antiguos:', fetchError);
        throw fetchError;
      }

      if (!oldMenus || oldMenus.length === 0) {
        return { deletedMenus: 0, deletedReservations: 0 };
      }

      // Eliminar los menús antiguos
      const { error: deleteError } = await supabase
        .from('menus_dia')
        .delete()
        .neq('menu_date', today);

      if (deleteError) {
        console.error('Error eliminando menús antiguos:', deleteError);
        throw deleteError;
      }

      console.log(`✅ Se eliminaron ${oldMenus.length} menús antiguos`);
      return { deletedMenus: oldMenus.length, deletedReservations: 0 };
    } catch (error) {
      console.error('Error en cleanupExpiredMenus:', error);
      throw error;
    }
  },

  // NUEVA FUNCIÓN: Verificar si un menú está vigente
  async isMenuCurrent(menuDate: string): Promise<boolean> {
    return menuDate === getCurrentDate();
  },

  // NUEVA FUNCIÓN: Obtener menús vigentes usando la función de la base de datos
  async getCurrentMenus(businessId?: string): Promise<MenuDia[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_current_daily_menus', { business_id_param: businessId || null });

      if (error) {
        console.error('Error getting current menus:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting current menus, falling back to manual query:', error);
      // Fallback a consulta manual
      return this.getMenusDia(businessId);
    }
  }
}; 
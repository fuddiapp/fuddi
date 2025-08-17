import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getDashboardStats, DashboardStats } from '@/integrations/supabase/dashboard-stats';
import { menusDiaService } from '@/integrations/supabase/menus-dia';
import { getProducts } from '@/integrations/supabase/products';

interface DashboardState {
  business: any;
  loadingBusiness: boolean;
  businessError: string | null;
  menusDia: any[];
  loadingMenus: boolean;
  products: any[];
  loadingProducts: boolean;
  menuStats: {
    currentMenus: number;
    totalMenus: number;
    expiredMenus: number;
  };
  dashboardStats: DashboardStats | null;
  loadingStats: boolean;
}

export function useDashboardState() {
  const { user } = useAuth();
  
  // Estados
  const [state, setState] = useState<DashboardState>({
    business: null,
    loadingBusiness: true,
    businessError: null,
    menusDia: [],
    loadingMenus: true,
    products: [],
    loadingProducts: true,
    menuStats: { currentMenus: 0, totalMenus: 0, expiredMenus: 0 },
    dashboardStats: null,
    loadingStats: true,
  });

  // Refs para evitar múltiples llamadas
  const loadingRef = useRef(false);
  const userRef = useRef(user?.id);
  const mountedRef = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Función para actualizar estado de manera segura
  const updateState = useCallback((updates: Partial<DashboardState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Cargar datos del negocio
  const fetchBusiness = useCallback(async () => {
    if (loadingRef.current || !user?.id) {
      return;
    }

    console.log('🔄 Dashboard: Iniciando carga de datos del negocio...');
    loadingRef.current = true;
    updateState({ loadingBusiness: true, businessError: null });

    try {
      // Probar conectividad básica con Supabase
      console.log('🔍 Dashboard: Probando conectividad con Supabase...');
      const { data: testData, error: testError } = await supabase
        .from('businesses')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('❌ Dashboard: Error de conectividad con Supabase:', testError);
        updateState({ 
          businessError: `Error de conexión con la base de datos: ${testError.message}`,
          loadingBusiness: false 
        });
        return;
      }

      console.log('✅ Dashboard: Conectividad con Supabase OK');

      // Consultar negocio
      console.log('📊 Dashboard: Consultando negocio para usuario:', user.id);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Dashboard: Error cargando negocio:', error);
        updateState({ 
          businessError: `No se pudo cargar la información del negocio: ${error.message}`,
          loadingBusiness: false 
        });
      } else {
        console.log('✅ Dashboard: Negocio cargado exitosamente:', data);
        updateState({ business: data, loadingBusiness: false });
      }
    } catch (err) {
      console.error('❌ Dashboard: Error inesperado:', err);
      updateState({ 
        businessError: 'Error inesperado al cargar la información del negocio',
        loadingBusiness: false 
      });
    } finally {
      loadingRef.current = false;
    }
  }, [user?.id, updateState]);

  // Cargar menús
  const fetchMenus = useCallback(async () => {
    if (!user?.id) {
      updateState({ loadingMenus: false });
      return;
    }

    try {
      console.log('🔄 Dashboard: Iniciando carga de menús...');
      updateState({ loadingMenus: true });

      const menus = await menusDiaService.getMenusDia(user.id);
      console.log('✅ Dashboard: Menús cargados:', menus);

      const cleanupStatus = await menusDiaService.getCleanupStatus();
      console.log('✅ Dashboard: Estadísticas de menús:', cleanupStatus);

      updateState({
        menusDia: menus,
        menuStats: {
          currentMenus: cleanupStatus.menus.current,
          totalMenus: cleanupStatus.menus.total,
          expiredMenus: cleanupStatus.menus.expired
        },
        loadingMenus: false
      });
    } catch (error) {
      console.error('❌ Dashboard: Error cargando menús:', error);
      updateState({ menusDia: [], loadingMenus: false });
    }
  }, [user?.id, updateState]);

  // Cargar productos
  const fetchProducts = useCallback(async () => {
    if (!user?.id) {
      updateState({ loadingProducts: false });
      return;
    }

    try {
      console.log('🔄 Dashboard: Iniciando carga de productos...');
      updateState({ loadingProducts: true });

      const productos = await getProducts(user.id);
      console.log('✅ Dashboard: Productos cargados:', productos);
      
      const mapped = productos.map(p => ({ ...p, isFeatured: p.is_featured || false }));
      updateState({ products: mapped, loadingProducts: false });
    } catch (err) {
      console.error('❌ Dashboard: Error cargando productos:', err);
      updateState({ products: [], loadingProducts: false });
    }
  }, [user?.id, updateState]);

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    if (!user?.id) {
      updateState({ loadingStats: false });
      return;
    }

    try {
      console.log('🔄 Dashboard: Iniciando carga de estadísticas...');
      updateState({ loadingStats: true });

      const stats = await getDashboardStats(user.id);
      console.log('✅ Dashboard: Estadísticas cargadas:', stats);
      
      updateState({ dashboardStats: stats, loadingStats: false });
    } catch (error) {
      console.error('❌ Dashboard: Error cargando estadísticas del dashboard:', error);
      updateState({ loadingStats: false });
    }
  }, [user?.id, updateState]);

  // Efectos para cargar datos cuando cambie el usuario
  useEffect(() => {
    if (user?.id && userRef.current !== user.id) {
      userRef.current = user.id;
      fetchBusiness();
      fetchMenus();
      fetchProducts();
      fetchStats();
    } else if (!user?.id) {
      userRef.current = undefined;
      updateState({
        business: null,
        menusDia: [],
        products: [],
        dashboardStats: null,
        loadingBusiness: false,
        loadingMenus: false,
        loadingProducts: false,
        loadingStats: false,
        businessError: null
      });
    }
  }, [user?.id, fetchBusiness, fetchMenus, fetchProducts, fetchStats, updateState]);

  // Función para refrescar todos los datos
  const refreshAll = useCallback(async () => {
    if (user?.id) {
      await Promise.all([
        fetchBusiness(),
        fetchMenus(),
        fetchProducts(),
        fetchStats()
      ]);
    }
  }, [user?.id, fetchBusiness, fetchMenus, fetchProducts, fetchStats]);

  return {
    ...state,
    refreshAll,
    fetchBusiness,
    fetchMenus,
    fetchProducts,
    fetchStats
  };
}

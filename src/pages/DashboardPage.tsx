import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PromotionCard from '@/components/promotions/PromotionCard';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingBag, Percent, TrendingUp, Plus, Utensils, Calendar, Copy, Share2, Edit, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';
import { usePromotions } from '@/contexts/PromotionsContext';
import DatabaseSetupAlert from '@/components/ui/database-setup-alert';
import type { AppPromotion } from '@/contexts/PromotionsContext';
import { menusDiaService } from '@/integrations/supabase/menus-dia';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PreventRerender } from '@/components/ui/prevent-rerender';
import { MenuCard } from '@/components/lunch/MenuCard';
import StatCard from '@/components/dashboard/StatCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ProductCard from '@/components/products/ProductCard';
import { getProducts } from '@/integrations/supabase/products';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import ReservationsCard from '@/components/dashboard/ReservationsCard';
import RedemptionsStatsCard from '@/components/dashboard/RedemptionsStatsCard';
import RedemptionsListCard from '@/components/dashboard/RedemptionsListCard';
import RecentRedemptionsCard from '@/components/dashboard/RecentRedemptionsCard';
import TrendsCard from '@/components/dashboard/TrendsCard';

import { getDashboardStats, DashboardStats } from '@/integrations/supabase/dashboard-stats';
import { getCurrentDate } from '@/lib/utils';
import { useAutoRefreshMenus } from '@/hooks/use-auto-refresh-menus';
import { PromotionsLimitCounter } from '@/components/business/PromotionsLimitCounter';


const DashboardPage = () => {
  const { user } = useAuth();
  const { promotions, loading: loadingPromotions, deletePromotion } = usePromotions();
  const navigate = useNavigate();
  
  // Logs de diagnóstico detallados
  React.useEffect(() => {
    console.log('🔍 DashboardPage: Componente montado');
    console.log('👤 DashboardPage: Usuario:', user);
    console.log('📊 DashboardPage: Estado de promociones:', { promotions, loadingPromotions });
    console.log('🔑 DashboardPage: Variables de entorno:');
    console.log('  - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('  - VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
    console.log('  - VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada');
    console.log('  - NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('  - MODE:', import.meta.env.MODE);
  }, [user, promotions, loadingPromotions]);

  // Verificar variables de entorno
  React.useEffect(() => {
    console.log('🔍 Dashboard: Verificando variables de entorno...');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
    console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada');
    console.log('NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('MODE:', import.meta.env.MODE);
  }, []);

  const [business, setBusiness] = React.useState<any>(null);
  const [loadingBusiness, setLoadingBusiness] = React.useState(true);
  const [businessError, setBusinessError] = React.useState<string | null>(null);
  const [menusDia, setMenusDia] = React.useState<any[]>([]);
  const [loadingMenus, setLoadingMenus] = React.useState(true);
  const [products, setProducts] = React.useState([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [menuStats, setMenuStats] = React.useState<{
    currentMenus: number;
    totalMenus: number;
    expiredMenus: number;
  }>({ currentMenus: 0, totalMenus: 0, expiredMenus: 0 });
  // const [cleaningMenus, setCleaningMenus] = React.useState(false); // Eliminado - ya no se necesita
  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);

  // Función para obtener el día actual
  const getCurrentDay = () => {
    const today = new Date();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dayNames[today.getDay()];
  };

  // Función para formatear precio
  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Cargar datos del negocio
  React.useEffect(() => {
    const fetchBusiness = async () => {
      console.log('🔄 Dashboard: Iniciando carga de datos del negocio...');
      setLoadingBusiness(true);
      setBusinessError(null);
      
      if (!user?.id) {
        console.log('❌ Dashboard: No hay usuario autenticado');
        setLoadingBusiness(false);
        return;
      }
      
      try {
        // Primero, probar conectividad básica con Supabase
        console.log('🔍 Dashboard: Probando conectividad con Supabase...');
        const { data: testData, error: testError } = await supabase
          .from('businesses')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('❌ Dashboard: Error de conectividad con Supabase:', testError);
          setBusinessError(`Error de conexión con la base de datos: ${testError.message}`);
          setLoadingBusiness(false);
          return;
        }
        
        console.log('✅ Dashboard: Conectividad con Supabase OK');
        
        console.log('📊 Dashboard: Consultando negocio para usuario:', user.id);
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('❌ Dashboard: Error cargando negocio:', error);
          setBusinessError(`No se pudo cargar la información del negocio: ${error.message}`);
        } else {
          console.log('✅ Dashboard: Negocio cargado exitosamente:', data);
          setBusiness(data);
        }
      } catch (err) {
        console.error('❌ Dashboard: Error inesperado:', err);
        setBusinessError('Error inesperado al cargar la información del negocio');
      }
      
      setLoadingBusiness(false);
    };
    
    fetchBusiness();
  }, [user]);

  // Cargar menús del día del negocio (solo de la fecha actual)
  const fetchMenus = React.useCallback(async () => {
    console.log('🔄 Dashboard: Iniciando carga de menús...');
    setLoadingMenus(true);
    if (!user?.id) {
      console.log('❌ Dashboard: No hay usuario para cargar menús');
      setLoadingMenus(false);
      return;
    }
    
    try {
      console.log('📊 Dashboard: Consultando menús para usuario:', user.id);
      // Usar el servicio actualizado que filtra por fecha actual
      const menus = await menusDiaService.getMenusDia(user.id);
      console.log('✅ Dashboard: Menús cargados:', menus);
      setMenusDia(menus);
      
      // Obtener estadísticas de menús usando getCleanupStatus
      console.log('📊 Dashboard: Obteniendo estadísticas de menús...');
      const cleanupStatus = await menusDiaService.getCleanupStatus();
      console.log('✅ Dashboard: Estadísticas de menús:', cleanupStatus);
      setMenuStats({
        currentMenus: cleanupStatus.menus.current,
        totalMenus: cleanupStatus.menus.total,
        expiredMenus: cleanupStatus.menus.expired
      });
    } catch (error) {
      console.error('❌ Dashboard: Error cargando menús:', error);
      setMenusDia([]);
    } finally {
      setLoadingMenus(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Usar el hook para actualización automática cuando cambie la fecha
  const { forceRefresh } = useAutoRefreshMenus({
    refreshFunction: fetchMenus,
    dependencies: [fetchMenus]
  });

  // Función para limpiar menús expirados manualmente - ELIMINADA

  // Cargar productos del negocio
  React.useEffect(() => {
    const fetchProducts = async () => {
      console.log('🔄 Dashboard: Iniciando carga de productos...');
      setLoadingProducts(true);
      if (!user?.id) {
        console.log('❌ Dashboard: No hay usuario para cargar productos');
        setLoadingProducts(false);
        return;
      }
      try {
        console.log('📊 Dashboard: Consultando productos para usuario:', user.id);
        const productos = await getProducts(user.id);
        console.log('✅ Dashboard: Productos cargados:', productos);
        // Normalizar campo destacado
        const mapped = productos.map(p => ({ ...p, isFeatured: p.is_featured || false }));
        setProducts(mapped);
      } catch (err) {
        console.error('❌ Dashboard: Error cargando productos:', err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [user?.id]);

  // Cargar estadísticas del dashboard
  React.useEffect(() => {
    const fetchDashboardStats = async () => {
      console.log('🔄 Dashboard: Iniciando carga de estadísticas...');
      setLoadingStats(true);
      if (!user?.id) {
        console.log('❌ Dashboard: No hay usuario para cargar estadísticas');
        setLoadingStats(false);
        return;
      }
      
      try {
        console.log('📊 Dashboard: Consultando estadísticas para usuario:', user.id);
        const stats = await getDashboardStats(user.id);
        console.log('✅ Dashboard: Estadísticas cargadas:', stats);
        setDashboardStats(stats);
      } catch (error) {
        console.error('❌ Dashboard: Error cargando estadísticas del dashboard:', error);
        toast.error('Error al cargar estadísticas del dashboard');
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchDashboardStats();
  }, [user?.id, toast]);

  // Calcular métricas clave usando datos reales del dashboard
  const totalPromotions = dashboardStats?.totalPromotions || 0;
  const totalFollowers = dashboardStats?.totalFollowers || 0;
  const totalRedemptions = dashboardStats?.totalRedemptions || 0;
  const totalRevenue = dashboardStats?.totalRevenue || 0;

  // Datos para el gráfico de rendimiento (canjes por fecha)
  const performanceChartData = dashboardStats?.redemptionsByDate.map(item => ({
    date: new Date(item.date).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }),
    views: 0, // Por ahora no tenemos datos de vistas
    redemptions: item.count
  })) || [];

  // Datos para el gráfico de torta: top categorías por canjes
  const pieData = dashboardStats?.topCategories.map(cat => ({
    name: cat.category,
    value: cat.redemptions
  })) || [];
  
  const PIE_COLORS = ['#4F01A1', '#6a1cc1', '#8884d8', '#82ca9d', '#ffc658', '#e0e0e0'];

  // Calcular promociones con mejor rendimiento (más canjes)
  const bestPromotions = [...promotions].sort((a, b) => b.redemptions - a.redemptions).slice(0, 6);

  if (loadingBusiness) {
    return <div className="text-center py-8">Cargando información del negocio...</div>;
  }
  if (businessError) {
    return <div className="text-center py-8 text-red-500">{businessError}</div>;
  }
  if (!business) {
    return <div className="text-center py-8 text-muted-foreground">No se encontró información del negocio.</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto py-2 px-2 sm:py-4 sm:px-4 lg:px-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-800">
              ¡Hola, {business.business_name}!
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Aquí tienes un resumen de tu actividad reciente y herramientas para gestionar tu negocio
            </p>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Panel de Control</h2>
              <p className="text-muted-foreground text-sm sm:text-base">Gestiona tus promociones y menús diarios</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button onClick={() => navigate('/daily-menu')} className="bg-fuddi-purple hover:bg-fuddi-purple-light w-full sm:w-auto">
                <Utensils className="mr-2 h-4 w-4" /> Almuerzo del Día
              </Button>
              <Button onClick={() => navigate('/promotions/new')} className="bg-fuddi-purple hover:bg-fuddi-purple-light w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Nueva Promoción
              </Button>
            </div>
          </div>
          {/* Métricas clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6">
            <StatCard 
              title="Promociones" 
              value={loadingStats ? '...' : totalPromotions} 
              icon={<Percent />} 
              description="Total activas" 
            />
            <StatCard 
              title="Seguidores" 
              value={loadingStats ? '...' : totalFollowers} 
              icon={<Eye />} 
              description="Personas que siguen tu negocio" 
            />
            <StatCard 
              title="Canjes" 
              value={loadingStats ? '...' : totalRedemptions} 
              icon={<TrendingUp />} 
              description="Total de canjes" 
            />
            <StatCard 
              title="Ingresos" 
              value={loadingStats ? '...' : `$${totalRevenue.toLocaleString('es-CL')}`} 
              icon={<ShoppingBag />} 
              description="Generados por canjes" 
            />
          </div>

          {/* Contador de límite de promociones */}
          <div className="w-full bg-white rounded-lg shadow-sm p-4">
            <PromotionsLimitCounter showAlert={false} />
          </div>
          {/* Canjes recientes - PRIMERA SECCIÓN DESPUÉS DE MÉTRICAS */}
          {business && dashboardStats && (
            <div className="w-full bg-white rounded-lg shadow-sm p-4 mt-2">
              <RecentRedemptionsCard 
                redemptions={dashboardStats.recentRedemptions} 
                loading={loadingStats}
              />
            </div>
          )}

          {/* Promociones con mejor rendimiento */}
          {bestPromotions.length > 0 && (
            <div className="w-full bg-white rounded-lg shadow-sm p-4 mt-2">
              <h2 className="font-bold text-lg mb-2 text-fuddi-purple">Promociones con mejor rendimiento</h2>
              <Carousel className="relative">
                <CarouselPrevious />
                <CarouselContent>
                  {bestPromotions.map(promo => (
                    <CarouselItem key={promo.id} className="basis-64 max-w-xs">
                      <PromotionCard
                        {...promo}
                        onEdit={() => navigate(`/promotions/edit/${promo.id}`)}
                        onDelete={() => deletePromotion(promo.id)}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext />
              </Carousel>
            </div>
          )}

          {/* Reservas de menús */}
          {business && (
            <div className="w-full bg-white rounded-lg shadow-sm p-4 mt-2">
              <ReservationsCard businessId={business.id} />
            </div>
          )}
                    {/* Gestión de Menús del Día */}
          <div className="w-full bg-white rounded-lg shadow-sm p-4 mt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-fuddi-purple">Menús del Día</h2>
              <Button 
                onClick={() => navigate('/daily-menu')} 
                className="bg-fuddi-purple hover:bg-fuddi-purple-light"
                size="sm"
              >
                <Utensils className="mr-2 h-4 w-4" />
                Gestionar Menús
              </Button>
            </div>
            
            {/* Menús actuales */}
            {menusDia.length > 0 ? (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Menús de hoy ({getCurrentDay()}):</h3>
                <Carousel className="relative">
                  <CarouselPrevious />
                  <CarouselContent>
                    {menusDia.map(menu => (
                      <CarouselItem key={menu.id} className="basis-64 max-w-xs">
                        <MenuCard
                          menu={{
                            id: menu.id,
                            name: menu.nombre_menu || 'Menú del día',
                            description: menu.descripcion_menu || 'Sin descripción',
                            price: menu.precio_menu
                          }}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselNext />
                </Carousel>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Utensils className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                <p>No hay menús del día para hoy</p>
                <Button 
                  onClick={() => navigate('/daily-menu')} 
                  className="mt-2 bg-fuddi-purple hover:bg-fuddi-purple-light"
                  size="sm"
                >
                  Crear primer menú
                </Button>
              </div>
            )}
          </div>


          {/* Estadísticas de canjes */}
          {business && (
            <div className="w-full bg-white rounded-lg shadow-sm p-4 mt-2">
              <RedemptionsStatsCard businessId={business.id} />
            </div>
          )}



          {/* ===== SECCIÓN DE GRÁFICOS Y TENDENCIAS AL FINAL ===== */}
          
          {/* Tendencias */}
          {business && dashboardStats && (
            <div className="w-full bg-white rounded-lg shadow-sm p-4 mt-2">
              <TrendsCard 
                trends={[
                  {
                    label: 'Canjes',
                    current: dashboardStats.trends.redemptions.current,
                    previous: dashboardStats.trends.redemptions.previous,
                    format: 'number'
                  },
                  {
                    label: 'Ingresos',
                    current: dashboardStats.trends.revenue.current,
                    previous: dashboardStats.trends.revenue.previous,
                    format: 'currency'
                  },
                  {
                    label: 'Seguidores',
                    current: dashboardStats.trends.followers.current,
                    previous: dashboardStats.trends.followers.previous,
                    format: 'number'
                  }
                ]}
                loading={loadingStats}
              />
            </div>
          )}

          {/* Gráfico de rendimiento de canjes */}
          {performanceChartData.length > 0 && (
            <div className="w-full bg-white rounded-lg shadow-sm p-4 mt-2">
              <PerformanceChart data={performanceChartData} title="Canjes por fecha" description="Evolución de canjes en los últimos 30 días" />
            </div>
          )}

          {/* Gráfico de torta de categorías */}
          {pieData.length > 0 && (
            <div className="w-full bg-white rounded-lg shadow-sm p-4 mt-2 flex flex-col items-center">
              <h2 className="font-bold text-lg mb-2 text-fuddi-purple">Distribución de canjes por categoría</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#4F01A1"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} canjes`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

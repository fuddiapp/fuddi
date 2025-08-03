import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  RefreshCw,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface RedemptionData {
  date: string;
  count: number;
  revenue: number;
}

interface PromotionPerformance {
  id: string;
  title: string;
  redemptions: number;
  revenue: number;
  originalPrice: number;
  discountedPrice: number;
}

interface AnalyticsData {
  totalRedemptions: number;
  totalRevenue: number;
  averageRedemptionsPerDay: number;
  topPromotions: PromotionPerformance[];
  redemptionsByDate: RedemptionData[];
  redemptionsByHour: { hour: number; count: number }[];
  redemptionsByDay: { day: string; count: number }[];
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // días
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const COLORS = ['#4F01A1', '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#F3E8FF'];

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user?.id, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('🔍 Analytics: Iniciando carga de datos...');

      // Calcular fecha de inicio basada en el rango seleccionado
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      console.log('📅 Analytics: Rango de fechas:', { startDate, endDate });

      // 1. Obtener canjes del negocio
      const { data: redemptions, error: redemptionsError } = await supabase
        .from('promotion_redemptions')
        .select(`
          id,
          created_at,
          promotion_id
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (redemptionsError) {
        console.error('❌ Analytics: Error cargando canjes:', redemptionsError);
        throw redemptionsError;
      }

      console.log('✅ Analytics: Canjes obtenidos:', redemptions?.length || 0);

      // 2. Obtener promociones del negocio
      const { data: promotions, error: promotionsError } = await supabase
        .from('promotions')
        .select(`
          id,
          title,
          original_price,
          discounted_price
        `)
        .eq('business_id', user.id);

      if (promotionsError) {
        console.error('❌ Analytics: Error cargando promociones:', promotionsError);
        throw promotionsError;
      }

      console.log('✅ Analytics: Promociones obtenidas:', promotions?.length || 0);

      // 3. Procesar datos
      const processedData = processAnalyticsData(redemptions || [], promotions || []);
      setAnalyticsData(processedData);

    } catch (error) {
      console.error('❌ Analytics: Error general:', error);
      toast.error('Error al cargar los datos de rendimiento');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (redemptions: any[], promotions: any[]): AnalyticsData => {
    // Crear mapa de promociones para acceso rápido
    const promotionsMap = new Map();
    promotions.forEach(promo => {
      promotionsMap.set(promo.id, promo);
    });

    // Agrupar por fecha
    const redemptionsByDate = redemptions.reduce((acc: any, redemption: any) => {
      const date = new Date(redemption.created_at).toLocaleDateString('es-CL');
      if (!acc[date]) {
        acc[date] = { date, count: 0, revenue: 0 };
      }
      acc[date].count++;
      const promotion = promotionsMap.get(redemption.promotion_id);
      acc[date].revenue += promotion?.discounted_price || 0;
      return acc;
    }, {});

    // Agrupar por promoción
    const promotionsMap2 = redemptions.reduce((acc: any, redemption: any) => {
      const promotionId = redemption.promotion_id;
      const promotion = promotionsMap.get(promotionId);
      
      if (!acc[promotionId]) {
        acc[promotionId] = {
          id: promotionId,
          title: promotion?.title || 'Promoción',
          redemptions: 0,
          revenue: 0,
          originalPrice: promotion?.original_price || 0,
          discountedPrice: promotion?.discounted_price || 0
        };
      }
      acc[promotionId].redemptions++;
      acc[promotionId].revenue += promotion?.discounted_price || 0;
      return acc;
    }, {});

    // Agrupar por hora
    const redemptionsByHour = redemptions.reduce((acc: any, redemption: any) => {
      const hour = new Date(redemption.created_at).getHours();
      if (!acc[hour]) {
        acc[hour] = { hour, count: 0 };
      }
      acc[hour].count++;
      return acc;
    }, {});

    // Agrupar por día de la semana
    const redemptionsByDay = redemptions.reduce((acc: any, redemption: any) => {
      const day = new Date(redemption.created_at).toLocaleDateString('es-CL', { weekday: 'long' });
      if (!acc[day]) {
        acc[day] = { day, count: 0 };
      }
      acc[day].count++;
      return acc;
    }, {});

    const totalRedemptions = redemptions.length;
    const totalRevenue = redemptions.reduce((sum, r) => {
      const promotion = promotionsMap.get(r.promotion_id);
      return sum + (promotion?.discounted_price || 0);
    }, 0);
    const averageRedemptionsPerDay = totalRedemptions / parseInt(timeRange);

    return {
      totalRedemptions,
      totalRevenue,
      averageRedemptionsPerDay,
      topPromotions: Object.values(promotionsMap2)
        .sort((a: any, b: any) => b.redemptions - a.redemptions)
        .slice(0, 5),
      redemptionsByDate: Object.values(redemptionsByDate).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      redemptionsByHour: Object.values(redemptionsByHour).sort((a: any, b: any) => a.hour - b.hour),
      redemptionsByDay: Object.values(redemptionsByDay)
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('Datos actualizados');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos de rendimiento...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rendimiento</h1>
            <p className="text-gray-600">
              Análisis detallado del rendimiento de tus promociones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 días</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
                <SelectItem value="90">3 meses</SelectItem>
                <SelectItem value="365">1 año</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Canjes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.totalRedemptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Últimos {timeRange} días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analyticsData?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos {timeRange} días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData?.averageRedemptionsPerDay.toFixed(1) || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Canjes por día
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promociones Activas</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.topPromotions.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Con canjes recientes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canjes por Fecha */}
          <Card>
            <CardHeader>
              <CardTitle>Canjes por Fecha</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData?.redemptionsByDate || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Canjes']}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4F01A1" 
                    fill="#4F01A1" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Canjes por Hora */}
          <Card>
            <CardHeader>
              <CardTitle>Canjes por Hora del Día</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.redemptionsByHour || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Canjes']}
                    labelFormatter={(label) => `${label}:00 hrs`}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Promociones */}
        <Card>
          <CardHeader>
            <CardTitle>Promociones Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData?.topPromotions.map((promotion, index) => (
                <div key={promotion.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-fuddi-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{promotion.title}</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(promotion.originalPrice)} → {formatCurrency(promotion.discountedPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{promotion.redemptions} canjes</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(promotion.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Promociones */}
        {analyticsData?.topPromotions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Canjes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.topPromotions}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ title, redemptions }) => `${title}: ${redemptions}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="redemptions"
                    >
                      {analyticsData.topPromotions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Promoción</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topPromotions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), 'Ingresos']}
                    />
                    <Bar dataKey="revenue" fill="#A855F7" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mensaje cuando no hay datos */}
        {(!analyticsData || analyticsData.totalRedemptions === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay datos de rendimiento
              </h3>
              <p className="text-gray-600 mb-6">
                Aún no tienes canjes registrados en los últimos {timeRange} días. 
                Los datos aparecerán aquí una vez que los clientes comiencen a canjear tus promociones.
              </p>
              <Button onClick={() => navigate('/promotions')} className="bg-fuddi-purple hover:bg-fuddi-purple-light">
                Ver Promociones
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;

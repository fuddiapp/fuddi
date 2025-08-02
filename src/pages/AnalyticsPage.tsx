import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import PromotionsChart from '@/components/analytics/PromotionsChart';
import MenusChart from '@/components/analytics/MenusChart';
import TopPerformers from '@/components/analytics/TopPerformers';
import { getAnalyticsData, AnalyticsData } from '@/integrations/supabase/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getAnalyticsData(user.id);
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Error al cargar los datos de análisis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user?.id]);

  const COLORS = ['#4F01A1', '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'];

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Análisis de Rendimiento</h1>
          <p className="text-gray-600">
            Visualiza el rendimiento de tus promociones y menús del día
          </p>
        </div>

        {/* Métricas Generales */}
        {analyticsData && (
          <AnalyticsOverview 
            data={analyticsData} 
            loading={loading} 
          />
        )}

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Promociones */}
          {analyticsData && (
            <PromotionsChart 
              data={analyticsData.promotions.redemptionsByDate} 
              loading={loading} 
            />
          )}

          {/* Gráfico de Menús */}
          {analyticsData && (
            <MenusChart 
              data={analyticsData.menus.reservationsByDate} 
              loading={loading} 
            />
          )}
        </div>

        {/* Top Performers */}
        {analyticsData && (
          <TopPerformers 
            topPromotions={analyticsData.promotions.topPromotions}
            topMenus={analyticsData.menus.topMenus}
            loading={loading}
          />
        )}

        {/* Gráficos Secundarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución por Categorías */}
          {analyticsData && analyticsData.promotions.redemptionsByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Canjes por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.promotions.redemptionsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, redemptions }) => `${category}: ${redemptions}`}
                      outerRadius={80}
                      fill="#4F01A1"
                      dataKey="redemptions"
                    >
                      {analyticsData.promotions.redemptionsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} canjes`, 'Canjes']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Canjes por Día de la Semana */}
          {analyticsData && (
            <Card>
              <CardHeader>
                <CardTitle>Canjes por Día de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.promotions.redemptionsByDayOfWeek.map((dayData, index) => (
                    <div key={dayData.day} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dayData.day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-fuddi-purple h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max(5, (dayData.redemptions / Math.max(...analyticsData.promotions.redemptionsByDayOfWeek.map(d => d.redemptions))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">
                          {dayData.redemptions}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reservas por Día de la Semana */}
        {analyticsData && (
          <Card>
            <CardHeader>
              <CardTitle>Reservas por Día de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.menus.reservationsByDayOfWeek.map((dayData, index) => (
                  <div key={dayData.day} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dayData.day}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-fuddi-purple h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(5, (dayData.reservations / Math.max(...analyticsData.menus.reservationsByDayOfWeek.map(d => d.reservations))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {dayData.reservations}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TopPerformersProps {
  topPromotions: Array<{
    id: string;
    title: string;
    redemptions: number;
    revenue: number;
  }>;
  topMenus: Array<{
    id: string;
    title: string;
    reservations: number;
    date: string;
  }>;
  loading?: boolean;
}

const TopPerformers: React.FC<TopPerformersProps> = ({ topPromotions, topMenus, loading = false }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Cargando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Promociones */}
      <Card>
        <CardHeader>
          <CardTitle>Promociones con Mejor Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPromotions.length > 0 ? (
              topPromotions.map((promo, index) => (
                <div key={promo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{promo.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {promo.redemptions} canjes • {formatCurrency(promo.revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay datos de promociones disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Menús */}
      <Card>
        <CardHeader>
          <CardTitle>Menús Más Solicitados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMenus.length > 0 ? (
              topMenus.map((menu, index) => (
                <div key={menu.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{menu.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {menu.reservations} reservas • {formatDate(menu.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No hay datos de menús disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopPerformers; 
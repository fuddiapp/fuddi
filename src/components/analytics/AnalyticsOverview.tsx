import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsOverviewProps {
  data: {
    promotions: {
      totalRedemptions: number;
      totalRevenue: number;
      conversionRate: number;
    };
    menus: {
      totalReservations: number;
    };
    trends: {
      redemptions: { current: number; previous: number; change: number };
      revenue: { current: number; previous: number; change: number };
      reservations: { current: number; previous: number; change: number };
    };
  };
  loading?: boolean;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ data, loading = false }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Canjes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Canjes</CardTitle>
          {getTrendIcon(data.trends.redemptions.change)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.promotions.totalRedemptions}</div>
          <p className={`text-xs ${getTrendColor(data.trends.redemptions.change)}`}>
            {formatPercentage(data.trends.redemptions.change)} vs período anterior
          </p>
        </CardContent>
      </Card>

      {/* Ingresos Generados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Generados</CardTitle>
          {getTrendIcon(data.trends.revenue.change)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.promotions.totalRevenue)}</div>
          <p className={`text-xs ${getTrendColor(data.trends.revenue.change)}`}>
            {formatPercentage(data.trends.revenue.change)} vs período anterior
          </p>
        </CardContent>
      </Card>

      {/* Tasa de Conversión */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.promotions.conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Canjes por promoción activa
          </p>
        </CardContent>
      </Card>

      {/* Total Reservas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
          {getTrendIcon(data.trends.reservations.change)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.menus.totalReservations}</div>
          <p className={`text-xs ${getTrendColor(data.trends.reservations.change)}`}>
            {formatPercentage(data.trends.reservations.change)} vs período anterior
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverview; 
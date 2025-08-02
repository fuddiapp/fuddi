import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
  current: number;
  previous: number;
  label: string;
  format?: 'number' | 'currency' | 'percentage';
}

interface TrendsCardProps {
  trends: TrendData[];
  loading?: boolean;
}

const TrendsCard: React.FC<TrendsCardProps> = ({ trends, loading = false }) => {
  const calculateTrend = (current: number, previous: number): { 
    percentage: number; 
    isPositive: boolean; 
    isNeutral: boolean;
  } => {
    if (previous === 0) {
      return { percentage: current > 0 ? 100 : 0, isPositive: current > 0, isNeutral: current === 0 };
    }
    
    const percentage = ((current - previous) / previous) * 100;
    return { 
      percentage: Math.abs(percentage), 
      isPositive: percentage > 0, 
      isNeutral: percentage === 0 
    };
  };

  const formatValue = (value: number, format: 'number' | 'currency' | 'percentage' = 'number') => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('es-CL');
    }
  };

  if (loading) {
    return (
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-fuddi-purple/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900">Tendencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-fuddi-purple/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900">Tendencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="mx-auto h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm">No hay datos suficientes para mostrar tendencias</p>
            <p className="text-xs text-gray-400 mt-1">Las tendencias aparecerán cuando tengas más datos históricos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-fuddi-purple/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">Tendencias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend, index) => {
            const { percentage, isPositive, isNeutral } = calculateTrend(trend.current, trend.previous);
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{trend.label}</p>
                  <p className="text-xs text-gray-600">
                    Período actual vs anterior
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatValue(trend.current, trend.format)}
                  </p>
                  <div className="flex items-center gap-1">
                    {isNeutral ? (
                      <Minus className="h-3 w-3 text-gray-500" />
                    ) : isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      isNeutral ? 'text-gray-500' : 
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isNeutral ? 'Sin cambios' : `${percentage.toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendsCard; 
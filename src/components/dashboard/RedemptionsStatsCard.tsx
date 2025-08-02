import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { getBusinessRedemptionStats } from '@/integrations/supabase/promotion-redemptions';

interface RedemptionsStatsCardProps {
  businessId: string;
}

const RedemptionsStatsCard: React.FC<RedemptionsStatsCardProps> = ({ businessId }) => {
  const [stats, setStats] = useState({
    totalRedemptions: 0,
    totalAmount: 0,
    todayRedemptions: 0,
    todayAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!businessId) return;

      try {
        const redemptionStats = await getBusinessRedemptionStats(businessId);
        setStats(redemptionStats);
      } catch (error) {
        console.error('Error loading redemption stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [businessId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-fuddi-purple" />
            Estadísticas de Canjes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-fuddi-purple" />
          Estadísticas de Canjes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total de canjes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Canjes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRedemptions}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Total
          </Badge>
        </div>

        {/* Ingresos totales */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Total
          </Badge>
        </div>

        {/* Canjes de hoy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Canjes de Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayRedemptions}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Hoy
          </Badge>
        </div>

        {/* Ingresos de hoy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos de Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.todayAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Hoy
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default RedemptionsStatsCard; 
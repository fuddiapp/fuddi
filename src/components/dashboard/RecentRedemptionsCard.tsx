import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign } from 'lucide-react';

interface RecentRedemption {
  id: string;
  promotion_title: string;
  client_name: string;
  amount: number;
  date: string;
}

interface RecentRedemptionsCardProps {
  redemptions: RecentRedemption[];
  loading?: boolean;
}

const RecentRedemptionsCard: React.FC<RecentRedemptionsCardProps> = ({ 
  redemptions, 
  loading = false 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-fuddi-purple/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-fuddi-purple" />
            Canjes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!redemptions || redemptions.length === 0) {
    return (
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-fuddi-purple/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-fuddi-purple" />
            Canjes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="mx-auto h-12 w-12 mb-3 text-gray-300" />
            <p className="text-sm">No hay canjes recientes</p>
            <p className="text-xs text-gray-400 mt-1">Los canjes aparecerán aquí cuando los clientes canjeen tus promociones</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:shadow-fuddi-purple/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-fuddi-purple" />
          Canjes Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {redemptions.slice(0, 5).map((redemption) => (
            <div key={redemption.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-fuddi-purple/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-fuddi-purple" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm text-gray-900">
                    {redemption.promotion_title}
                  </p>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-gray-500" />
                    <p className="text-xs text-gray-600">
                      {redemption.client_name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="font-semibold text-sm text-green-600">
                    {formatAmount(redemption.amount)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(redemption.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {redemptions.length > 5 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Mostrando los últimos 5 de {redemptions.length} canjes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRedemptionsCard; 
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, QrCode, CreditCard, User } from 'lucide-react';
import { getBusinessRedemptions, PromotionRedemption } from '@/integrations/supabase/promotion-redemptions';

interface RedemptionWithRelations extends PromotionRedemption {
  promotions?: {
    id: string;
    title?: string;
    name?: string;
    image_url?: string;
  };
  clients?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface RedemptionsListCardProps {
  businessId: string;
}

const RedemptionsListCard: React.FC<RedemptionsListCardProps> = ({ businessId }) => {
  const [redemptions, setRedemptions] = useState<RedemptionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRedemptions = async () => {
      if (!businessId) return;

      try {
        console.log('🔍 Cargando canjes para negocio:', businessId);
        const businessRedemptions = await getBusinessRedemptions(businessId);
        console.log('📊 Canjes obtenidos:', businessRedemptions);
        setRedemptions(businessRedemptions as RedemptionWithRelations[]);
      } catch (error) {
        console.error('Error loading redemptions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRedemptions();
  }, [businessId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodIcon = (method: 'code' | 'qr') => {
    return method === 'qr' ? <QrCode className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />;
  };

  const getMethodColor = (method: 'code' | 'qr') => {
    return method === 'qr' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-fuddi-purple" />
            Canjes Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-fuddi-purple" />
          Canjes Recientes
          <Badge variant="secondary" className="ml-auto">
            {redemptions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {redemptions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay canjes registrados aún</p>
            <p className="text-sm text-gray-400">Los canjes aparecerán aquí cuando los clientes canjeen tus promociones</p>
          </div>
        ) : (
          <div className="space-y-4">
            {redemptions.slice(0, 10).map((redemption) => (
              <div key={redemption.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {/* Avatar del cliente */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-fuddi-purple/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-fuddi-purple" />
                  </div>
                </div>

                {/* Información del canje */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {redemption.clients?.first_name} {redemption.clients?.last_name}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getMethodColor(redemption.redemption_method)}`}
                    >
                      {getMethodIcon(redemption.redemption_method)}
                      <span className="ml-1">
                        {redemption.redemption_method === 'qr' ? 'QR' : 'Código'}
                      </span>
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    {redemption.promotions?.title || redemption.promotions?.name || 'Promoción'}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-semibold text-fuddi-purple">
                      ${redemption.redemption_amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(redemption.created_at)}
                    </span>
                  </div>
                </div>

                {/* Código usado */}
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="font-mono text-xs">
                    {redemption.code_used}
                  </Badge>
                </div>
              </div>
            ))}

            {redemptions.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Mostrando los 10 canjes más recientes de {redemptions.length} total
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RedemptionsListCard; 
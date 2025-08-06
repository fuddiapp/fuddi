import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePromotionsLimit } from '@/hooks/use-promotions-limit';

interface PromotionsLimitCounterProps {
  className?: string;
  showAlert?: boolean;
}

export const PromotionsLimitCounter: React.FC<PromotionsLimitCounterProps> = ({ 
  className = '',
  showAlert = false 
}) => {
  const { limit, isLoading } = usePromotionsLimit();

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = Math.min(100, (limit.current / limit.max) * 100);
  const isNearLimit = limit.remaining <= 3 && limit.remaining > 0;
  const isAtLimit = limit.isAtLimit;
  const isOverLimit = limit.isOverLimit;

  return (
    <>
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-fuddi-purple" />
              <span className="text-sm font-medium text-gray-700">
                Promociones
              </span>
            </div>
            <Badge 
              variant={isOverLimit ? "destructive" : isAtLimit ? "secondary" : "default"}
              className="text-xs"
            >
              {limit.current} / {limit.max}
            </Badge>
          </div>

          <div className="space-y-2">
            <Progress 
              value={progressPercentage} 
              className="h-2"
              color={isOverLimit ? "red" : isAtLimit ? "yellow" : "blue"}
            />
            
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {limit.remaining > 0 
                  ? `${limit.remaining} promociones restantes`
                  : isOverLimit 
                    ? `${Math.abs(limit.remaining)} promociones de más`
                    : 'Límite alcanzado'
                }
              </span>
              
              {isNearLimit && !isAtLimit && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Casi lleno</span>
                </div>
              )}
              
              {isAtLimit && !isOverLimit && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Límite alcanzado</span>
                </div>
              )}
              
              {isOverLimit && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Límite excedido</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showAlert && (isAtLimit || isOverLimit) && (
        <Alert className="mt-3" variant={isOverLimit ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isOverLimit 
              ? `Has excedido el límite de promociones. Elimina ${Math.abs(limit.remaining)} promociones para volver al límite.`
              : 'Has alcanzado el límite de promociones. Elimina algunas promociones existentes para crear nuevas.'
            }
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};


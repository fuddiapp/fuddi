import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { usePromotionsLimit } from '@/hooks/use-promotions-limit';

export const PromotionsLimitMini: React.FC = () => {
  const { limit, isLoading } = usePromotionsLimit();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-gray-500">
        <Package className="h-3 w-3" />
        <span>Cargando...</span>
      </div>
    );
  }

  const isNearLimit = limit.remaining <= 2 && limit.remaining > 0;
  const isAtLimit = limit.isAtLimit;
  const isOverLimit = limit.isOverLimit;

  return (
    <div className="flex items-center justify-between p-2 text-xs">
      <div className="flex items-center gap-2 text-gray-600">
        <Package className="h-3 w-3" />
        <span>Promociones activas</span>
      </div>
      <Badge 
        variant={isOverLimit ? "destructive" : isAtLimit ? "secondary" : isNearLimit ? "default" : "outline"}
        className="text-xs"
      >
        {limit.current}/{limit.max}
      </Badge>
    </div>
  );
};

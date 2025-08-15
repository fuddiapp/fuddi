import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Store, Navigation } from 'lucide-react';
import { formatPriceCLP } from '@/lib/formatters';
import type { ClientPromotion } from '@/contexts/ClientPromotionsContext';

interface ClientPromotionCardProps extends ClientPromotion {
  onViewDetails: (promotion: ClientPromotion) => void;
  onNavigateToBusiness: (business: ClientPromotion['business']) => void;
}

const ClientPromotionCard = ({
  id,
  title,
  description,
  image,
  originalPrice,
  discountedPrice,
  startDate,
  endDate,
  category,
  categories = [],
  views,
  redemptions,
  isIndefinite = false,
  business,
  distance,
  createdAt,
  onViewDetails,
  onNavigateToBusiness
}: ClientPromotionCardProps) => {
  // Validar y convertir precios
  const safeOriginalPrice = Number(originalPrice) || 0;
  const safeDiscountedPrice = Number(discountedPrice) || 0;
  
  // Calculate discount percentage
  const discountPercentage = safeOriginalPrice > 0 
    ? Math.round(((safeOriginalPrice - safeDiscountedPrice) / safeOriginalPrice) * 100)
    : 0;
  
  // Format dates
  const formattedStartDate = new Date(startDate).toLocaleDateString('es-ES', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  const formattedEndDate = isIndefinite 
    ? 'Indefinida'
    : endDate 
      ? new Date(endDate).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        })
      : 'Sin fecha de fin';

  // Usar categorías múltiples si están disponibles, sino usar la categoría única
  const displayCategories = categories.length > 0 ? categories : [category];

  return (
    <Card className="promotion-card group overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-fuddi-purple/10 border-0 shadow-md">
      {/* Image Container */}
      <div className="promotion-image-container">
        <div className="aspect-[4/3] relative">
          <img 
            src={image} 
            alt={title}
            className="promotion-image"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          
          {/* Discount badge */}
          <div className="absolute top-3 right-3">
            <Badge className="discount-badge">
              -{discountPercentage}%
            </Badge>
          </div>
          
          {/* Distance badge */}
          {distance !== undefined && (
            <div className="absolute top-3 left-3">
              <Badge className="distance-badge bg-blue-500 text-white">
                {distance.toFixed(1)} km
              </Badge>
            </div>
          )}
          
          {/* Indefinite badge */}
          {isIndefinite && (
            <div className="absolute top-12 left-3">
              <Badge className="status-badge indefinite">
                INDEFINIDA
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-5 space-y-4">
        {/* Business Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Store className="h-4 w-4 text-fuddi-purple" />
          <span className="font-medium">{business.business_name}</span>
        </div>
        
        {/* Title */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-fuddi-purple transition-colors">
            {title}
          </h3>
        </div>
        

        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        {/* Date range */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formattedStartDate} - {formattedEndDate}</span>
        </div>
        
        {/* Business address */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{business.address}</span>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center justify-between pt-2">
          <div className="price-container">
            <span className="discounted-price">
              {formatPriceCLP(safeDiscountedPrice)}
            </span>
            <span className="original-price">
              {formatPriceCLP(safeOriginalPrice)}
            </span>
          </div>
          <div className="savings-container">
            <div className="savings-label">Ahorras</div>
            <div className="savings-amount">
              {formatPriceCLP(safeOriginalPrice - safeDiscountedPrice)}
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Footer with actions */}
      <CardFooter className="border-t border-gray-100 p-4 bg-gray-50/50">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={() => onViewDetails({
              id,
              title,
              description,
              image,
              originalPrice,
              discountedPrice,
              startDate,
              endDate,
              category,
              categories,
              views,
              redemptions,
              isIndefinite,
              business,
              distance,
              createdAt
            })}
            className="flex-1 bg-fuddi-purple hover:bg-fuddi-purple/90 text-white"
            size="sm"
          >
            Ver Detalles
          </Button>
          <Button 
            onClick={() => onNavigateToBusiness(business)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Navigation className="h-4 w-4" />
            Ir
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientPromotionCard; 
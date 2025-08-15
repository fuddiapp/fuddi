import React from 'react';
import { MapPin, Clock, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPriceCLP } from '@/lib/formatters';
import { formatDistance } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface PromotionCardProps {
  promotion: {
    id: string;
    name: string;
    description: string;
    price: number;
    original_price?: number;
    image_url?: string;
    business_id: string;
    business_name?: string;
    distance?: number;
    categories: string[];
  };
  onClick?: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/promotion/${promotion.id}`);
    }
  };

  const discountPercentage = promotion.original_price 
    ? Math.round(((promotion.original_price - promotion.price) / promotion.original_price) * 100)
    : 0;

  return (
    <Card 
      className="promotion-card group overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-fuddi-purple/10 border-0 shadow-md cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="promotion-image-container">
        <div className="aspect-[4/3] relative">
          <img 
            src={promotion.image_url || '/placeholder.svg'} 
            alt={promotion.name}
            className="promotion-image w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
            <Badge className="discount-badge bg-red-500 text-white font-bold text-xs px-2 py-1">
              -{discountPercentage}%
            </Badge>
          </div>

          {/* Distance badge */}
          {promotion.distance !== undefined && promotion.distance > 0 && (
            <div className="absolute top-3 left-3">
              <Badge className="distance-badge bg-blue-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {formatDistance(promotion.distance)}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Título */}
        <div>
          <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-tight group-hover:text-fuddi-purple transition-colors">
            {promotion.name}
          </h3>
        </div>
        
        {/* Business info and distance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Store className="h-3 w-3 text-gray-500" />
          <p className="font-medium text-sm text-gray-800 truncate">
            {promotion.business_name}
          </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
            <MapPin className="h-3 w-3" />
            <span>{promotion.distance?.toFixed(1) || '0'} km</span>
          </div>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center justify-between pt-1">
          <div className="price-container">
            <span className="discounted-price text-lg font-bold text-fuddi-purple">
              {formatPriceCLP(promotion.price)}
            </span>
            {promotion.original_price && (
              <span className="original-price text-sm text-gray-500 line-through ml-2">
                {formatPriceCLP(promotion.original_price)}
              </span>
            )}
          </div>
          {promotion.original_price && (
            <div className="savings-container text-right">
              <div className="savings-label text-xs text-gray-500">Ahorras</div>
              <div className="savings-amount text-sm font-semibold text-green-600">
                {formatPriceCLP(promotion.original_price - promotion.price)}
              </div>
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
};

export default PromotionCard; 
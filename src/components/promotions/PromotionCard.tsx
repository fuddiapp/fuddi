import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Gift, TrendingUp } from 'lucide-react';
import { formatPriceCLP } from '@/lib/formatters';

interface PromotionCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  startDate: string;
  endDate: string | null;
  category: string;
  categories?: string[];
  views: number;
  redemptions: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isIndefinite?: boolean;
}

const PromotionCard = ({
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
  onEdit,
  onDelete,
  isIndefinite = false
}: PromotionCardProps) => {
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

  // Calculate conversion rate (redemptions / views)
  const conversionRate = views > 0 ? ((redemptions / views) * 100).toFixed(1) : '0';

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
          
          {/* Indefinite badge */}
          {isIndefinite && (
            <div className="absolute top-3 left-3">
              <Badge className="status-badge indefinite">
                INDEFINIDA
              </Badge>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/95 hover:bg-white shadow-lg"
              onClick={() => onEdit(id)}
            >
              <Edit className="h-4 w-4 text-fuddi-purple" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/95 hover:bg-white shadow-lg"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-5 space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-fuddi-purple transition-colors">
            {title}
          </h3>
        </div>
        
        {/* Categories and dates */}
        <div className="flex flex-wrap gap-2">
          {displayCategories.slice(0, 2).map((cat, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
              {cat}
            </Badge>
          ))}
          {displayCategories.length > 2 && (
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
              +{displayCategories.length - 2}
            </Badge>
          )}
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        {/* Date range */}
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block">
          {formattedStartDate} - {formattedEndDate}
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
      
      {/* Footer with stats */}
      <CardFooter className="border-t border-gray-100 p-4 bg-gray-50/50">
        <div className="stats-container">
          <div className="stat-item">
            <Eye className="stat-icon" />
            <span className="font-medium">{views}</span>
          </div>
          <div className="stat-item">
            <Gift className="stat-icon" />
            <span className="font-medium">{redemptions}</span>
          </div>
          <div className="stat-item">
            <TrendingUp className="stat-icon" />
            <span className="font-medium">{conversionRate}%</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;

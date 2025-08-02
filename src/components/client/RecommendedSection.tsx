import React from 'react';
import { Sparkles, TrendingUp, Clock, MapPin } from 'lucide-react';
import { ClientPromotion } from '@/data/mockClientData';
import PromotionCard from './PromotionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecommendedSectionProps {
  promotions: ClientPromotion[];
  onPromotionClick: (promotion: ClientPromotion) => void;
  userPreferences?: string[];
}

const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  promotions,
  onPromotionClick,
  userPreferences = []
}) => {
  const getRecommendationReason = (promotion: ClientPromotion) => {
    const reasons = [];
    
    if (promotion.rating >= 4.5) {
      reasons.push('Excelente rating');
    }
    
    if (promotion.distance <= 1.0) {
      reasons.push('Muy cerca de ti');
    }
    
    if (promotion.canjes > 500) {
      reasons.push('Muy popular');
    }
    
    if (promotion.discountPercentage >= 40) {
      reasons.push('Gran descuento');
    }
    
    // Si hay preferencias del usuario, verificar si coincide
    if (userPreferences.length > 0) {
      const matchingTags = promotion.tags.filter(tag => 
        userPreferences.some(pref => 
          pref.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(pref.toLowerCase())
        )
      );
      
      if (matchingTags.length > 0) {
        reasons.push('Basado en tus gustos');
      }
    }
    
    return reasons.slice(0, 2); // Máximo 2 razones
  };

  const getRecommendationIcon = (promotion: ClientPromotion) => {
    if (promotion.rating >= 4.8) return <Sparkles className="h-4 w-4 text-yellow-500" />;
    if (promotion.distance <= 0.5) return <MapPin className="h-4 w-4 text-green-500" />;
    if (promotion.canjes > 1000) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  if (promotions.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Card className="recommended-section">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Recomendado para ti
            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
              {promotions.length}
            </Badge>
          </CardTitle>
          <p className="text-sm text-purple-600">
            Basado en tus preferencias y ubicación
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {promotions.map((promotion) => {
              const reasons = getRecommendationReason(promotion);
              
              return (
                <div key={promotion.id} className="relative">
                  {/* Recommendation badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
                      {getRecommendationIcon(promotion)}
                      <span className="text-xs font-medium text-gray-700">
                        {reasons[0]}
                      </span>
                    </div>
                  </div>
                  
                  <PromotionCard
                    promotion={{
                      id: promotion.id,
                      name: promotion.name,
                      description: promotion.description,
                      price: promotion.currentPrice,
                      original_price: promotion.originalPrice,
                      image_url: promotion.image,
                      business_id: '', // No tenemos business_id en ClientPromotion
                      business_name: promotion.businessName,
                      distance: promotion.distance,
                      canjes: promotion.canjes,
                      categories: promotion.tags
                    }}
                    onClick={() => onPromotionClick(promotion)}
                  />
                  
                  {/* Additional reason */}
                  {reasons[1] && (
                    <div className="mt-2 text-center">
                      <Badge variant="outline" className="text-xs bg-white/80">
                        {reasons[1]}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendedSection; 
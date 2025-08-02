import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClientPromotion } from '@/data/mockClientData';
import PromotionCard from './PromotionCard';

interface PromotionCarouselProps {
  title: string;
  promotions: ClientPromotion[];
  onPromotionClick?: (promotion: ClientPromotion) => void;
}

const PromotionCarousel: React.FC<PromotionCarouselProps> = ({
  title,
  promotions,
  onPromotionClick,
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 280; // Ancho aproximado de una tarjeta + gap
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full">
      {/* Título y controles */}
      <div className="flex items-center justify-between mb-6">
        <h2 
          className={`text-2xl font-bold text-foreground ${
            title.includes('Explora todas las promociones') 
              ? 'cursor-pointer hover:text-fuddi-purple transition-colors' 
              : ''
          }`}
          onClick={() => {
            if (title.includes('Explora todas las promociones')) {
              navigate('/all-promotions');
            }
          }}
        >
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-secondary-foreground" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-secondary-foreground" />
          </button>
        </div>
      </div>

      {/* Carrusel */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {promotions.map((promotion) => (
          <div 
            key={promotion.id}
            className="flex-shrink-0 w-64"
            style={{ scrollSnapAlign: 'start' }}
          >
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
              onClick={() => onPromotionClick?.(promotion)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionCarousel; 
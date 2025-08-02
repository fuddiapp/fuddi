import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { formatPriceCLP } from '@/lib/formatters';

const AllPromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userLocation } = useUserLocation();
  
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'date' | 'discount'>('distance');

  // Cargar todas las promociones
  useEffect(() => {
    const loadAllPromotions = async () => {
      try {
        setLoading(true);
        
        // Obtener promociones básicas (sin filtro de active ya que no existe esa columna)
        const { data: promotionsData, error: promotionsError } = await supabase
          .from('promotions')
          .select('*')
          .order('created_at', { ascending: false });

        if (promotionsError) {
          console.error('Error cargando promociones:', promotionsError);
          toast({
            title: "Error",
            description: "No se pudieron cargar las promociones.",
            variant: "destructive",
          });
          return;
        }

        console.log('Promociones obtenidas:', promotionsData?.length || 0);

        // Obtener negocios
        const { data: businessesData, error: businessesError } = await supabase
          .from('businesses')
          .select('*');

        if (businessesError) {
          console.error('Error cargando negocios:', businessesError);
          return;
        }

        // Combinar datos
        const combinedPromotions = promotionsData?.map(promotion => {
          const business = businessesData?.find(b => b.id === promotion.business_id);
          let distance = 0;
          
          if (business && userLocation?.latitude && userLocation?.longitude && 
              business.location_lat && business.location_lng) {
            distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              business.location_lat,
              business.location_lng
            );
          }
          
          return {
            ...promotion,
            distance,
            businesses: business || {
              id: promotion.business_id,
              business_name: 'Negocio',
              address: '',
              category: '',
              location_lat: 0,
              location_lng: 0
            }
          };
        }) || [];

        console.log('Promociones combinadas:', combinedPromotions.length);
        setPromotions(combinedPromotions);
      } catch (error) {
        console.error('Error inesperado:', error);
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllPromotions();
  }, [toast, userLocation]);

  // Filtrar y ordenar promociones
  const filteredAndSortedPromotions = useMemo(() => {
    let filtered = promotions;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(promotion =>
        promotion.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promotion.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promotion.businesses?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promotion.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(promotion =>
        promotion.category === selectedCategory ||
        promotion.categories?.includes(selectedCategory)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'price':
          return (a.discounted_price || 0) - (b.discounted_price || 0);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'discount':
          const discountA = a.original_price > 0 ? ((a.original_price - a.discounted_price) / a.original_price) * 100 : 0;
          const discountB = b.original_price > 0 ? ((b.original_price - b.discounted_price) / b.original_price) * 100 : 0;
          return discountB - discountA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [promotions, searchQuery, selectedCategory, sortBy]);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const allCategories = new Set<string>();
    promotions.forEach(promotion => {
      if (promotion.category) allCategories.add(promotion.category);
      promotion.categories?.forEach((cat: string) => allCategories.add(cat));
    });
    return Array.from(allCategories).sort();
  }, [promotions]);

  const handlePromotionClick = (promotion: any) => {
    navigate(`/promotion/${promotion.id}`);
  };

  const handleBusinessClick = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando promociones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/client')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Explora todas las promociones</h1>
              <p className="text-sm text-gray-600">
                {filteredAndSortedPromotions.length} promociones disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar promociones, negocios o categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro de categoría */}
            <div className="flex-shrink-0">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuddi-purple focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Ordenar por */}
            <div className="flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuddi-purple focus:border-transparent"
              >
                <option value="distance">Más cercanas</option>
                <option value="price">Menor precio</option>
                <option value="discount">Mayor descuento</option>
                <option value="date">Más recientes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de promociones */}
        {filteredAndSortedPromotions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron promociones</h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros o la búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedPromotions.map((promotion) => {
              const discountPercentage = promotion.original_price > 0 
                ? Math.round(((promotion.original_price - promotion.discounted_price) / promotion.original_price) * 100)
                : 0;

              return (
                <Card 
                  key={promotion.id}
                  className="group overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-fuddi-purple/10 border-0 shadow-md cursor-pointer"
                  onClick={() => handlePromotionClick(promotion)}
                >
                  {/* Imagen */}
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={promotion.image_url || '/placeholder.svg'} 
                      alt={promotion.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    
                    {/* Badge de descuento */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500 text-white font-bold text-xs px-2 py-1">
                        -{discountPercentage}%
                      </Badge>
                    </div>

                    {/* Badge de distancia */}
                    {promotion.distance > 0 && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-blue-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formatDistance(promotion.distance)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenido */}
                  <CardContent className="p-4 space-y-3">
                    {/* Título */}
                    <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-tight group-hover:text-fuddi-purple transition-colors">
                      {promotion.title}
                    </h3>
                    
                    {/* Negocio */}
                    <div className="flex items-center gap-1">
                      <Store className="h-3 w-3 text-gray-500" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBusinessClick(promotion.businesses.id);
                        }}
                        className="text-sm font-medium text-gray-800 hover:text-fuddi-purple transition-colors"
                      >
                        {promotion.businesses.business_name}
                      </button>
                    </div>
                    
                    {/* Categoría */}
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
                        {promotion.category}
                      </Badge>
                    </div>
                    
                    {/* Precios */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-fuddi-purple">
                          {formatPriceCLP(promotion.discounted_price)}
                        </span>
                        {promotion.original_price > promotion.discounted_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPriceCLP(promotion.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPromotionsPage; 
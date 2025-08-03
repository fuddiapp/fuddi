import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { useNavigate } from 'react-router-dom';
import { calculateDistance, formatDistance } from '@/lib/utils';
import SearchBar from '@/components/client/SearchBar';
import CategoryFilter from '@/components/client/CategoryFilter';
import PromotionCarousel from '@/components/client/PromotionCarousel';
import PromotionCard from '@/components/client/PromotionCard';
import ClientHeader from '@/components/client/ClientHeader';
import RecommendedSection from '@/components/client/RecommendedSection';
import MobileNavigation from '@/components/client/MobileNavigation';
import DesktopNavigation from '@/components/client/DesktopNavigation';
import { supabase } from '@/integrations/supabase/client';
import { getAllPromotionsWithRealRedemptions } from '@/integrations/supabase/promotions';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationsDialog from '@/components/client/NotificationsDialog';
import { ClientPromotion } from '@/data/mockClientData';


// Interfaces para datos reales
interface RealPromotion {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  image_url: string;
  category: string;
  categories: string[];
  views: number;
  redemptions: number;
  start_date: string;
  end_date: string | null;
  is_indefinite: boolean;
  created_at: string;
  businesses: {
    id: string;
    business_name: string;
    address: string;
    location_lat: number;
    location_lng: number;
    category: string;
  };
}

const ClientHomePage: React.FC = () => {
  console.log('🚀 ClientHomePage: Componente iniciando...');
  
  try {
    const { user } = useAuth();
    const { userLocation } = useUserLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    console.log('✅ ClientHomePage: Hooks inicializados correctamente');
    
    // Logs de diagnóstico
    React.useEffect(() => {
      console.log('🔍 ClientHomePage: Componente montado');
      console.log('👤 ClientHomePage: Usuario:', user);
      console.log('📍 ClientHomePage: Ubicación:', userLocation);
      console.log('🔑 ClientHomePage: Variables de entorno:');
      console.log('  - VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
      console.log('  - VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
      console.log('  - VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada');
    }, [user, userLocation]);
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [promotions, setPromotions] = useState<RealPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { followedCount } = useFollowedBusinesses();
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const { notifications, newNotificationsCount } = useNotifications();

  // Simular preferencias del usuario (en una app real vendrían de la base de datos)
  const userPreferences = useMemo(() => ['café', 'saludable', 'desayuno', 'italiano'], []);

  // Función para cargar promociones
  const loadPromotions = async () => {
    try {
      console.log('🔄 ClientHomePage: Iniciando carga de promociones...');
      setLoading(true);
      
      // Obtener promociones activas
      const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      console.log('📅 ClientHomePage: Fecha actual para filtro:', today);
      
      console.log('🔍 ClientHomePage: Consultando tabla promotions...');
      const { data: promotionsData, error: promotionsError } = await supabase
        .from('promotions')
        .select('*')
        .lte('start_date', today) // La promoción ya comenzó
        .or(`end_date.is.null,end_date.gte.${today}`) // No ha terminado o es indefinida
        .order('created_at', { ascending: false });

      console.log('📊 ClientHomePage: Resultado de consulta promotions:', { data: promotionsData, error: promotionsError });

      if (promotionsError) {
        console.error('❌ ClientHomePage: Error cargando promociones:', promotionsError);
        toast({
          title: "Error",
          description: "No se pudieron cargar las promociones.",
          variant: "destructive",
        });
        return;
      }

      console.log('🔍 ClientHomePage: Consultando tabla businesses...');
      // Obtener todos los negocios para relacionar con las promociones
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('*');

      console.log('📊 ClientHomePage: Resultado de consulta businesses:', { data: businessesData, error: businessesError });

      if (businessesError) {
        console.error('❌ ClientHomePage: Error cargando negocios:', businessesError);
        toast({
          title: "Error",
          description: "No se pudieron cargar los negocios.",
          variant: "destructive",
        });
        return;
      }

      console.log('🔗 ClientHomePage: Combinando promociones con negocios...');
      // Combinar promociones con información de negocios
      const promotionsWithBusinesses = promotionsData?.map(promotion => {
        const business = businessesData?.find(b => b.id === promotion.business_id);
        return {
          ...promotion,
          businesses: business || {
            id: promotion.business_id,
            business_name: 'Negocio',
            address: '',
            location_lat: 0,
            location_lng: 0,
            category: ''
          }
        };
      }) || [];

      console.log('✅ ClientHomePage: Promociones combinadas:', promotionsWithBusinesses);
      setPromotions(promotionsWithBusinesses);
    } catch (error) {
      console.error('❌ ClientHomePage: Error inesperado:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 ClientHomePage: Finalizando carga de promociones');
      setLoading(false);
    }
  };

  // Cargar promociones al montar el componente
  useEffect(() => {
    loadPromotions();
  }, [toast, user, userLocation]);

  // Recargar promociones cuando la página vuelva a estar activa (después de un canje)
  useEffect(() => {
    const handleFocus = () => {
      loadPromotions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Convertir promociones reales al formato esperado por los componentes
  const convertedPromotions = useMemo(() => {
    const converted = promotions.map(promo => {
      // Calcular distancia si tenemos ubicación del usuario y coordenadas del negocio
      let distance = 0;
      if (userLocation?.latitude && userLocation?.longitude && 
          promo.businesses?.location_lat && promo.businesses?.location_lng) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          promo.businesses.location_lat,
          promo.businesses.location_lng
        );
      }

      const convertedPromo = {
        id: promo.id,
        name: promo.title,
        description: promo.description,
        originalPrice: promo.original_price,
        currentPrice: promo.discounted_price,
        discountPercentage: promo.original_price > 0 
          ? Math.round(((promo.original_price - promo.discounted_price) / promo.original_price) * 100)
          : 0,
        businessName: promo.businesses?.business_name || 'Negocio',
        businessAddress: promo.businesses?.address || '',
        distance: distance,
        image: promo.image_url || '/placeholder.svg',
        category: promo.category,
        canjes: promo.redemptions || 0,
        rating: 4.5, // TODO: Implementar sistema de ratings
        tags: promo.categories || [promo.category]
      };
      return convertedPromo;
    });
    return converted;
  }, [promotions]);

  // Agrupar promociones por categoría (solo las que están dentro de 2km)
  const promotionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof convertedPromotions> = {};
    convertedPromotions.forEach(promo => {
      // Filtrar por distancia (solo promociones dentro de 2km)
      if (userLocation?.latitude && userLocation?.longitude) {
        if (promo.distance > 2.0) {
          return; // Saltar promociones fuera del rango
        }
      }
      
      const category = promo.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(promo);
    });
    return grouped;
  }, [convertedPromotions, userLocation]);

  // Definir categorías disponibles
  const promoCategories = Object.keys(promotionsByCategory);

  // Definir el orden y los títulos personalizados de las categorías
  const orderedCategories = [
    {
      key: 'Desayunos',
      title: 'Tu desayuno perfecto 🥐',
    },
    {
      key: 'Snacks',
      title: 'Snacks para cualquier momento 🍟',
    },
    {
      key: 'Almuerzos',
      title: 'Almuerzos que te salvan el día 🍽️',
    },
    {
      key: 'Dulces',
      title: 'Un toque dulce para tu día 🧁',
    },
    {
      key: 'Bebidas',
      title: 'Bebidas refrescantes 🥤',
    },
    {
      key: 'Vegetariano',
      title: 'Opciones vegetarianas deliciosas 🥗',
    },
    {
      key: 'Ensaladas',
      title: 'Ensaladas frescas y sabrosas 🥗',
    },
    {
      key: 'Repostería',
      title: 'Repostería artesanal irresistible 🍰',
    },
    {
      key: 'Frutas/Naturales',
      title: 'Frutas y opciones naturales 🍎',
    },
    {
      key: 'Bajo en calorías',
      title: 'Bajo en calorías, alto en sabor 💚',
    },
  ];

  // Mapeo de emojis para categorías de promociones/productos
  const promoCategoryEmojis: Record<string, string> = {
    Desayunos: '🍳',
    Almuerzos: '🍽️',
    Snacks: '🍟',
    Dulces: '🧁',
    Bebidas: '🥤',
    Vegetariano: '🥗',
    // Agrega más si tienes más categorías
  };

  // Filtrar promociones basado en búsqueda, categoría y distancia
  const filteredPromotions = useMemo(() => {
    let filtered = convertedPromotions;

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = promotionsByCategory[selectedCategory] || [];
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(promotion =>
        promotion.name.toLowerCase().includes(query) ||
        promotion.businessName.toLowerCase().includes(query) ||
        promotion.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtrar por distancia (solo si tenemos ubicación del usuario)
    if (userLocation?.latitude && userLocation?.longitude) {
      // Mostrar solo promociones dentro de 2km (distancia ideal para canjear promociones)
      filtered = filtered.filter(promotion => promotion.distance <= 2);
      
      // Ordenar por distancia (más cercanas primero)
      filtered.sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  }, [searchQuery, selectedCategory, convertedPromotions, promotionsByCategory, userLocation]);

  // Obtener promociones recomendadas
  const recommendedPromotions = useMemo(() => {
    return convertedPromotions
      .filter(promotion => {
        // Primero filtrar por distancia (solo promociones dentro de 2km)
        if (userLocation?.latitude && userLocation?.longitude) {
          if (promotion.distance > 2.0) {
            return false;
          }
        }

        // Filtrar por preferencias del usuario
        const hasMatchingTags = promotion.tags.some(tag => 
          userPreferences.some(pref => 
            pref.toLowerCase().includes(tag.toLowerCase()) || 
            tag.toLowerCase().includes(pref.toLowerCase())
          )
        );

        // Filtrar por rating alto o distancia cercana
        const isHighRated = promotion.rating >= 4.5;
        const isNearby = promotion.distance <= 2.0;

        return hasMatchingTags || isHighRated || isNearby;
      })
      .slice(0, 4); // Máximo 4 recomendaciones
  }, [convertedPromotions, userPreferences, userLocation]);

  // Obtener todas las promociones (sin filtrar por distancia para exploración completa)
  const allPromotions = useMemo(() => {
    return convertedPromotions
      .sort((a, b) => {
        // Ordenar por: 1) distancia (si tenemos ubicación), 2) descuento, 3) fecha de creación
        if (userLocation?.latitude && userLocation?.longitude) {
          if (Math.abs(a.distance - b.distance) > 0.1) {
            return a.distance - b.distance;
          }
        }
        if (a.discountPercentage !== b.discountPercentage) {
          return b.discountPercentage - a.discountPercentage;
        }
        return 0;
      })
      .slice(0, 12); // Mostrar hasta 12 promociones
  }, [convertedPromotions, userLocation]);

  // Obtener ofertas top por menos de 5 lucas
  const budgetPromotions = useMemo(() => {
    return convertedPromotions
      .filter(promotion => {
        // Primero filtrar por distancia (solo promociones dentro de 2km)
        if (userLocation?.latitude && userLocation?.longitude) {
          if (promotion.distance > 2.0) {
            return false;
          }
        }
        return promotion.currentPrice < 5000;
      })
      .sort((a, b) => b.discountPercentage - a.discountPercentage) // Ordenar por mejor descuento
      .slice(0, 6); // Máximo 6 ofertas
  }, [convertedPromotions, userLocation]);

  const handlePromotionClick = (promotion: ClientPromotion) => {
    navigate(`/promotion/${promotion.id}`);
  };

  const handleNotificationClick = (notification: { id: string }) => {
    setNotificationsDialogOpen(false);
    navigate(`/promotion/${notification.id}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') navigate('/client');
    else if (tab === 'businesses') navigate('/businesses');
    else if (tab === 'favorites') navigate('/followed');
    else if (tab === 'profile') navigate('/profile');
  };

  const handleLocationChange = () => {
    // En una app real, esto abriría un modal para cambiar ubicación
    console.log('Cambiar ubicación');
  };

  const handleNotificationsClick = () => {
    setNotificationsDialogOpen(true);
  };

  const handleFavoritesClick = () => {
    navigate('/followed');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <>
        <DesktopNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="hidden lg:block h-14 w-full" />
        <div className="px-4 py-3">
          <ClientHeader
            userName={user?.name || 'Usuario'}
            userLocation={user?.address || 'Cerca de ti'}
            notificationsCount={newNotificationsCount}
            favoritesCount={followedCount}
            onLocationChange={handleLocationChange}
            onNotificationsClick={handleNotificationsClick}
            onFavoritesClick={handleFavoritesClick}
            onProfileClick={handleProfileClick}
            onSettingsClick={handleSettingsClick}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-20 lg:pb-8 space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando promociones...</p>
            </div>
          </div>
        </div>
        <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} favoritesCount={followedCount} notificationsCount={newNotificationsCount} />
      </>
    );
  }

  console.log('🎨 ClientHomePage: Renderizando componente...');
  return (
    <>
      <DesktopNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="hidden lg:block h-14 w-full" />
      <div className="px-4 py-3">
        <ClientHeader
          userName={user?.name || 'Usuario'}
          userLocation={userLocation?.address || user?.address || 'Cerca de ti'}
          notificationsCount={newNotificationsCount}
          favoritesCount={followedCount}
          onLocationChange={handleLocationChange}
          onNotificationsClick={handleNotificationsClick}
          onFavoritesClick={handleFavoritesClick}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
        />
      </div>
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 pb-20 lg:pb-8 space-y-8">

        
        {/* Barra de búsqueda */}
        <div className="w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar promociones, restaurantes..."
          />
        </div>
        {/* Filtro de categorías */}
        <div className="w-full">
          <CategoryFilter
            categories={promoCategories.map(id => ({ id, name: id, icon: promoCategoryEmojis[id] || '', color: '' }))}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>
        
        {/* Mensaje cuando no hay promociones */}
        {filteredPromotions.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {userLocation?.address 
                ? `No hay promociones cerca de ${userLocation.address}`
                : 'No hay promociones disponibles'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {userLocation?.address 
                ? 'No encontramos promociones en un radio de 2km de tu ubicación. Intenta cambiar tu ubicación o revisa la sección "Seguidos" para ver tus negocios favoritos.'
                : 'Para ver promociones, necesitas configurar tu ubicación o agregar datos de prueba a la base de datos.'
              }
            </p>

            <button
              onClick={() => window.location.reload()}
              className="bg-fuddi-purple text-white px-6 py-2 rounded-lg hover:bg-fuddi-purple-light transition-colors"
            >
              Actualizar
            </button>
          </div>
        )}

        {/* Sección de recomendados (solo si no hay búsqueda activa y hay promociones) */}
        {!searchQuery.trim() && !selectedCategory && recommendedPromotions.length > 0 && (
          <div className="w-full">
            <RecommendedSection
              promotions={recommendedPromotions.map(promo => ({
                id: promo.id,
                name: promo.name,
                description: promo.description,
                originalPrice: promo.originalPrice,
                currentPrice: promo.currentPrice,
                discountPercentage: promo.discountPercentage,
                businessName: promo.businessName,
                businessAddress: promo.businessAddress,
                distance: promo.distance,
                image: promo.image,
                category: promo.category,
                canjes: promo.canjes,
                rating: promo.rating,
                tags: promo.tags
              }))}
              onPromotionClick={handlePromotionClick}
              userPreferences={userPreferences}
            />
          </div>
        )}

        {/* Sección de todas las promociones (exploración completa) */}
        {!searchQuery.trim() && !selectedCategory && allPromotions.length > 0 && (
          <div className="w-full">
            <PromotionCarousel
              title="🔍 Explora todas las promociones"
              promotions={allPromotions.map(promo => ({
                id: promo.id,
                name: promo.name,
                description: promo.description,
                originalPrice: promo.originalPrice,
                currentPrice: promo.currentPrice,
                discountPercentage: promo.discountPercentage,
                businessName: promo.businessName,
                businessAddress: promo.businessAddress,
                distance: promo.distance,
                image: promo.image,
                category: promo.category,
                canjes: promo.canjes,
                rating: promo.rating,
                tags: promo.tags
              }))}
              onPromotionClick={handlePromotionClick}
            />
          </div>
        )}
        
        {/* Sección de ofertas top por menos de 5 lucas */}
        {!searchQuery.trim() && !selectedCategory && budgetPromotions.length > 0 && (
          <div className="w-full">
            <PromotionCarousel
              title="⭐ Ofertas top por menos de 5 lucas"
              promotions={budgetPromotions.map(promo => ({
                id: promo.id,
                name: promo.name,
                description: promo.description,
                originalPrice: promo.originalPrice,
                currentPrice: promo.currentPrice,
                discountPercentage: promo.discountPercentage,
                businessName: promo.businessName,
                businessAddress: promo.businessAddress,
                distance: promo.distance,
                image: promo.image,
                category: promo.category,
                canjes: promo.canjes,
                rating: promo.rating,
                tags: promo.tags
              }))}
              onPromotionClick={handlePromotionClick}
            />
          </div>
        )}
        
        {/* Resultados de búsqueda o carruseles por categoría */}
        {searchQuery.trim() || selectedCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
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
                onClick={() => handlePromotionClick(promotion)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {orderedCategories.map(({ key, title }) => {
              const promos = promotionsByCategory[key] || [];
              if (promos.length === 0) return null;
              return (
                <PromotionCarousel
                  key={key}
                  title={title}
                  promotions={promos.map(promo => ({
                    id: promo.id,
                    name: promo.name,
                    description: promo.description,
                    originalPrice: promo.originalPrice,
                    currentPrice: promo.currentPrice,
                    discountPercentage: promo.discountPercentage,
                    businessName: promo.businessName,
                    businessAddress: promo.businessAddress,
                    distance: promo.distance,
                    image: promo.image,
                    category: promo.category,
                    canjes: promo.canjes,
                    rating: promo.rating,
                    tags: promo.tags
                  }))}
                  onPromotionClick={handlePromotionClick}
                />
              );
            })}
          </div>
        )}
      </div>
      <MobileNavigation activeTab={activeTab} onTabChange={handleTabChange} favoritesCount={followedCount} notificationsCount={newNotificationsCount} />
      
      {/* Diálogo de notificaciones */}
      <NotificationsDialog
        open={notificationsDialogOpen}
        onOpenChange={setNotificationsDialogOpen}
        notifications={notifications}
        onPromotionClick={handleNotificationClick}
      />
    </>
  );
  } catch (error) {
    console.error('❌ ClientHomePage: Error en el componente:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error en el componente</h3>
          <p className="text-gray-600 mb-6">Ocurrió un error inesperado. Por favor, recarga la página.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-fuddi-purple text-white px-6 py-2 rounded-lg hover:bg-fuddi-purple-light transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
};

export default ClientHomePage; 
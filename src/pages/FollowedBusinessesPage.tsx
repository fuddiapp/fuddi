import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/client/SearchBar';
import CategoryFilter from '@/components/client/CategoryFilter';
import BusinessCard from '@/components/client/BusinessCard';
import PromotionCard from '@/components/client/PromotionCard';
import { categories as businessCategories } from '@/data/mockClientData';
import ClientHeader from '@/components/client/ClientHeader';
import DesktopNavigation from '@/components/client/DesktopNavigation';
import MobileNavigation from '@/components/client/MobileNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isBusinessOpen, calculateDistance, formatDistance } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationsDialog from '@/components/client/NotificationsDialog';

// Interfaces para datos reales
interface RealBusiness {
  id: string;
  business_name: string;
  description: string;
  logo_url: string;
  address: string;
  location_lat: number;
  location_lng: number;
  category: string;
  opening_time: string;
  closing_time: string;
  phone?: string; // Hacer opcional ya que puede no estar en la consulta
  website?: string;
  created_at: string;
}

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
  business_id: string;
}

// Interfaces para los componentes
interface BusinessCardData {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  isOpen: boolean;
  openingHours: string;
  phone: string;
  website?: string;
  activePromotions: any[];
  products: any[];
}

interface PromotionCardData {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  currentPrice: number;
  discountPercentage: number;
  businessName: string;
  businessAddress: string;
  distance: number;
  image: string;
  category: string;
  canjes: number;
  rating: number;
  tags: string[];
}

const FollowedBusinessesPage: React.FC = () => {
  const { user } = useAuth();
  const { userLocation } = useUserLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { followedBusinesses, followedCount } = useFollowedBusinesses();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('recent');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('favorites');
  const [businesses, setBusinesses] = useState<RealBusiness[]>([]);
  const [promotions, setPromotions] = useState<RealPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const { notifications, newNotificationsCount } = useNotifications();

  // Cargar negocios seguidos y sus promociones
  useEffect(() => {
    const loadFollowedData = async () => {
      try {
        setLoading(true);
        
        if (followedBusinesses.size === 0) {
          setBusinesses([]);
          setPromotions([]);
          return;
        }

        const followedIds = Array.from(followedBusinesses);
        
        // Obtener negocios seguidos
        const { data: businessesData, error: businessesError } = await supabase
          .from('businesses')
          .select('*')
          .in('id', followedIds)
          .order('business_name', { ascending: true });

        if (businessesError) {
          console.error('Error cargando negocios seguidos:', businessesError);
          return;
        }

        setBusinesses(Array.isArray(businessesData) ? businessesData : []);

        // Obtener promociones activas de negocios seguidos
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        
        const { data: promotionsData, error: promotionsError } = await supabase
          .from('promotions')
          .select('*')
          .in('business_id', followedIds)
          .lte('start_date', today) // La promoción ya comenzó
          .or(`end_date.is.null,end_date.gte.${today}`) // No ha terminado o es indefinida
          .order('created_at', { ascending: false });

        if (promotionsError) {
          console.error('Error cargando promociones:', promotionsError);
          return;
        }

        setPromotions(promotionsData || []);
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

    loadFollowedData();
  }, [followedBusinesses, toast]);

  // Convertir negocios reales al formato esperado
  const convertedBusinesses = useMemo((): BusinessCardData[] => {
    return businesses.map(business => {
      // Calcular distancia si tenemos ubicación del usuario y coordenadas del negocio
      let distance = 0;
      if (userLocation?.latitude && userLocation?.longitude && 
          business.location_lat && business.location_lng) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          business.location_lat,
          business.location_lng
        );
      }

      return {
        id: business.id,
        name: business.business_name,
        description: business.description || 'Sin descripción disponible',
        logo: business.logo_url || '/placeholder.svg',
        coverImage: business.logo_url || '/placeholder.svg',
        address: business.address,
        distance: distance,
        rating: 4.5, // TODO: Implementar sistema de ratings
        reviewCount: 0, // TODO: Implementar sistema de reviews
        category: business.category,
        tags: [business.category],
        isOpen: isBusinessOpen(business.opening_time, business.closing_time),
        openingHours: `${business.opening_time} - ${business.closing_time}`,
        phone: business.phone || 'N/A',
        website: business.website,
        activePromotions: [], // TODO: Cargar promociones activas
        products: [] // TODO: Cargar productos
      };
    });
  }, [businesses, userLocation]);

  // Convertir promociones reales al formato esperado
  const convertedPromotions = useMemo((): PromotionCardData[] => {
    return promotions.map(promo => {
      // Encontrar el negocio asociado a la promoción
      const business = businesses.find(b => b.id === promo.business_id);
      
      // Calcular distancia si tenemos ubicación del usuario y coordenadas del negocio
      let distance = 0;
      if (userLocation?.latitude && userLocation?.longitude && 
          business?.location_lat && business?.location_lng) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          business.location_lat,
          business.location_lng
        );
      }

      return {
        id: promo.id,
        name: promo.title,
        description: promo.description,
        originalPrice: promo.original_price,
        currentPrice: promo.discounted_price,
        discountPercentage: promo.original_price > 0 
          ? Math.round(((promo.original_price - promo.discounted_price) / promo.original_price) * 100)
          : 0,
        businessName: business?.business_name || 'Negocio',
        businessAddress: business?.address || '',
        distance: distance,
        image: promo.image_url || '/placeholder.svg',
        category: promo.category,
        canjes: promo.redemptions,
        rating: 4.5, // TODO: Implementar sistema de ratings
        tags: promo.categories || [promo.category]
      };
    });
  }, [promotions, businesses, userLocation]);

  // Filtrar y ordenar negocios
  const filteredAndSortedBusinesses = useMemo(() => {
    let filtered = convertedBusinesses;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(query) ||
        business.description.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query)
      );
    }

    // Filtrar por categoría
    if (categoryFilter) {
      filtered = filtered.filter(business => 
        business.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Filtrar por estado (por ahora solo "todos" ya que no tenemos lógica de horarios)
    if (statusFilter === 'open') {
      // TODO: Implementar lógica de horarios
    }

    // En la sección de Seguidos NO aplicamos filtro de distancia
    // El usuario debe poder ver todos sus negocios seguidos independientemente de la distancia
    // Solo mostramos la distancia para información, pero no filtramos

    // Ordenar
    switch (sortFilter) {
      case 'distance':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
      default:
        // Mantener orden original (más recientes primero)
        break;
    }

    return filtered;
  }, [searchQuery, categoryFilter, statusFilter, sortFilter, convertedBusinesses, userLocation]);

  const handleBusinessClick = (business: BusinessCardData) => {
    navigate(`/businesses/${business.id}`);
  };

  const handlePromotionClick = (promotion: PromotionCardData) => {
    navigate(`/promotion/${promotion.id}`);
  };

  const handleNotificationsClick = () => {
    setNotificationsDialogOpen(true);
  };

  const handleNotificationClick = (notification: any) => {
    setNotificationsDialogOpen(false);
    navigate(`/promotion/${notification.id}`);
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <>
        <DesktopNavigation activeTab={activeTab} onTabChange={tab => {
          setActiveTab(tab);
          if (tab === 'home') navigate('/client');
          else if (tab === 'businesses') navigate('/businesses');
          else if (tab === 'favorites') navigate('/followed');
          else if (tab === 'profile') navigate('/profile');
        }} />
        <div className="hidden lg:block h-14 w-full" />
        <div className="px-4 py-3">
          <ClientHeader
            userName={user?.name || 'Usuario'}
            userLocation={userLocation?.address || user?.address || 'Cerca de ti'}
          notificationsCount={newNotificationsCount}
            favoritesCount={followedCount}
            onLocationChange={() => {}}
          onNotificationsClick={handleNotificationsClick}
            onFavoritesClick={() => navigate('/followed')}
            onProfileClick={() => navigate('/profile')}
            onSettingsClick={() => navigate('/user/settings')}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-20 lg:pb-8 space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando negocios seguidos...</p>
            </div>
          </div>
        </div>
        <MobileNavigation activeTab={activeTab} onTabChange={tab => {
          setActiveTab(tab);
          if (tab === 'home') navigate('/client');
          else if (tab === 'businesses') navigate('/businesses');
          else if (tab === 'favorites') navigate('/followed');
          else if (tab === 'profile') navigate('/profile');
        }} favoritesCount={followedCount} notificationsCount={newNotificationsCount} />
      </>
    );
  }

  return (
    <>
      <DesktopNavigation activeTab={activeTab} onTabChange={tab => {
        setActiveTab(tab);
        if (tab === 'home') navigate('/client');
        else if (tab === 'businesses') navigate('/businesses');
        else if (tab === 'favorites') navigate('/followed');
        else if (tab === 'profile') navigate('/profile');
      }} />
      <div className="hidden lg:block h-14 w-full" />
      <div className="px-4 py-3">
        <ClientHeader
          userName={user?.name || 'Usuario'}
          userLocation={userLocation?.address || user?.address || 'Cerca de ti'}
          notificationsCount={newNotificationsCount}
          favoritesCount={followedCount}
          onLocationChange={() => {}}
          onNotificationsClick={handleNotificationsClick}
          onFavoritesClick={() => navigate('/followed')}
          onProfileClick={() => navigate('/profile')}
          onSettingsClick={() => navigate('/user/settings')}
        />
      </div>
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 pb-20 lg:pb-8 space-y-8">


        {/* Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar negocios seguidos..."
          />
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="open">Abiertos ahora</option>
            <option value="hasMenu">Con menú del día</option>
          </select>
          <select
            className="border rounded-lg px-2 py-1 text-sm"
            value={sortFilter}
            onChange={e => setSortFilter(e.target.value)}
          >
            <option value="recent">Más recientes</option>
            <option value="distance">Más cercanos</option>
            <option value="rating">Mejor valoración</option>
            <option value="name">A-Z</option>
          </select>
          <CategoryFilter
            categories={businessCategories.map(cat => ({ id: cat.name, name: cat.name, icon: cat.icon, color: cat.color }))}
            selectedCategory={categoryFilter}
            onCategorySelect={setCategoryFilter}
          />
        </div>
        
        {/* Mensaje cuando no hay negocios seguidos */}
        {convertedBusinesses.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sigues ningún negocio</h3>
            <p className="text-gray-600 mb-6">
              Comienza a seguir negocios para ver sus promociones y menús aquí.
            </p>
            <button
              onClick={() => navigate('/businesses')}
              className="bg-fuddi-purple text-white px-6 py-2 rounded-lg hover:bg-fuddi-purple-light transition-colors"
            >
              Explorar negocios
            </button>
          </div>
        )}
        
        {/* Lista de negocios seguidos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {filteredAndSortedBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onClick={() => handleBusinessClick(business)}
            />
          ))}
        </div>
        
        {/* Promociones activas de negocios seguidos */}
        {convertedPromotions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Promociones de tus negocios</h2>
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-6">
              {convertedPromotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={{
                    id: promotion.id,
                    name: promotion.name,
                    description: promotion.description,
                    price: promotion.currentPrice,
                    original_price: promotion.originalPrice,
                    image_url: promotion.image,
                    business_id: '', // No tenemos business_id en PromotionCardData
                    business_name: promotion.businessName,
                    distance: promotion.distance,
                    canjes: promotion.canjes,
                    categories: promotion.tags
                  }}
                  onClick={() => handlePromotionClick(promotion)}
                />
              ))}
            </div>
            <div className="sm:hidden overflow-x-auto pb-2">
              <div className="flex gap-4">
                {convertedPromotions.map((promotion) => (
                  <div key={promotion.id} className="flex-shrink-0 w-64">
                    <PromotionCard
                      promotion={{
                        id: promotion.id,
                        name: promotion.name,
                        description: promotion.description,
                        price: promotion.currentPrice,
                        original_price: promotion.originalPrice,
                        image_url: promotion.image,
                        business_id: '', // No tenemos business_id en PromotionCardData
                        business_name: promotion.businessName,
                        distance: promotion.distance,
                        canjes: promotion.canjes,
                        categories: promotion.tags
                      }}
                      onClick={() => handlePromotionClick(promotion)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <MobileNavigation activeTab={activeTab} onTabChange={tab => {
        setActiveTab(tab);
        if (tab === 'home') navigate('/client');
        else if (tab === 'businesses') navigate('/businesses');
        else if (tab === 'favorites') navigate('/followed');
        else if (tab === 'profile') navigate('/profile');
              }} favoritesCount={followedCount} notificationsCount={newNotificationsCount} />
      
      {/* Diálogo de notificaciones */}
      <NotificationsDialog
        open={notificationsDialogOpen}
        onOpenChange={setNotificationsDialogOpen}
        notifications={notifications}
        onPromotionClick={handleNotificationClick}
      />
    </>
  );
};

export default FollowedBusinessesPage; 
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/client/SearchBar';
import CategoryFilter from '@/components/client/CategoryFilter';
import BusinessCard from '@/components/client/BusinessCard';
import { categories as businessCategories } from '@/data/mockClientData'; // Rubros de negocios
import ClientHeader from '@/components/client/ClientHeader';
import DesktopNavigation from '@/components/client/DesktopNavigation';
import MobileNavigation from '@/components/client/MobileNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isBusinessOpen } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationsDialog from '@/components/client/NotificationsDialog';
import { getCurrentDate, calculateDistance, formatDistance } from '@/lib/utils';

// Interface para negocios reales
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
  phone?: string;
  email?: string;
  website?: string;
  created_at: string;
}

const BusinessesPage: React.FC = () => {
  const { user } = useAuth();
  const { userLocation } = useUserLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { followedCount } = useFollowedBusinesses();
  
  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('businesses');
  const [businesses, setBusinesses] = useState<RealBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const { notifications, newNotificationsCount } = useNotifications();

  // Cargar negocios reales desde Supabase
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los negocios activos
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('business_name', { ascending: true });

        if (error) {
          console.error('Error cargando negocios:', error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los negocios.",
            variant: "destructive",
          });
          return;
        }

        setBusinesses(data || []);
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

    loadBusinesses();
  }, [toast]);

  // Convertir negocios reales al formato esperado por los componentes
  const convertedBusinesses = useMemo(() => {
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
        phone: business.phone,
        website: business.website,
        activePromotions: [], // TODO: Cargar promociones activas
        products: [] // TODO: Cargar productos
      };
    });
  }, [businesses, userLocation]);

  // Filtrar negocios basado en búsqueda, categoría y distancia
  const filteredBusinesses = useMemo(() => {
    let filtered = convertedBusinesses;

    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(business => 
        business.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(query) ||
        business.description.toLowerCase().includes(query) ||
        business.category.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query)
      );
    }

    // Filtrar por distancia (solo si tenemos ubicación del usuario)
    if (userLocation?.latitude && userLocation?.longitude) {
      // Mostrar solo negocios dentro de 2km (distancia ideal para visitar)
      filtered = filtered.filter(business => business.distance <= 2);
      
      // Ordenar por distancia (más cercanos primero)
      filtered.sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  }, [searchQuery, selectedCategory, convertedBusinesses, userLocation]);

  const handleBusinessClick = (business: any) => {
    navigate(`/businesses/${business.id}`);
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
            notificationsCount={3}
            favoritesCount={followedCount}
            onLocationChange={() => {}}
            onNotificationsClick={() => {}}
            onFavoritesClick={() => navigate('/followed')}
            onProfileClick={() => navigate('/profile')}
            onSettingsClick={() => navigate('/user/settings')}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-20 lg:pb-8 space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando negocios...</p>
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
        {/* Barra de búsqueda */}
        <div className="w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar negocios, rubros..."
          />
        </div>
        {/* Filtro de categorías */}
        <div className="w-full">
          <CategoryFilter
            categories={businessCategories.map(cat => ({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color }))}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>
        
        {/* Mensaje cuando no hay negocios */}
        {filteredBusinesses.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {userLocation?.address 
                ? 'No hay negocios cerca de ti'
                : 'No hay negocios disponibles'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {userLocation?.address 
                ? 'No encontramos negocios en un radio de 2km de tu ubicación. Intenta cambiar tu ubicación o revisa la sección "Seguidos" para ver tus negocios favoritos.'
                : 'Aún no hay negocios registrados en tu zona. ¡Vuelve más tarde!'
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
        
        {/* Resultados de búsqueda */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onClick={() => handleBusinessClick(business)}
            />
          ))}
        </div>
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

export default BusinessesPage; 
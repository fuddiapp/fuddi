import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Globe, Instagram, Facebook, ArrowLeft, CheckCircle, XCircle, Heart, HeartOff, Gift, Utensils, ShoppingCart, Info, ChevronRight, Plus, Home, Tag, Package, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PromotionCard from '@/components/client/PromotionCard';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';
import { formatPriceCLP } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { getBusinessDetails } from '@/integrations/supabase/businesses';
import { categories as businessCategories } from '@/data/mockClientData';
import { isBusinessOpen } from '@/lib/utils';
import { MenuCard } from '@/components/lunch/MenuCard';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import ReservationModal from '@/components/client/ReservationModal';
import { useAuth } from '@/contexts/AuthContext';
import { createReservation, checkExistingReservation } from '@/integrations/supabase/menu-reservations';
import { useAutoRefreshMenus } from '@/hooks/use-auto-refresh-menus';

// Tipos para los datos reales
interface BusinessDetails {
  business: {
    id: string;
    business_name: string;
    description: string | null;
    logo_url: string | null;
    address: string;
    location_lat: number | null;
    location_lng: number | null;
    category: string;
    opening_time: string;
    closing_time: string;
    phone?: string | null;
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    created_at: string | null;
  };
  promotions: Array<{
    id: string;
    title: string;
    description: string;
    original_price: number;
    discounted_price: number;
    image_url: string;
    category: string;
    categories: string[];
    start_date: string;
    end_date: string;
    views: number;
    redemptions: number;
    created_at: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    categories: string[];
    is_featured: boolean;
    available?: boolean;
    created_at: string;
    business_id: string;
    updated_at: string;
  }>;
  menusDia: Array<{
    id: string;
    name?: string;
    description?: string;
    price?: number;
    image_url?: string;
    dia?: string;
    items?: string[];
    available?: boolean;
    created_at?: string;
    allow_reservations?: boolean;
    nombre_menu?: string;
    descripcion_menu?: string;
    precio_menu?: number;
    [key: string]: any; // Permitir propiedades adicionales
  }>;
}

const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFollowing, followBusiness, unfollowBusiness } = useFollowedBusinesses();
  const [activeTab, setActiveTab] = useState('overview');
  const [productCategory, setProductCategory] = useState<string | null>(null);
  const [promotionCategory, setPromotionCategory] = useState<string | null>(null);
  const [reservedMenus, setReservedMenus] = useState<{ [menuId: string]: boolean }>({});
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados para el modal de reserva
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);

  // Cargar datos del negocio
  const loadBusinessDetails = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const details = await getBusinessDetails(id);
      setBusinessDetails(details);
    } catch (error) {
      console.error('Error al cargar detalles del negocio:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del negocio',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadBusinessDetails();
  }, [loadBusinessDetails]);

  // Usar el hook para actualización automática cuando cambie la fecha
  useAutoRefreshMenus(loadBusinessDetails, [loadBusinessDetails]);

  // Función para manejar la reserva de un menú
  const handleReserveMenu = (menu: any) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para hacer una reserva',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedMenu(menu);
    setReservationModalOpen(true);
  };

  // Función para confirmar la reserva
  const handleConfirmReservation = async () => {
    if (!selectedMenu || !user || !id || !businessDetails) return;

    try {
      // Verificar si ya tiene una reserva para este menú
      const hasExistingReservation = await checkExistingReservation(user.id, selectedMenu.id);
      
      if (hasExistingReservation) {
        toast({
          title: 'Reserva existente',
          description: 'Ya tienes una reserva pendiente para este menú',
          variant: 'destructive',
        });
        return;
      }

      // Crear la reserva
      await createReservation({
        menu_id: selectedMenu.id,
        client_id: user.id,
        business_id: id,
        client_name: user.name || 'Cliente', // Usar el nombre del contexto de autenticación
        menu_name: selectedMenu.name || selectedMenu.nombre_menu || 'Menú del día',
        menu_price: selectedMenu.price || selectedMenu.precio_menu || 0
      });

      toast({
        title: 'Reserva exitosa',
        description: `Has reservado "${selectedMenu.name || selectedMenu.nombre_menu}" exitosamente`,
      });
      
      setReservationModalOpen(false);
      setSelectedMenu(null);
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la reserva. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };



  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando negocio...</p>
        </div>
      </div>
    );
  }

  // Validación de negocio
  if (!businessDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Negocio no encontrado</h1>
          <p className="text-gray-600 mb-6">El negocio que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate('/businesses')} className="bg-fuddi-purple hover:bg-fuddi-purple/90">
            Volver a negocios
          </Button>
        </div>
      </div>
    );
  }

  const { business, promotions, products, menusDia } = businessDetails;

  // Obtener rubro (categoría) con emoji
  const businessCategory = businessCategories.find(cat => cat.id === business.category);

  // Verificar si el negocio está abierto
  const isOpen = isBusinessOpen(business.opening_time, business.closing_time);

  // Obtener productos destacados para el resumen
  const featuredProducts = products.filter(p => p.is_featured).slice(0, 6);
  
  // Obtener mejores promociones (por descuento)
  const bestPromotions = promotions
    .sort((a, b) => {
      const discountA = ((a.original_price - a.discounted_price) / a.original_price) * 100;
      const discountB = ((b.original_price - b.discounted_price) / b.original_price) * 100;
      return discountB - discountA;
    })
    .slice(0, 6);

  // Agrupar productos por categoría
  const productsByCategory = products.reduce((acc, product) => {
    // Usar la primera categoría del array, o 'Sin categoría' si no hay categorías
    const category = product.categories && product.categories.length > 0 
      ? product.categories[0] 
      : 'Sin categoría';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Filtrar productos por categoría
  const allProductCategories = Object.keys(productsByCategory);
  const filteredProducts = productCategory 
    ? products.filter(p => p.categories && p.categories.includes(productCategory))
    : products;
  const filteredFeatured = filteredProducts.filter(p => p.is_featured);
  const filteredOthers = filteredProducts.filter(p => !p.is_featured);

  // Filtrar promociones por categoría
  const allPromotionCategories = Array.from(new Set(promotions.flatMap(p => p.categories || [p.category])));
  const filteredPromotions = promotionCategory 
    ? promotions.filter(p => (p.categories || [p.category]).includes(promotionCategory))
    : promotions;

  // Mapeo de emojis para categorías
  const categoryEmojis: Record<string, string> = {
    'Desayunos': '🍳',
    'Almuerzos': '🍽️',
    'Snacks': '🍟',
    'Dulces': '🧁',
    'Bebidas': '🥤',
    'Vegetariano': '🥗',
    'Café': '☕',
    'Postres': '🍰',
    'Comida rápida': '🍔',
    'Restaurante': '🍽️',
  };

  // Helper para renderizar menú del día
  const renderDailyMenu = (menu: any) => (
    <Card key={menu.id} className="shadow-lg">
      <CardContent className="p-4 flex flex-col gap-1">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-lg text-gray-900">{menu.name}</h4>
          <Badge variant="default">
            Disponible
          </Badge>
        </div>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{menu.description}</p>
        <span className="text-fuddi-purple font-bold text-lg">{formatPriceCLP(menu.price)}</span>
        {menu.items && menu.items.length > 0 && (
          <div className="mt-2">
            <h4 className="font-semibold text-gray-900 mb-2">Incluye:</h4>
            <ul className="space-y-1">
              {menu.items.map((item: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-gray-600">
                  <div className="w-2 h-2 bg-fuddi-purple rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {menu.available && (
          reservedMenus[menu.id] ? (
            <Button
              variant="outline"
              className="w-full mt-4 text-green-700 border-green-300 flex items-center gap-2"
              onClick={() => {
                setReservedMenus(prev => ({ ...prev, [menu.id]: false }));
                toast({
                  title: 'Reserva cancelada',
                  description: 'Tu reserva ha sido cancelada.',
                });
              }}
            >
              <CheckCircle className="h-4 w-4" /> Reserva realizada (Cancelar)
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="w-full mt-4 bg-fuddi-purple text-white hover:bg-fuddi-purple/90"
              onClick={() => {
                setReservedMenus(prev => ({ ...prev, [menu.id]: true }));
                toast({
                  title: 'Reserva realizada',
                  description: 'Tu reserva será enviada al negocio.',
                });
              }}
            >
              Reservar menú
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );

  // Componente para tarjeta de producto pequeña
  const ProductCard = ({ product }: { product: any }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow min-w-[160px] max-w-[160px]">
      <div className="aspect-square relative">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.is_featured && (
          <Badge className="absolute top-1 right-1 bg-yellow-500 text-yellow-900 text-xs px-1 py-0">
            <Star className="h-2 w-2 mr-1" />
            Destacado
          </Badge>
        )}
      </div>
      <CardContent className="p-2">
        <h4 className="font-bold text-xs text-gray-900 mb-1 line-clamp-1">{product.name}</h4>
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-fuddi-purple font-bold text-xs">
            {formatPriceCLP(product.price)}
          </span>
          <Badge variant="default" className="text-xs px-1 py-0">
            Disponible
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  // Componente para carrusel horizontal
  const HorizontalCarousel = ({ 
    title, 
    items, 
    renderItem, 
    onViewAll, 
    viewAllTab 
  }: { 
    title: string; 
    items: any[]; 
    renderItem: (item: any) => React.ReactNode; 
    onViewAll?: () => void;
    viewAllTab?: string;
  }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    };

    if (items.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            {onViewAll && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onViewAll}
                className="text-fuddi-purple hover:text-fuddi-purple/80"
              >
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('left')}
                className="h-8 w-8 p-0"
                disabled={scrollPosition <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scroll('right')}
                className="h-8 w-8 p-0"
                disabled={scrollPosition >= (items.length * 220 - 300)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div 
            ref={containerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <div key={item.id} className="flex-shrink-0">
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header - Diferente para móvil y desktop */}
      <div className="relative">
        {/* Desktop Header */}
        <div className="hidden md:block relative h-80 rounded-b-3xl overflow-hidden shadow-lg">
          <img 
            src={business.logo_url || '/placeholder.svg'} 
            alt={business.business_name}
            className="w-full h-full object-cover scale-105 blur-[1px] brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-fuddi-purple/70 via-fuddi-purple/30 to-transparent" />
          
          {/* Botón volver */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            onClick={() => navigate('/businesses')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          {/* Botón seguir */}
          <button
            onClick={async () => {
              if (id) {
                if (isFollowing(id)) {
                  await unfollowBusiness(id);
                  toast({
                    title: 'Dejaste de seguir',
                    description: `Ya no sigues a ${business.business_name}`,
                  });
                } else {
                  await followBusiness(id);
                  toast({
                    title: 'Negocio seguido',
                    description: `Ahora sigues a ${business.business_name}`,
                  });
                }
              }
            }}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 p-2 rounded-full transition-all duration-200"
          >
            {isFollowing(id) ? (
              <HeartOff className="h-5 w-5" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
          </button>

          {/* Información del negocio */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-6 text-white flex flex-col md:flex-row items-end gap-6 bg-gradient-to-t from-black/60 via-black/10 to-transparent">
            <img 
              src={business.logo_url || '/placeholder.svg'} 
              alt={business.business_name}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white/80"
              style={{ 
                boxShadow: '0 8px 32px 0 rgba(120, 60, 200, 0.20)',
                border: '4px solid rgba(255, 255, 255, 0.9)'
              }}
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-1 flex items-center gap-3 drop-shadow-lg">
                {business.business_name}
              </h1>
              <p className="text-white/90 mb-2 text-lg line-clamp-2 drop-shadow-md">{business.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-base">
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  <span>{business.opening_time} - {business.closing_time}</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-md ${
                  isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {isOpen ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Abierto
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Cerrado
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/businesses')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Button
                          onClick={async () => {
              if (id) {
                if (isFollowing(id)) {
                  await unfollowBusiness(id);
                  toast({
                    title: 'Dejaste de seguir',
                    description: `Ya no sigues a ${business.business_name}`,
                  });
                } else {
                  await followBusiness(id);
                  toast({
                    title: 'Negocio seguido',
                    description: `Ahora sigues a ${business.business_name}`,
                  });
                }
              }
            }}
              variant={isFollowing(id) ? "outline" : "default"}
              size="sm"
              className={`flex items-center gap-2 ${
                isFollowing(id) 
                  ? 'text-red-600 border-red-300 hover:bg-red-50' 
                  : 'bg-fuddi-purple hover:bg-fuddi-purple/90 text-white'
              }`}
            >
              {isFollowing(id) ? (
                <>
                  <HeartOff className="h-4 w-4" />
                  Siguiendo
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Seguir
                </>
              )}
            </Button>
          </div>
          
          <div className="px-4 pb-6">
            <div className="flex items-start gap-4">
              <img 
                src={business.logo_url || '/placeholder.svg'} 
                alt={business.business_name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-fuddi-purple/20 shadow-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <span className="line-clamp-1">{business.business_name}</span>
                </h1>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{business.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1">{business.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{business.opening_time} - {business.closing_time}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isOpen ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Abierto
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Cerrado
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Barra de navegación mejorada */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex flex-col items-center gap-1 py-4 px-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-fuddi-purple text-white shadow-md'
                    : 'text-gray-600 hover:text-fuddi-purple hover:bg-gray-50'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs font-medium">Inicio</span>
              </button>
              
              <button
                onClick={() => setActiveTab('promotions')}
                className={`flex flex-col items-center gap-1 py-4 px-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'promotions'
                    ? 'bg-fuddi-purple text-white shadow-md'
                    : 'text-gray-600 hover:text-fuddi-purple hover:bg-gray-50'
                }`}
              >
                <Tag className="h-5 w-5" />
                <span className="text-xs font-medium">Promociones</span>
              </button>
              
              <button
                onClick={() => setActiveTab('products')}
                className={`flex flex-col items-center gap-1 py-4 px-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'products'
                    ? 'bg-fuddi-purple text-white shadow-md'
                    : 'text-gray-600 hover:text-fuddi-purple hover:bg-gray-50'
                }`}
              >
                <Package className="h-5 w-5" />
                <span className="text-xs font-medium">Productos</span>
              </button>
              
              <button
                onClick={() => setActiveTab('menus')}
                className={`flex flex-col items-center gap-1 py-4 px-2 rounded-xl transition-all duration-200 ${
                  activeTab === 'menus'
                    ? 'bg-fuddi-purple text-white shadow-md'
                    : 'text-gray-600 hover:text-fuddi-purple hover:bg-gray-50'
                }`}
              >
                <Utensils className="h-5 w-5" />
                <span className="text-xs font-medium">Menús</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Carrusel de mejores promociones */}
            <HorizontalCarousel
              title="🍕 Mejores promociones"
              items={bestPromotions}
              renderItem={(promotion) => (
                <div className="w-[280px]">
                  <PromotionCard
                    promotion={{
                      id: promotion.id,
                      name: promotion.title,
                      description: promotion.description,
                      price: promotion.discounted_price,
                      original_price: promotion.original_price,
                      image_url: promotion.image_url || '/placeholder.svg',
                      business_id: business.id,
                      business_name: business.business_name,
                      distance: 0.5,
                      canjes: promotion.redemptions,
                      categories: promotion.categories || [promotion.category]
                    }}
                    onClick={() => navigate(`/promotion/${promotion.id}`)}
                  />
                </div>
              )}
              onViewAll={() => setActiveTab('promotions')}
            />

            {/* Carrusel de productos destacados */}
            <HorizontalCarousel
              title="⭐ Productos destacados"
              items={featuredProducts}
              renderItem={(product) => <ProductCard product={product} />}
              onViewAll={() => setActiveTab('products')}
            />

            {/* Menú del día */}
            {menusDia.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">🍽️</span>
                    Menú del día
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('menus')}
                    className="text-fuddi-purple hover:text-fuddi-purple/80"
                  >
                    Ver todas
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <Carousel className="relative">
                  <CarouselPrevious />
                  <CarouselContent>
                    {menusDia.map(menu => (
                      <CarouselItem key={menu.id} className="basis-64 max-w-xs">
                        <MenuCard
                          menu={{
                            id: menu.id,
                            name: menu.name || menu.nombre_menu || 'Menú del día',
                            description: menu.description || menu.descripcion_menu || 'Sin descripción',
                            price: menu.price || menu.precio_menu
                          }}
                          showReserveButton={Boolean(menu.allow_reservations)}
                          onReserve={handleReserveMenu}
                          businessName={business.business_name}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselNext />
                </Carousel>
              </div>
            )}

            {/* Mensaje si no hay ofertas */}
            {bestPromotions.length === 0 && featuredProducts.length === 0 && menusDia.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin ofertas disponibles</h3>
                <p className="text-gray-600">
                  Este negocio aún no ha publicado promociones, productos o menús del día.
                </p>
              </div>
            )}

            {/* Información de contacto - Al final */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  Información de contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{business.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{business.opening_time} - {business.closing_time}</span>
                  </div>
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <a 
                        href={`tel:${business.phone}`}
                        className="text-fuddi-purple hover:underline text-sm"
                      >
                        {business.phone}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-fuddi-purple hover:underline text-sm"
                      >
                        {business.website}
                      </a>
                    </div>
                  )}
                  {business.instagram && (
                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 text-gray-500" />
                      <a 
                        href={`https://instagram.com/${business.instagram}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-fuddi-purple hover:underline text-sm"
                      >
                        @{business.instagram}
                      </a>
                    </div>
                  )}
                  {business.facebook && (
                    <div className="flex items-center gap-3">
                      <Facebook className="h-5 w-5 text-gray-500" />
                      <a 
                        href={`https://facebook.com/${business.facebook}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-fuddi-purple hover:underline text-sm"
                      >
                        {business.facebook}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                size="sm" 
                variant={!promotionCategory ? 'default' : 'outline'} 
                onClick={() => setPromotionCategory(null)}
              >
                Todas
              </Button>
              {allPromotionCategories.map(cat => (
                <Button 
                  key={cat} 
                  size="sm" 
                  variant={promotionCategory === cat ? 'default' : 'outline'} 
                  onClick={() => setPromotionCategory(cat)}
                >
                  {categoryEmojis[cat] ? categoryEmojis[cat] + ' ' : ''}{cat}
                </Button>
              ))}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">Promociones activas</h2>
            {filteredPromotions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromotions.map((promotion) => (
                  <PromotionCard
                    key={promotion.id}
                    promotion={{
                      id: promotion.id,
                      name: promotion.title,
                      description: promotion.description,
                      price: promotion.discounted_price,
                      original_price: promotion.original_price,
                      image_url: promotion.image_url || '/placeholder.svg',
                      business_id: business.id,
                      business_name: business.business_name,
                      distance: 0.5,
                      canjes: promotion.redemptions,
                      categories: promotion.categories || [promotion.category]
                    }}
                    onClick={() => navigate(`/promotion/${promotion.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay promociones activas en este momento</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                size="sm" 
                variant={!productCategory ? 'default' : 'outline'} 
                onClick={() => setProductCategory(null)}
              >
                Todos
              </Button>
              {allProductCategories.map(cat => (
                <Button 
                  key={cat} 
                  size="sm" 
                  variant={productCategory === cat ? 'default' : 'outline'} 
                  onClick={() => setProductCategory(cat)}
                >
                  {categoryEmojis[cat] ? categoryEmojis[cat] + ' ' : ''}{cat}
                </Button>
              ))}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900">Productos disponibles</h2>
            {filteredProducts.length > 0 ? (
              <div className="space-y-8">
                {/* Si no hay categoría seleccionada, mostrar por categorías */}
                {!productCategory ? (
                  allProductCategories.map(category => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        {categoryEmojis[category] ? categoryEmojis[category] + ' ' : ''}{category}
                        <span className="text-sm text-gray-500">({productsByCategory[category].length})</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {productsByCategory[category].map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  /* Si hay categoría seleccionada, mostrar productos destacados primero */
                  <div className="space-y-6">
                    {filteredFeatured.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          Productos destacados
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {filteredFeatured.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {filteredOthers.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Todos los productos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                          {filteredOthers.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay productos disponibles en este momento</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'menus' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              Menús del día
            </h2>
            {menusDia.length > 0 ? (
              <Carousel className="relative">
                <CarouselPrevious />
                <CarouselContent>
                  {menusDia.map(menu => (
                    <CarouselItem key={menu.id} className="basis-64 max-w-xs">
                      <MenuCard
                        menu={{
                          id: menu.id,
                          name: menu.name || menu.nombre_menu || 'Menú del día',
                          description: menu.description || menu.descripcion_menu || 'Sin descripción',
                          price: menu.price || menu.precio_menu
                        }}
                        showReserveButton={Boolean(menu.allow_reservations)}
                        onReserve={handleReserveMenu}
                        businessName={business.business_name}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay menús del día disponibles en este momento</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de reserva */}
      <ReservationModal
        isOpen={reservationModalOpen}
        onClose={() => {
          setReservationModalOpen(false);
          setSelectedMenu(null);
        }}
        onConfirm={handleConfirmReservation}
        menuName={selectedMenu?.name || ''}
        menuPrice={selectedMenu?.price || 0}
        businessName={business?.business_name || ''}
      />
    </div>
  );
};

export default BusinessDetailPage; 
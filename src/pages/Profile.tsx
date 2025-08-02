import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, CheckCircle, Gift, Bell, LogOut } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationsDialog from '@/components/client/NotificationsDialog';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete';
import ClientHeader from '@/components/client/ClientHeader';
import DesktopNavigation from '@/components/client/DesktopNavigation';
import MobileNavigation from '@/components/client/MobileNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowedBusinesses } from '@/contexts/FollowedBusinessesContext';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getClientSavingsData, ClientSavingsData } from '@/integrations/supabase/client-profile';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { userLocation } = useUserLocation();
  const { followedCount } = useFollowedBusinesses();
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const { notifications, newNotificationsCount } = useNotifications();
  const navigate = useNavigate();
  
  // Estado para datos personales
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para datos de ahorro
  const [savingsData, setSavingsData] = useState<ClientSavingsData>({
    totalSavings: 0,
    monthlySavings: 0,
    redemptions: []
  });
  const [savingsLoading, setSavingsLoading] = useState(true);

  // Cargar datos reales del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      
      try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id)
        .single();
          
      if (error) {
        setError('No se pudieron cargar tus datos.');
        setLoading(false);
        return;
      }
        
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
      setLoading(false);
      } catch (error) {
        setError('Error al cargar datos del usuario.');
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);

  // Cargar datos de ahorro y canjes
  useEffect(() => {
    const loadSavingsData = async () => {
    if (!user?.id) return;
      setSavingsLoading(true);
      
      try {
        const data = await getClientSavingsData(user.id);
        setSavingsData(data);
        setSavingsLoading(false);
      } catch (error) {
        console.error('Error cargando datos de ahorro:', error);
        setSavingsLoading(false);
      }
    };
    
    loadSavingsData();
  }, [user]);

  // Handlers para header
  const handleLocationChange = () => {};
  const handleNotificationsClick = () => {
    setNotificationsDialogOpen(true);
  };

  const handleNotificationClick = (notification: any) => {
    setNotificationsDialogOpen(false);
    navigate(`/promotion/${notification.id}`);
  };
  
  const handleFavoritesClick = () => {};
  const handleProfileClick = () => {};
  const handleSettingsClick = () => {};

  // Handler para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
          onLocationChange={handleLocationChange}
          onNotificationsClick={handleNotificationsClick}
          onFavoritesClick={handleFavoritesClick}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
        />
      </div>
      <div className="max-w-2xl mx-auto px-4 pb-20 lg:pb-8 space-y-6">
        {/* Resumen de ahorro mensual */}
        <Card className="bg-gradient-to-r from-fuddi-purple/90 to-purple-400 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Gift className="h-8 w-8" />
              {firstName ? `${firstName}, este mes has ahorrado:` : '¡Este mes ahorraste!'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">Gracias a tus promociones canjeadas</CardDescription>
          </CardHeader>
          <CardContent>
            {savingsLoading ? (
              <div className="text-center text-white/80 py-4">Cargando datos de ahorro...</div>
            ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-5xl font-bold drop-shadow-lg">
                  ${savingsData.monthlySavings.toLocaleString('es-CL')}
                </span>
                <span className="text-base font-medium bg-white/20 rounded-full px-4 py-1 mt-2 sm:mt-0">
                  Suma de todos tus descuentos este mes
                </span>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de canjes */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fuddi-purple">
              <CheckCircle className="h-5 w-5" />
              Historial de Canjes
            </CardTitle>
            <CardDescription>Promociones que has utilizado recientemente</CardDescription>
          </CardHeader>
          <CardContent>
            {savingsLoading ? (
              <div className="text-center text-gray-400 py-6">Cargando historial...</div>
            ) : (
            <div className="divide-y divide-gray-100">
                {savingsData.redemptions.length > 0 ? (
                  savingsData.redemptions.slice(0, 10).map(redemption => (
                    <div key={redemption.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
                  <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {redemption.promotion?.title || redemption.promotion?.name || 'Promoción'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {redemption.business?.business_name || 'Negocio'}
                        </span>
                  </div>
                  <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {new Date(redemption.redemption_date).toLocaleDateString('es-CL')}
                        </span>
                        <span className="text-green-600 font-bold">
                          -${redemption.redemption_amount.toLocaleString('es-CL')}
                        </span>
                  </div>
                </div>
                  ))
                ) : (
                <div className="text-center text-gray-400 py-6">Aún no has canjeado promociones</div>
              )}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Información Personal */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fuddi-purple">
              <MapPin className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>Tus datos de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {loading ? (
              <div className="text-center text-gray-400 py-6">Cargando datos...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full">
                    <Label htmlFor="email">Correo</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="address">Dirección</Label>
                    <AddressAutocompleteInput
                      value={address}
                      onChange={() => {}} // No permitir cambios
                      placeholder="Ej: Av. Providencia 1234, Santiago"
                      className="bg-gray-50"
                      disabled
                    />
                  </div>
                </div>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Botón de Cerrar Sesión */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fuddi-purple">
              <LogOut className="h-5 w-5" />
              Sesión
            </CardTitle>
            <CardDescription>Gestiona tu sesión de usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>

        {/* Notificaciones y recomendaciones futuras */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fuddi-purple">
              <Bell className="h-5 w-5" />
              Notificaciones y Recomendaciones
            </CardTitle>
            <CardDescription>Próximamente recibirás recomendaciones personalizadas según tu actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-400 text-center py-4">
              <span>¡Muy pronto podrás recibir alertas y sugerencias personalizadas!</span>
            </div>
          </CardContent>
        </Card>
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

export default ProfilePage; 
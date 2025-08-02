
import React, { useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { 
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Bell,
  Save,
  LogOut,
  Trash2,
  PaintBucket,
  History,
  Upload,
  X,
  Info,
  Lock,
  Palette,
  Activity,
  Utensils,
  Coffee,
  Sandwich,
  Truck,
  IceCream,
  Store as StoreIcon,
  ShoppingBag,
  Soup,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessById, updateBusiness, deleteBusinessAccount } from '@/integrations/supabase/businesses';
import { supabase } from '@/integrations/supabase/client';
import { AddressAutocompleteInput } from '@/components/ui/address-autocomplete';

const SettingsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // States for different sections
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    logo: null as string | null,
    openingTime: '',
    closingTime: '',
    locationLat: null as number | null,
    locationLng: null as number | null,
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    website: '',
    instagram: '',
    facebook: '',
  });
  

  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    menuReminders: true,
    weeklyReports: true,
    promotionExpiry: true,
  });
  
  const [visualization, setVisualization] = useState({
    primaryColor: '#6E59A5',
    showPublicly: true,
  });
  
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Business categories list
  const businessCategories = [
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'cafe', label: 'Cafetería' },
    { value: 'fast_food', label: 'Comida rápida' },
    { value: 'casino', label: 'Casino' },
    { value: 'food_truck', label: 'Food truck' },
    { value: 'ice_cream', label: 'Heladería' },
    { value: 'kiosk', label: 'Kiosko' },
    { value: 'store', label: 'Almacén' },
  ];

  // Obtener el value correspondiente al label guardado para el Select
  const getCategoryValue = (label: string) => {
    const found = businessCategories.find(cat => cat.label === label);
    return found ? found.value : '';
  };

  // Iconos para los rubros
  const categoryIcons: Record<string, JSX.Element> = {
    restaurant: <Utensils className="w-4 h-4 mr-2" />,
    cafe: <Coffee className="w-4 h-4 mr-2" />,
    fast_food: <Sandwich className="w-4 h-4 mr-2" />,
    casino: <Soup className="w-4 h-4 mr-2" />,
    food_truck: <Truck className="w-4 h-4 mr-2" />,
    ice_cream: <IceCream className="w-4 h-4 mr-2" />,
    kiosk: <ShoppingBag className="w-4 h-4 mr-2" />,
    store: <StoreIcon className="w-4 h-4 mr-2" />,
  };

  // Handlers for different form sections
  const handleBusinessInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };



  const handleCategoryChange = (value: string) => {
    // Buscar el label correspondiente al value seleccionado
    const selected = businessCategories.find(cat => cat.value === value);
    setBusinessInfo(prev => ({ ...prev, category: selected ? selected.label : value }));
  };
  
  const handleLogoClick = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };
  
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && user.type === 'business') {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/logo.${fileExt}`;
      // Subir a Supabase Storage
      const { data, error } = await supabase.storage.from('business-logos').upload(filePath, file, { upsert: true });
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error al subir logo',
          description: 'No se pudo subir el logo. Intenta nuevamente.',
        });
        return;
      }
      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage.from('business-logos').getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl || '';
      setPreviewLogo(publicUrl);
      setBusinessInfo(prev => ({ ...prev, logo: publicUrl }));
      // Guardar en la base de datos
      await updateBusiness(user.id, { logo_url: publicUrl });
      toast({
        title: 'Logo actualizado',
        description: 'El logo del negocio se ha actualizado correctamente.',
      });
    }
  };
  
  const handleLogoRemove = () => {
    setPreviewLogo(null);
    setBusinessInfo(prev => ({ ...prev, logo: null }));
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };
  
  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisualization(prev => ({ ...prev, primaryColor: e.target.value }));
  };
  
  const handleShowPubliclyChange = (checked: boolean) => {
    setVisualization(prev => ({ ...prev, showPublicly: checked }));
  };
  
  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('fuddi-user');
    // Navigate to login page
    window.location.href = '/login';
  };
  
  // Handler para actualizar dirección y coordenadas
  const handleAddressChange = (address: string) => {
    setBusinessInfo(prev => ({ ...prev, location: address }));
  };
  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setBusinessInfo(prev => ({ ...prev, location: address, locationLat: lat, locationLng: lng }));
  };
  
  // Form submission handlers
  const handleBusinessProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.type !== 'business') return;
    const updates = {
      business_name: businessInfo.name,
      description: businessInfo.description,
      category: businessInfo.category,
      address: businessInfo.location,
      location_lat: businessInfo.locationLat,
      location_lng: businessInfo.locationLng,
      logo_url: businessInfo.logo,
      opening_time: businessInfo.openingTime,
      closing_time: businessInfo.closingTime,
    };
    const updated = await updateBusiness(user.id, updates);
    if (updated) {
    toast({
      title: "Información actualizada",
      description: "Los datos del negocio se han guardado correctamente.",
    });
    } else {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron guardar los datos del negocio.",
      });
    }
  };

  const handleContactInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.type !== 'business') return;
    
    const updates = {
      phone: contactInfo.phone || null,
      website: contactInfo.website || null,
      instagram: contactInfo.instagram || null,
      facebook: contactInfo.facebook || null,
      // No incluimos email ya que no se puede modificar
    };
    
    const updated = await updateBusiness(user.id, updates);
    if (updated) {
    toast({
      title: "Contacto actualizado",
      description: "Los datos de contacto se han guardado correctamente.",
    });
    } else {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudieron guardar los datos de contacto.",
      });
    }
  };



  const handleVisualizationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Personalización guardada",
      description: "Los cambios visuales se han guardado correctamente.",
    });
  };

  const handleDeleteAccount = async () => {
    if (!user || user.type !== 'business') return;
    
    setShowDeleteDialog(false);
    
    try {
      const success = await deleteBusinessAccount(user.id);
      
      if (success) {
    toast({
      title: "Cuenta eliminada",
      description: "Tu cuenta ha sido eliminada permanentemente.",
    });
        
        // Limpiar datos locales
        localStorage.removeItem('fuddi-user');
        
        // Redirigir al login después de 2 segundos
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Error al eliminar cuenta",
          description: "No se pudo eliminar la cuenta. Intenta nuevamente.",
        });
      }
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      toast({
        variant: "destructive",
        title: "Error al eliminar cuenta",
        description: "Ocurrió un error inesperado. Intenta nuevamente.",
      });
    }
  };

  React.useEffect(() => {
    const fetchBusiness = async () => {
      if (!user || user.type !== 'business') return;
      const business = await getBusinessById(user.id);
      if (business) {
        setBusinessInfo({
          name: business.business_name || '',
          description: business.description || '',
          category: business.category || '',
          location: business.address || '',
          logo: business.logo_url || null,
          openingTime: business.opening_time || '',
          closingTime: business.closing_time || '',
          locationLat: business.location_lat || null,
          locationLng: business.location_lng || null,
        });
        setContactInfo({
          email: business.email || '',
          phone: business.phone || '',
          website: business.website || '',
          instagram: business.instagram || '',
          facebook: business.facebook || '',
        });
      }
    };
    fetchBusiness();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto px-2 sm:px-4 md:px-0">
        <div className="mb-2">
          <h1 className="text-3xl font-bold font-lobster text-fuddi-purple flex items-center gap-2">
            <Building className="w-8 h-8 text-fuddi-purple" /> Perfil del Negocio
          </h1>
          <p className="text-muted-foreground text-base mt-1">Gestiona la información y configuración de tu negocio</p>
        </div>
        <Tabs defaultValue="business-info" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-fuddi-purple/5 p-1 rounded-lg">
            <TabsTrigger value="business-info" className="text-base">Información</TabsTrigger>
            <TabsTrigger value="contact" className="text-base">Contacto</TabsTrigger>
            <TabsTrigger value="account-activity" className="text-base">Cuenta</TabsTrigger>
          </TabsList>
          {/* Business Information Tab */}
          <TabsContent value="business-info">
            <Card className="shadow-lg border-fuddi-purple/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Info size={22} className="text-fuddi-purple" /> Información General del Negocio
                </CardTitle>
                <CardDescription>
                  Datos básicos sobre tu negocio que se mostrarán a tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessProfileSubmit} className="space-y-6">
                  {/* Logo Upload y datos */}
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-full max-w-[180px] aspect-square flex-shrink-0">
                      {(previewLogo || businessInfo.logo) ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={previewLogo || businessInfo.logo || ''} 
                            alt="Logo del negocio" 
                            className="w-full h-full object-cover rounded-full border-4 border-fuddi-purple/30 shadow-md bg-white"
                          />
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={handleLogoRemove}
                            type="button"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-fuddi-purple/30 rounded-full bg-muted/30 cursor-pointer hover:bg-fuddi-purple/10 transition"
                          onClick={handleLogoClick}
                        >
                          <Upload className="h-10 w-10 text-fuddi-purple mb-2" />
                          <span className="text-sm text-fuddi-purple">Subir logo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={logoInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Imagen cuadrada recomendada (mínimo 200x200px)
                      </p>
                    </div>
                    <div className="w-full flex-1 space-y-4">
                      {/* Business Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre del negocio</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Ej: Restaurante El Buen Sabor"
                          value={businessInfo.name}
                          onChange={handleBusinessInfoChange}
                          className="text-lg"
                        />
                      </div>
                      {/* Business Category */}
                      <div className="space-y-2">
                        <Label htmlFor="category">Rubro</Label>
                        <Select value={getCategoryValue(businessInfo.category)} onValueChange={handleCategoryChange}>
                          <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder="Selecciona un rubro" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessCategories.map(category => (
                              <SelectItem 
                                key={category.value} 
                                value={category.value}
                              >
                                {categoryIcons[category.value]}{category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Business Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción corta</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Breve descripción sobre tu negocio"
                      value={businessInfo.description}
                      onChange={handleBusinessInfoChange}
                      rows={3}
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo 200 caracteres
                    </p>
                  </div>
                  {/* Business Address */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Dirección</Label>
                    <AddressAutocompleteInput
                      value={businessInfo.location}
                      onChange={handleAddressChange}
                      onSelectAddress={handleAddressSelect}
                      placeholder="Ej: Av. Providencia 1234, Santiago"
                    />
                  </div>
                  {/* Horario de apertura y cierre */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="space-y-2 w-full sm:w-1/2">
                      <Label htmlFor="openingTime">Horario de apertura</Label>
                      <Input
                        id="openingTime"
                        name="openingTime"
                        type="time"
                        value={businessInfo.openingTime}
                        onChange={handleBusinessInfoChange}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2 w-full sm:w-1/2">
                      <Label htmlFor="closingTime">Horario de cierre</Label>
                      <Input
                        id="closingTime"
                        name="closingTime"
                        type="time"
                        value={businessInfo.closingTime}
                        onChange={handleBusinessInfoChange}
                        className="text-base"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-fuddi-purple hover:bg-fuddi-purple-light w-full md:w-auto text-base py-3 mt-2">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <Card className="shadow-lg border-fuddi-purple/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Phone size={22} className="text-fuddi-purple" /> Datos de Contacto
                </CardTitle>
                <CardDescription>
                  Información de contacto para clientes y comunicaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactInfoSubmit} className="space-y-4">
                  {/* Contact Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail size={16} />
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="correo@tunegocio.com"
                      value={contactInfo.email}
                      onChange={handleContactInfoChange}
                      className="text-base"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      El correo electrónico no se puede modificar por razones de seguridad
                    </p>
                  </div>
                  {/* Contact Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone size={16} />
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+56 9 1234 5678"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange}
                      className="text-base"
                    />
                  </div>
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-3 text-fuddi-purple">Redes Sociales (opcional)</h4>
                    {/* Website */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="website" className="flex items-center gap-1">
                        <Globe size={16} />
                        Sitio Web
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        placeholder="https://tunegocio.com"
                        value={contactInfo.website}
                        onChange={handleContactInfoChange}
                        className="text-base"
                      />
                    </div>
                    {/* Instagram */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="instagram" className="flex items-center gap-1">
                        <Instagram size={16} />
                        Instagram
                      </Label>
                      <div className="flex items-center">
                        <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 text-muted-foreground">
                          @
                        </span>
                        <Input
                          id="instagram"
                          name="instagram"
                          placeholder="nombre_usuario"
                          value={contactInfo.instagram}
                          onChange={handleContactInfoChange}
                          className="rounded-l-none text-base"
                        />
                      </div>
                    </div>
                    {/* Facebook */}
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="flex items-center gap-1">
                        <Facebook size={16} />
                        Facebook
                      </Label>
                      <div className="flex items-center">
                        <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 text-muted-foreground">
                          facebook.com/
                        </span>
                        <Input
                          id="facebook"
                          name="facebook"
                          placeholder="tunegocio"
                          value={contactInfo.facebook}
                          onChange={handleContactInfoChange}
                          className="rounded-l-none text-base"
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="bg-fuddi-purple hover:bg-fuddi-purple-light w-full md:w-auto text-base py-3 mt-2">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Información de Contacto
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Account & Activity Tab */}
          <TabsContent value="account-activity">
            <Card className="shadow-lg border-fuddi-purple/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock size={22} className="text-fuddi-purple" /> Gestión de Cuenta
                </CardTitle>
                <CardDescription>
                  Gestiona tu cuenta y opciones de seguridad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* --- Sección de información de cuenta --- */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información de Cuenta</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Gestiona las acciones de tu cuenta desde esta sección.
                    </p>
                  </div>
                </div>
                
                {/* --- Sección de acciones de cuenta --- */}
                  <div className="pt-6 border-t border-border space-y-4">
                  <h3 className="text-lg font-medium">Acciones de Cuenta</h3>
                  
                    {/* Logout Button */}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  
                    {/* Delete Account Button */}
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar cuenta
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>¿Estás seguro?</DialogTitle>
                          <DialogDescription>
                            Esta acción es irreversible. Eliminarás permanentemente tu cuenta y todos los datos asociados a ella.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-destructive font-semibold">
                            ¡Atención! Al eliminar tu cuenta:
                          </p>
                          <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                            <li>Se perderán todos tus menús y promociones</li>
                            <li>No podrás recuperar tu historial de actividad</li>
                            <li>Los clientes ya no podrán ver tus servicios</li>
                          <li>Se eliminarán todos los códigos QR generados</li>
                          <li>No podrás recuperar tu cuenta una vez eliminada</li>
                          </ul>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowDeleteDialog(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                          >
                            Eliminar permanentemente
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Mail, Lock, Store, Clock, Info, MapPin, ArrowRight, ArrowLeft, CheckCircle, Navigation } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddressAutocompleteInput } from '../ui/address-autocomplete';
import { supabase } from '@/integrations/supabase/client';
import EmailVerificationNotice from './EmailVerificationNotice';

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

const totalSteps = 3;

const BusinessRegisterSteps = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Paso 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Paso 2
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('18:00');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  // Paso 3
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  // Éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  // Validaciones por paso
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'El correo electrónico es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo no válido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!businessName.trim()) newErrors.businessName = 'El nombre es requerido';
    if (!category) newErrors.category = 'El rubro es requerido';
    if (!openingTime) newErrors.openingTime = 'Horario requerido';
    if (!closingTime) newErrors.closingTime = 'Horario requerido';
    if (!description.trim()) newErrors.description = 'La descripción es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = 'La dirección es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleLogoRemove = () => {
    setLogo(null);
    setPreviewLogo(null);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          
          try {
            // Obtener la dirección usando Google Maps Geocoding API
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCVBiEHX1US1BOUJGvkW76juBpKPiSDPYE&language=es&region=CL`
            );
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted_address;
              setAddress(address);
      }
    } catch (error) {
            console.error('Error obteniendo dirección:', error);
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
    } else {
      console.error('Geolocalización no soportada');
    }
  };

  const handleRegisterBusiness = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      // 1. Verificar si el email ya existe
      const { data: existingBusiness, error: existingError } = await supabase
        .from('businesses')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (existingBusiness && !existingError) {
        setIsLoading(false);
        setErrors({ email: 'Este correo electrónico ya está registrado como negocio' });
        return;
      }
      // 2. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            type: 'business',
            business_name: businessName,
            category: selectedCategory ? selectedCategory.label : category,
            description,
            address,
            opening_time: openingTime,
            closing_time: closingTime,
            location_lat: location?.lat || null,
            location_lng: location?.lng || null,
          } 
        }
      });
      if (authError || !authData.user) {
        setIsLoading(false);
        setErrors({ email: authError?.message || 'Error al registrar usuario' });
        return;
      }
      // Si el usuario se registró con Google, authData.user.email_confirmed_at estará definido inmediatamente
      if (authData.user.email_confirmed_at) {
        // --- FLUJO GOOGLE: Guardar en tabla y login automático ---
        const userId = authData.user.id;
        // Subir logo si existe
        let logoUrl = '';
        if (logo) {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('business-logos')
            .upload(`logos/${userId}`, logo, { upsert: true });
          if (!uploadError) {
            logoUrl = supabase.storage.from('business-logos').getPublicUrl(`logos/${userId}`).data.publicUrl;
          }
        }
        // Guardar negocio en businesses
        const selectedCategory = businessCategories.find(cat => cat.value === category);
        const businessData = {
          id: userId,
          email,
          business_name: businessName,
          category: selectedCategory ? selectedCategory.label : category,
          description,
          address,
          opening_time: openingTime,
          closing_time: closingTime,
          logo_url: logoUrl,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
        };
        await supabase.from('businesses').insert(businessData);
        setIsLoading(false);
        setShowSuccess(true);
        return;
      }
      // --- FLUJO MANUAL: Mostrar pantalla de verificación ---
      // Guardar datos en localStorage para insertarlos tras el primer login
      const selectedCategory = businessCategories.find(cat => cat.value === category);
      
      // Convertir logo a base64 si existe para guardarlo en localStorage
      let logoBase64 = null;
      if (logo) {
        const reader = new FileReader();
        logoBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logo);
        });
      }
      
      localStorage.setItem('fuddi-business-registration', JSON.stringify({
        email,
        business_name: businessName,
        category: selectedCategory ? selectedCategory.label : category,
        description,
        address,
        opening_time: openingTime,
        closing_time: closingTime,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null,
        logo: logoBase64,
      }));
      setIsLoading(false);
      setShowVerification(true);
      return;
    } catch (error) {
      console.error('Error en registro:', error);
      setIsLoading(false);
      setErrors({ business: 'Error inesperado durante el registro' });
    }
  };

  // Envío de cada paso
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setIsLoading(true);
    if (step < totalSteps) {
      setTimeout(() => {
        setIsLoading(false);
        setStep(step + 1);
      }, 800);
    } else {
      await handleRegisterBusiness();
    }
  };
  const handleBack = () => {
    if (step === 1) navigate('/register/type');
    else setStep(step - 1);
  };

  // Barra de progreso
  const progress = (step / totalSteps) * 100;

  // Renderizado de pasos
  if (showVerification) {
    return <EmailVerificationNotice email={email} />;
  }

  if (showSuccess) {
    // Login automático y redirección inmediata
    const userData = {
      id: '1',
      name: businessName,
      email: email,
      type: 'business' as const,
      token: 'mock-jwt-token',
      businessInfo: {
        businessName,
        businessType: category,
        address,
        commune: '',
      }
    };
    login(userData);
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-2">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <Progress value={progress} className="h-2 bg-fuddi-purple/10" />
          <div className="flex justify-between text-xs mt-2">
            <span className={step === 1 ? 'font-bold text-fuddi-purple' : ''}>Paso 1: Cuenta</span>
            <span className={step === 2 ? 'font-bold text-fuddi-purple' : ''}>Paso 2: Negocio</span>
            <span className={step === 3 ? 'font-bold text-fuddi-purple' : ''}>Paso 3: Dirección</span>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {step === 1 && <Mail className="h-6 w-6 text-fuddi-purple" />} 
              {step === 2 && <Store className="h-6 w-6 text-fuddi-purple" />} 
              {step === 3 && <MapPin className="h-6 w-6 text-fuddi-purple" />} 
              {step === 1 && 'Cuenta de Negocio'}
              {step === 2 && 'Información del Negocio'}
              {step === 3 && 'Dirección del Negocio'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Crea tu cuenta de negocio con correo y contraseña.'}
              {step === 2 && 'Completa los datos de tu negocio.'}
              {step === 3 && '¿Dónde está ubicado tu negocio?'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNext} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nombre del Negocio</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      placeholder="Ej: Restaurante El Buen Sabor"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                    />
                    {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Rubro</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Selecciona un rubro" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2 w-1/2">
                      <Label htmlFor="openingTime">Horario de apertura</Label>
                      <Input
                        id="openingTime"
                        name="openingTime"
                        type="time"
                        value={openingTime}
                        onChange={e => setOpeningTime(e.target.value)}
                      />
                      {errors.openingTime && <p className="text-sm text-destructive">{errors.openingTime}</p>}
                    </div>
                    <div className="space-y-2 w-1/2">
                      <Label htmlFor="closingTime">Horario de cierre</Label>
                      <Input
                        id="closingTime"
                        name="closingTime"
                        type="time"
                        value={closingTime}
                        onChange={e => setClosingTime(e.target.value)}
                      />
                      {errors.closingTime && <p className="text-sm text-destructive">{errors.closingTime}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción corta</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Breve descripción sobre tu negocio"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo del Negocio</Label>
                    <div className="flex items-center gap-4">
                      {previewLogo ? (
                        <div className="relative w-20 h-20">
                          <img src={previewLogo} alt="Logo" className="w-20 h-20 object-cover rounded-full border-2 border-fuddi-purple" />
                          <Button type="button" size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={handleLogoRemove}>
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-fuddi-purple/30 rounded-full bg-muted/30 cursor-pointer hover:bg-fuddi-purple/10 transition">
                          <Upload className="h-6 w-6 text-fuddi-purple mb-1" />
                          <span className="text-xs text-fuddi-purple">Subir</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="space-y-1">
                    <span className="text-xs text-fuddi-purple font-medium">Agrega la ubicación de tu negocio para que los clientes te encuentren fácilmente</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección del Negocio</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                    <AddressAutocompleteInput
                      value={address}
                      onChange={setAddress}
                          onSelectLocation={(lat, lng) => {
                            console.log('Ubicación seleccionada:', { lat, lng });
                            setLocation({ lat, lng });
                          }}
                          onSelectAddress={(selectedAddress, lat, lng) => {
                            console.log('Dirección completa seleccionada:', { selectedAddress, lat, lng });
                            setAddress(selectedAddress);
                            setLocation({ lat, lng });
                          }}
                      placeholder="Ej: Av. Providencia 1234, Santiago"
                    />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleUseCurrentLocation}
                        className="shrink-0"
                        title="Usar ubicación actual"
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                    {location && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        ✅ Ubicación capturada: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </div>
                    )}
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>
                </>
              )}
              <div className="flex justify-between mt-6">
                <Button type="button" variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {step === 1 ? 'Volver' : 'Anterior'}
                </Button>
                <Button type="submit" className="bg-fuddi-purple hover:bg-fuddi-purple-light" disabled={isLoading}>
                  {isLoading ? 'Procesando...' : (
                    <>
                      {step < totalSteps ? 'Siguiente' : 'Finalizar'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessRegisterSteps; 
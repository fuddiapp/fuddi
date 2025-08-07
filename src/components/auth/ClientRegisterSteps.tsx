import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Lock, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RegistrationSuccess from './RegistrationSuccess';
import { AddressAutocompleteInput } from '../ui/address-autocomplete';
import { supabase } from '@/integrations/supabase/client';
import EmailVerificationNotice from './EmailVerificationNotice';

interface Step1Data {
  email: string;
  password: string;
  confirmPassword: string;
}

const ClientRegisterSteps = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [address, setAddress] = useState('');
  const [addressMode, setAddressMode] = useState<'manual' | 'geo'>('manual');
  const [geoLoading, setGeoLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const handleStep1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStep1Data(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!step1Data.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(step1Data.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    if (!step1Data.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (step1Data.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (step1Data.password !== step1Data.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!address.trim()) {
      newErrors.address = 'La dirección es requerida para personalizar tu experiencia';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(2);
    }, 1000);
  };





  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsLoading(true);
    
    try {
      // Crear usuario en Auth
      const { data, error } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: { 
          data: { 
            type: 'client',
            firstName: firstName,
            lastName: lastName,
            address: address
          } 
        }
      });
      
      if (error || !data.user) {
        setErrors({ email: 'Error al crear usuario' });
        setIsLoading(false);
        return;
      }
      
      // Guardar datos en localStorage como respaldo
      localStorage.setItem('fuddi-client-registration', JSON.stringify({
        email: step1Data.email,
        firstName,
        lastName,
        address
      }));
      
      // Mostrar pantalla de verificación de correo
      setIsLoading(false);
      setShowVerification(true);
    } catch (error) {
      console.error('Error en handleStep2Submit:', error);
      setErrors({ address: 'Error inesperado al completar el registro' });
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/register/type');
    } else {
      setCurrentStep(1);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-fuddi-purple" />
          Paso 1: Credenciales
        </CardTitle>
        <CardDescription>
          Crea tu cuenta con correo y contraseña o usa Google para un registro más rápido.
        </CardDescription>
      </CardHeader>

        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={step1Data.email}
                onChange={handleStep1Change}
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={step1Data.password}
                onChange={handleStep1Change}
                className="pl-10"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={step1Data.confirmPassword}
                onChange={handleStep1Change}
                className="pl-10"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-fuddi-purple hover:bg-fuddi-purple-light"
            disabled={isLoading}
          >
            {isLoading ? 'Validando...' : (
              <>
                Continuar al Paso 2
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-fuddi-purple" />
          Paso 2: Información Personal
        </CardTitle>
        <CardDescription>
          Cuéntanos sobre ti para mostrarte las mejores ofertas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                id="firstName"
                name="firstName"
                placeholder="Tu nombre"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="pl-10"
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                id="lastName"
                name="lastName"
                placeholder="Tu apellido"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="pl-10"
              />
            </div>
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName}</p>
            )}
          </div>
          <div className="space-y-1">
            <span className="text-xs text-fuddi-purple font-medium">Agrega tu dirección para descubrir promociones y menús cerca de ti. ¡Así podrás aprovechar las mejores ofertas en tu zona!</span>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="address">Dirección</Label>
            <AddressAutocompleteInput
              value={address}
              onChange={setAddress}
              placeholder="Ej: Av. Providencia 1234, Santiago"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full bg-fuddi-purple hover:bg-fuddi-purple-light"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completar Registro
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  if (showSuccess) {
    return (
      <RegistrationSuccess 
        username={firstName + ' ' + lastName}
        location={address}
      />
    );
  }

  if (showVerification) {
    return <EmailVerificationNotice email={step1Data.email} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Botón volver */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-lobster text-fuddi-purple mb-2">Fuddi</h1>
        <p className="text-gray-600">Únete como cliente y descubre las mejores ofertas</p>
      </div>
      {/* Indicador de progreso */}
      <div className="mb-6 flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-fuddi-purple' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 1 ? 'bg-fuddi-purple border-fuddi-purple text-white' : 'border-gray-300'
          }`}>
            {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
          </div>
          <span className="text-sm font-medium hidden sm:inline">Credenciales</span>
        </div>
        <div className={`w-8 sm:w-12 h-0.5 ${currentStep >= 2 ? 'bg-fuddi-purple' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-fuddi-purple' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep >= 2 ? 'bg-fuddi-purple border-fuddi-purple text-white' : 'border-gray-300'
          }`}>
            {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
          </div>
          <span className="text-sm font-medium hidden sm:inline">Información</span>
        </div>
      </div>
      {/* Formulario del paso actual */}
      {currentStep === 1 ? renderStep1() : renderStep2()}
      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 Fuddi. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default ClientRegisterSteps; 
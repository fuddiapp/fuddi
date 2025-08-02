
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BusinessInfoStep from '@/components/auth/BusinessInfoStep';
import { useAuth } from '@/contexts/AuthContext';

interface LocationState {
  basicInfo?: {
    businessName: string;
    email: string;
    password: string;
  };
}

const BusinessInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [basicInfo, setBasicInfo] = useState<LocationState['basicInfo'] | null>(null);

  useEffect(() => {
    const state = location.state as LocationState;
    if (!state?.basicInfo) {
      // Si no hay información básica, redirigir al registro
      navigate('/register');
      return;
    }
    setBasicInfo(state.basicInfo);
  }, [location.state, navigate]);

  const handleComplete = async (businessInfo: any) => {
    if (!basicInfo) return;

    // Combinar información básica con información del negocio
    const completeRegistrationData = {
      ...basicInfo,
      ...businessInfo,
    };

    // Crear usuario de negocio
    const userData = {
      id: '1',
      name: basicInfo.businessName,
      email: basicInfo.email,
      type: 'business' as const,
      token: 'mock-jwt-token',
      businessInfo: {
        businessName: basicInfo.businessName,
        businessType: businessInfo.businessType,
        address: businessInfo.address,
        commune: businessInfo.commune,
      }
    };

    login(userData);

    // Redirigir al dashboard
    navigate('/dashboard');
  };

  if (!basicInfo) {
    return null; // o un loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-fuddi-purple mb-2">Central de Promociones Fuddi</h1>
        <p className="text-gray-600">Paso 2 de 2: Información del negocio</p>
      </div>
      
      <BusinessInfoStep 
        onComplete={handleComplete}
        businessName={basicInfo.businessName}
      />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 Fuddi. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default BusinessInfoPage;

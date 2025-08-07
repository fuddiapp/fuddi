import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Esperar a que el contexto de autenticación procese la sesión
      if (!isLoading) {
        if (user) {
          // Verificar si el usuario viene de un registro con Google
          const urlParams = new URLSearchParams(location.search);
          const fromRegistration = urlParams.get('from_registration');
          
          if (fromRegistration === 'client') {
            // Si viene del registro de cliente, redirigir de vuelta al formulario
            navigate('/register/client');
          } else if (fromRegistration === 'business') {
            // Si viene del registro de negocio, redirigir de vuelta al formulario
            navigate('/register/business');
          } else {
            // Flujo normal de autenticación
            if (user.type === 'business') {
              navigate('/dashboard');
            } else if (user.type === 'client') {
              // Verificar si el cliente tiene datos completos
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user?.user_metadata?.address) {
                navigate('/home');
              } else {
                // Si no tiene datos completos, redirigir al registro
                navigate('/register/type');
              }
            } else {
              navigate('/register/type');
            }
          }
        } else {
          // No hay usuario, redirigir al login
          navigate('/login');
        }
      }
    };
    
    handleCallback();
  }, [user, isLoading, navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
        <p className="text-gray-600">Procesando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 
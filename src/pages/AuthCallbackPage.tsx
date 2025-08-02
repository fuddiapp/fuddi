import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Esperar a que el contexto de autenticación procese la sesión
    if (!isLoading) {
      if (user) {
        // El usuario ya está autenticado, redirigir según su tipo
        if (user.type === 'business') {
          navigate('/dashboard');
        } else if (user.type === 'client') {
          navigate('/home');
        } else {
          navigate('/register/type');
        }
      } else {
        // No hay usuario, redirigir al login
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

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
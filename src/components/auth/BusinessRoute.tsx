import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessRouteProps {
  children: React.ReactNode;
}

const BusinessRoute: React.FC<BusinessRouteProps> = ({ children }) => {
  const { user, isLoading, isBusiness, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/login" replace />;
  }

  if (!isBusiness) {
    // Si es cliente, redirigir a la página de clientes (que crearemos después)
    return <Navigate to="/client" replace />;
  }

  // Si es negocio, mostrar el contenido
  return <>{children}</>;
};

export default BusinessRoute; 
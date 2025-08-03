import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLocation } from '@/contexts/UserLocationContext';

const ClientHomePage: React.FC = () => {
  console.log('🚀 ClientHomePage: Componente iniciando...');
  
  const { user, isLoading: authLoading } = useAuth();
  const { userLocation } = useUserLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 ClientHomePage: Estado inicial:', {
    user: user?.id,
    userExists: !!user,
    userLocation: userLocation?.address,
    loading,
    authLoading
  });

  // Efecto simple para verificar el estado del usuario
  useEffect(() => {
    console.log('👤 ClientHomePage: useEffect [user] ejecutado');
    console.log('👤 ClientHomePage: Usuario actual:', {
      id: user?.id,
      email: user?.email,
      type: user?.type
    });
  }, [user]);

  console.log('🎨 ClientHomePage: Renderizando componente...');
  console.log('📊 ClientHomePage: Estado actual:', {
    loading,
    error,
    authLoading,
    hasUserLocation: !!userLocation
  });

  // Verificar si el usuario está cargando (AuthContext puede estar inicializando)
  console.log('🔍 ClientHomePage: Verificando usuario antes del render:', {
    user: user,
    userExists: !!user,
    userType: user?.type,
    authLoading: authLoading
  });
  
  if (authLoading || !user) {
    console.log('🚫 ClientHomePage: AuthContext cargando o no hay usuario, mostrando mensaje de carga...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Inicializando sesión...' : 'Cargando usuario...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Bienvenido a Fuddi!
          </h1>
          <p className="text-gray-600">
            Usuario: {user?.email || 'No identificado'}
          </p>
          <p className="text-gray-600">
            Ubicación: {userLocation?.address || 'No seleccionada'}
          </p>
        </div>

        {/* Estado de carga */}
        {authLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto"></div>
            <p className="mt-4 text-gray-600">Inicializando sesión...</p>
          </div>
        )}

        {/* Contenido principal */}
        {!authLoading && user && (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">✅ Sesión iniciada correctamente</h2>
              <p className="text-gray-600 mb-4">
                El AuthContext ha terminado de cargar y el usuario está autenticado.
              </p>
              <div className="text-left bg-gray-50 p-4 rounded">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Tipo:</strong> {user.type}</p>
                <p><strong>Auth Loading:</strong> {authLoading ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botón de debug */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              console.log('🖱️ ClientHomePage: Botón debug clickeado');
              console.log('📊 ClientHomePage: Estado completo:', {
                user,
                userLocation,
                authLoading
              });
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientHomePage; 
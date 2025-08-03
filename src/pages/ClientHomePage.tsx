import React from 'react';

const ClientHomePage: React.FC = () => {
  console.log('🚀 ClientHomePage: Componente iniciando...');
  
  // TEMPORAL: No usar ningún Context para evitar bucles infinitos
  const user = null;
  const authLoading = false;
  const userLocation = null;

  console.log('🔍 ClientHomePage: Estado inicial - Versión estática');
  console.log('🎨 ClientHomePage: Renderizando componente...');
  console.log('📊 ClientHomePage: Estado actual - Versión estática');
  
  // TEMPORAL: Mostrar siempre contenido estático
  console.log('🚫 ClientHomePage: Mostrando versión estática...');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Versión de Prueba - ClientHomePage
          </h1>
          <p className="text-gray-600">
            Esta es una versión estática para diagnosticar el problema de re-renderizado.
          </p>
        </div>

        {/* Contenido estático */}
        <div className="text-center py-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Diagnóstico en Progreso</h2>
            <p className="text-gray-600 mb-4">
              Si ves este mensaje sin que se recargue constantemente, el problema está en los Context Providers.
            </p>
            <div className="text-left bg-gray-50 p-4 rounded">
              <p><strong>Estado:</strong> Versión estática</p>
              <p><strong>Context:</strong> Deshabilitado</p>
              <p><strong>Re-renderizado:</strong> No debería ocurrir</p>
            </div>
          </div>
        </div>

        {/* Botón de debug */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              console.log('🖱️ ClientHomePage: Botón debug clickeado - Versión estática');
              console.log('📊 ClientHomePage: Estado estático');
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
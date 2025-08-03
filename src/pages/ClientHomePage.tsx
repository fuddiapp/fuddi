import React from 'react';

const ClientHomePage: React.FC = () => {
  console.log('🚀 ClientHomePage: Componente iniciando...');
  
  // Log inmediato sin hooks
  console.log('📝 ClientHomePage: Log inmediato - componente cargado');
  
  // Log con setTimeout para verificar si el componente se mantiene
  React.useEffect(() => {
    console.log('⏰ ClientHomePage: useEffect ejecutado');
    
    const timer = setTimeout(() => {
      console.log('⏰ ClientHomePage: Timer ejecutado después de 2 segundos');
    }, 2000);
    
    return () => {
      console.log('🧹 ClientHomePage: Componente desmontándose');
      clearTimeout(timer);
    };
  }, []);
  
  console.log('🎨 ClientHomePage: Renderizando componente...');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-fuddi-purple mb-4">ClientHomePage</h1>
        <p className="text-gray-600 mb-4">Página de inicio para clientes</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Estado del componente:</h2>
          <p className="text-green-600">✅ Componente cargado correctamente</p>
          <p className="text-blue-600">📝 Revisa la consola para ver los logs</p>
        </div>
        <button 
          onClick={() => {
            console.log('🖱️ ClientHomePage: Botón clickeado');
            alert('Botón clickeado - revisa la consola');
          }}
          className="mt-4 bg-fuddi-purple text-white px-6 py-2 rounded-lg hover:bg-fuddi-purple-light transition-colors"
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default ClientHomePage; 
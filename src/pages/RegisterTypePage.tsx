import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Store, ArrowLeft } from 'lucide-react';

const RegisterTypePage = () => {
  const navigate = useNavigate();

  const handleClientRegister = () => {
    navigate('/register/client');
  };

  const handleBusinessRegister = () => {
    navigate('/register/business');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <h1 className="text-5xl font-lobster text-fuddi-purple mb-2">Fuddi</h1>
        <p className="text-gray-600 text-lg">¿Cómo quieres unirte a Fuddi?</p>
      </div>

      {/* Opciones de registro */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Opción Cliente */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-fuddi-purple bg-white"
            onClick={handleClientRegister}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Clientes</h2>
                <p className="text-gray-600 leading-relaxed">
                  Descubre las mejores ofertas de comida a tu alrededor. 
                  Encuentra promociones exclusivas, menús del día y conecta 
                  con los mejores restaurantes de tu zona.
                </p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Ofertas exclusivas</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Menús del día</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Reseñas y calificaciones</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opción Negocio */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-fuddi-purple bg-white"
            onClick={handleBusinessRegister}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-fuddi-purple to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Store className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Negocios</h2>
                <p className="text-gray-600 leading-relaxed">
                  Publica promociones, menús diarios y conecta con tus clientes. 
                  Gestiona tu negocio de manera eficiente y aumenta tus ventas 
                  con nuestra plataforma integral.
                </p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-fuddi-purple rounded-full"></div>
                  <span>Gestión de promociones</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-fuddi-purple rounded-full"></div>
                  <span>Menús diarios</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-fuddi-purple rounded-full"></div>
                  <span>Analytics y reportes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Button 
              variant="link" 
              className="p-0 text-fuddi-purple hover:text-fuddi-purple-light" 
              onClick={() => navigate('/login')}
            >
              Inicia Sesión
            </Button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>© 2025 Fuddi. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default RegisterTypePage; 
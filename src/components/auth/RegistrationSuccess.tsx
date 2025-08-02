import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Star } from 'lucide-react';

interface RegistrationSuccessProps {
  username: string;
  location: string;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ username, location }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect después de 5 segundos
    const timer = setTimeout(() => {
      navigate('/client');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ¡Bienvenido a Fuddi!
          </CardTitle>
          <CardDescription className="text-lg">
            Tu cuenta ha sido creada exitosamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Hola <strong>{username}</strong></span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>Ubicación: <strong>{location}</strong></span>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <p>🎉 Ya puedes explorar las mejores ofertas cerca de ti</p>
            <p>📍 Encontrarás promociones personalizadas según tu ubicación</p>
            <p>⚡ Serás redirigido automáticamente en unos segundos</p>
          </div>

          <Button 
            onClick={() => navigate('/client')}
            className="w-full bg-fuddi-purple hover:bg-fuddi-purple-light"
          >
            Ir a Explorar Ofertas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationSuccess; 
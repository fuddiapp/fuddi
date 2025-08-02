import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Settings, 
  Shield, 
  Wifi, 
  Smartphone, 
  Monitor,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface GeolocationHelpProps {
  className?: string;
}

const GeolocationHelp: React.FC<GeolocationHelpProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const browserSteps = [
    {
      browser: 'Chrome',
      steps: [
        'Haz clic en el ícono de ubicación (📍) en la barra de direcciones',
        'Selecciona "Permitir"',
        'O ve a Configuración > Privacidad y seguridad > Configuración del sitio > Ubicación'
      ]
    },
    {
      browser: 'Firefox',
      steps: [
        'Haz clic en el ícono de ubicación en la barra de direcciones',
        'Selecciona "Permitir acceso"',
        'O ve a Configuración > Privacidad y seguridad > Permisos > Ubicación'
      ]
    },
    {
      browser: 'Safari',
      steps: [
        'Haz clic en "Permitir" cuando aparezca el diálogo',
        'O ve a Preferencias > Sitios web > Ubicación'
      ]
    },
    {
      browser: 'Edge',
      steps: [
        'Haz clic en el ícono de ubicación en la barra de direcciones',
        'Selecciona "Permitir"',
        'O ve a Configuración > Cookies y permisos del sitio > Ubicación'
      ]
    }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-fuddi-purple" />
          ¿Problemas con la ubicación?
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto p-1 h-6 w-6"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              La geolocalización requiere permisos del navegador y funciona mejor en dispositivos móviles con GPS.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Solución rápida:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Monitor className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">En Desktop</p>
                  <p className="text-xs text-gray-600">Busca el ícono de ubicación en la barra de direcciones</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Smartphone className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">En Móvil</p>
                  <p className="text-xs text-gray-600">Acepta el permiso cuando aparezca el diálogo</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Configuración por navegador:</h4>
            <div className="space-y-2">
              {browserSteps.map((browser) => (
                <details key={browser.browser} className="group">
                  <summary className="cursor-pointer text-sm font-medium hover:text-fuddi-purple">
                    {browser.browser}
                  </summary>
                  <ul className="mt-2 ml-4 space-y-1">
                    {browser.steps.map((step, index) => (
                      <li key={index} className="text-xs text-gray-600">
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Verificaciones adicionales:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Wifi className="h-3 w-3 text-gray-400" />
                <span>Verifica que tengas conexión a internet</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Settings className="h-3 w-3 text-gray-400" />
                <span>Asegúrate de que la ubicación esté activada en tu sistema</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3 w-3 text-gray-400" />
                <span>El sitio debe estar en HTTPS (excepto localhost)</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Consejo:</p>
            <p>
              Si continúas teniendo problemas, puedes usar la búsqueda manual de direcciones 
              escribiendo en el campo de texto. El autocompletado funcionará igual de bien.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default GeolocationHelp; 
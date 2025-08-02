import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Locate, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserLocation } from '@/contexts/UserLocationContext';
import { useToast } from '@/hooks/use-toast';
import { useGoogleMapsAutocomplete } from '@/hooks/use-google-maps-autocomplete';

interface LocationSelectorProps {
  trigger?: React.ReactNode;
  className?: string;
}

// Componente de autocompletado específico para el header
const HeaderAddressInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSelectAddress: (address: string, lat: number, lng: number, placeId?: string) => void;
  placeholder?: string;
  onAutocompleteOpen?: (isOpen: boolean) => void;
}> = ({ value, onChange, onSelectAddress, placeholder, onAutocompleteOpen }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { initializeAutocomplete, handleInputFocus, isLoaded } = useGoogleMapsAutocomplete({
    onSelectAddress: (address, lat, lng, placeId) => {
      onChange(address);
      onSelectAddress(address, lat, lng, placeId);
    }
  });

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      initializeAutocomplete(inputRef.current);
    }
  }, [isLoaded, initializeAutocomplete]);

  // Detectar cuando el autocompletado está abierto
  useEffect(() => {
    const checkAutocompleteOpen = () => {
      const pacContainer = document.querySelector('.pac-container');
      const isOpen = pacContainer && pacContainer.children.length > 0;
      onAutocompleteOpen?.(isOpen);
    };

    // Verificar cada 100ms si el autocompletado está abierto
    const interval = setInterval(checkAutocompleteOpen, 100);
    
    return () => clearInterval(interval);
  }, [onAutocompleteOpen]);

  return (
    <div className="relative" style={{ zIndex: 99999 }}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
        <MapPin className="h-4 w-4" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => inputRef.current && handleInputFocus(inputRef.current)}
        placeholder={placeholder || 'Buscar dirección...'}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuddi-purple focus:border-transparent relative z-10"
        autoComplete="off"
        spellCheck="false"
        style={{ position: 'relative', zIndex: 10 }}
      />

    </div>
  );
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  trigger,
  className 
}) => {
  const { userLocation, updateLocationFromAddress, getCurrentLocation, isLoading } = useUserLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState(userLocation?.address || '');
  const [geoLoading, setGeoLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
  } | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  // Limpiar estado cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      setTempAddress(userLocation?.address || '');
      setSelectedLocation(null);
      
      // Asegurar que el autocompletado funcione correctamente cuando se abre el diálogo
      setTimeout(() => {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer) {
          (pacContainer as HTMLElement).style.zIndex = '99999';
          (pacContainer as HTMLElement).style.pointerEvents = 'auto';
        }
      }, 100);
    }
  }, [isOpen, userLocation?.address]);

  // Escuchar cambios en la ubicación del usuario
  useEffect(() => {
    if (userLocation?.address) {
      setTempAddress(userLocation.address);
    }
  }, [userLocation?.address]);

  const handleLocationSelect = async (address: string, lat: number, lng: number, placeId?: string) => {
    try {
      // Retrasar la actualización para evitar que el diálogo se cierre
      setTimeout(() => {
        // Solo actualizar el estado temporal, no cerrar el diálogo
        setTempAddress(address);
        
        // Guardar las coordenadas temporalmente para usar en el botón "Guardar"
        setSelectedLocation({ address, lat, lng, placeId });
        
        toast({
          title: "Dirección seleccionada",
          description: "Dirección seleccionada. Haz clic en 'Guardar' para confirmar.",
        });
      }, 100);
    } catch (error) {
      console.error('Error al seleccionar ubicación:', error);
      toast({
        title: "Error",
        description: "No se pudo seleccionar la ubicación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleGetCurrentLocation = async () => {
    setGeoLoading(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setTempAddress(location.address);
        await updateLocationFromAddress(location.address, location.latitude, location.longitude, location.placeId);
        setIsOpen(false);
        toast({
          title: "Ubicación actualizada",
          description: "Tu ubicación se ha actualizado correctamente.",
        });
      }
    } catch (error) {
      console.error('Error obteniendo ubicación actual:', error);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSaveManual = async () => {
    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Por favor selecciona una dirección del listado de sugerencias.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateLocationFromAddress(
        selectedLocation.address, 
        selectedLocation.lat, 
        selectedLocation.lng, 
        selectedLocation.placeId
      );
      setIsOpen(false);
      setSelectedLocation(null);
      toast({
        title: "Ubicación actualizada",
        description: "Tu ubicación se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error al actualizar ubicación:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu ubicación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const defaultTrigger = (
    <div className={`flex items-center gap-2 text-gray-600 hover:text-fuddi-purple transition-colors cursor-pointer ${className}`}>
      <MapPin className="h-4 w-4" />
      <span className="text-sm font-medium truncate max-w-32">
        {userLocation?.address || 'Seleccionar ubicación'}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-fuddi-purple hover:bg-fuddi-purple/5 text-xs h-6 px-2"
      >
        Cambiar
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // No permitir cerrar si el autocompletado está abierto
      if (!open && isAutocompleteOpen) {
        return;
      }
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md overflow-visible"
        onPointerDownOutside={(e) => {
          // Prevenir que se cierre cuando se hace clic en el autocompletado
          const target = e.target as HTMLElement;
          if (target.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevenir que se cierre cuando se interactúa con el autocompletado
          const target = e.target as HTMLElement;
          if (target.closest('.pac-container')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-fuddi-purple" />
            Cambiar ubicación
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Actualiza tu ubicación para encontrar promociones y negocios más cerca de ti.
          </div>

          {/* Campo de búsqueda con autocompletado */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">
              Buscar dirección
            </label>
            <div 
              className="relative" 
              style={{ zIndex: 99999 }}
              onMouseDown={(e) => {
                // Prevenir que el diálogo se cierre cuando se interactúa con el autocompletado
                const target = e.target as HTMLElement;
                if (target.closest('.pac-container')) {
                  e.stopPropagation();
                }
              }}
              onClick={(e) => {
                // Prevenir que el diálogo se cierre cuando se hace clic en el autocompletado
                const target = e.target as HTMLElement;
                if (target.closest('.pac-container')) {
                  e.stopPropagation();
                }
              }}
            >
              <HeaderAddressInput
                value={tempAddress}
                onChange={setTempAddress}
                onSelectAddress={handleLocationSelect}
                placeholder="Ej: Av. Providencia 1234, Santiago"
                onAutocompleteOpen={setIsAutocompleteOpen}
              />
            </div>
            {selectedLocation && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Dirección seleccionada: {selectedLocation.address}</span>
                </div>
              </div>
            )}
          </div>

          {/* Botón de ubicación actual */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              O usar ubicación actual
            </label>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGetCurrentLocation}
              disabled={geoLoading || isLoading}
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Locate className="h-4 w-4" />
              )}
              {geoLoading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
            </Button>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Search className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Consejo:</p>
                <p>Escribe el nombre de tu calle o barrio para obtener sugerencias precisas.</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveManual}
              disabled={!selectedLocation || isLoading}
              className="flex-1 bg-fuddi-purple hover:bg-fuddi-purple-light"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
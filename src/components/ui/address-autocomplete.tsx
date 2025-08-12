import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Locate, Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { Button } from '@/components/ui/button';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectLocation?: (lat: number, lng: number) => void;
  onSelectAddress?: (address: string, lat: number, lng: number, placeId?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
  showLocationButton?: boolean;
  onGetCurrentLocation?: () => Promise<void>;
  geoLoading?: boolean;
}

export const AddressAutocompleteInput: React.FC<AddressAutocompleteProps> = ({ 
  value, 
  onChange, 
  onSelectLocation, 
  onSelectAddress,
  placeholder, 
  className,
  disabled,
  showIcon = true,
  variant = 'default',
  showLocationButton = false,
  onGetCurrentLocation,
  geoLoading = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const { isLoaded } = useGoogleMaps();

  // Función para asegurar que el contenedor del autocompletado tenga el z-index correcto
  const ensureAutocompleteZIndex = () => {
    setTimeout(() => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        (pacContainer as HTMLElement).style.zIndex = '99999';
        (pacContainer as HTMLElement).style.pointerEvents = 'auto';
        (pacContainer as HTMLElement).style.position = 'fixed';
        
        // Prevenir que los eventos se propaguen
        const preventPropagation = (e: Event) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        };
        
        // Remover listeners anteriores
        pacContainer.removeEventListener('click', preventPropagation, true);
        pacContainer.removeEventListener('mousedown', preventPropagation, true);
        pacContainer.removeEventListener('mouseup', preventPropagation, true);
        pacContainer.removeEventListener('pointerdown', preventPropagation, true);
        pacContainer.removeEventListener('pointerup', preventPropagation, true);
        
        // Agregar listeners nuevos
        pacContainer.addEventListener('click', preventPropagation, true);
        pacContainer.addEventListener('mousedown', preventPropagation, true);
        pacContainer.addEventListener('mouseup', preventPropagation, true);
        pacContainer.addEventListener('pointerdown', preventPropagation, true);
        pacContainer.addEventListener('pointerup', preventPropagation, true);
      }
    }, 100);
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current) {
      return;
    }

    // Verificar que Google Maps esté disponible
    if (!window.google?.maps?.places?.Autocomplete) {
      return;
    }

    try {
      // Limpiar autocomplete anterior si existe
      if (autocompleteRef.current) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (error) {
          // Silenciar errores de limpieza
        }
      }

      // Crear el objeto Autocomplete con configuración mejorada
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'cl' },
        fields: ['formatted_address', 'geometry', 'place_id', 'address_components', 'name'],
        types: ['geocode'],
        language: 'es',
        strictBounds: false,
      });

      // Escuchar el evento de selección
      autocompleteRef.current.addListener('place_changed', () => {
        try {
        const place = autocompleteRef.current.getPlace();
        
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || value;
            const placeId = place.place_id;

          // Actualizar el valor del input
          onChange(address);

          // Llamar a los callbacks
          if (onSelectLocation) {
            onSelectLocation(lat, lng);
          }

          if (onSelectAddress) {
              onSelectAddress(address, lat, lng, placeId);
            }
          }
        } catch (error) {
          // Silenciar errores de procesamiento
        }
      });

      // Asegurar z-index correcto y prevenir propagación de eventos
      ensureAutocompleteZIndex();

      // Autocomplete inicializado correctamente
    } catch (error) {
      // Silenciar errores
    }
  };

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      initializeAutocomplete();
    }
  }, [isLoaded]);

  // Reinicializar cuando el componente se monta
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoaded && inputRef.current && !autocompleteRef.current) {
        initializeAutocomplete();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Aplicar estilos CSS para el autocompletado
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        z-index: 99999 !important;
        position: fixed !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        pointer-events: auto !important;
        background-color: white !important;
        border: 1px solid #e5e7eb !important;
      }
      .pac-item {
        padding: 8px 12px !important;
        cursor: pointer !important;
        border-bottom: 1px solid #f3f4f6 !important;
        pointer-events: auto !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      .pac-item:hover {
        background-color: #f9fafb !important;
      }
      .pac-item-selected {
        background-color: #e5e7eb !important;
      }
      .pac-item:last-child {
        border-bottom: none !important;
      }
      .pac-item-query {
        font-weight: 500 !important;
        color: #1f2937 !important;
      }
      .pac-matched {
        font-weight: 700 !important;
        color: #7c3aed !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
  };

  const handleInputFocus = () => {
    // Asegurar que el autocomplete esté inicializado cuando el usuario hace focus
    if (!autocompleteRef.current && isLoaded && inputRef.current) {
      initializeAutocomplete();
    }
    
    // Asegurar z-index correcto y prevenir propagación de eventos
    ensureAutocompleteZIndex();
  };

  const handleGetCurrentLocation = async () => {
    if (onGetCurrentLocation) {
      await onGetCurrentLocation();
    }
  };

  const baseInputClasses = "w-full border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuddi-purple focus:border-transparent";
  const variantClasses = variant === 'compact' 
    ? "px-3 py-2 text-sm" 
    : "px-4 py-3 text-base";

  return (
    <div className={`relative ${className || ''}`} style={{ zIndex: 99999 }}>
      {showLocationButton ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            {showIcon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MapPin className="h-4 w-4" />
              </div>
            )}
            
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder || 'Buscar dirección...'}
              className={`${baseInputClasses} ${variantClasses} ${showIcon ? 'pl-10' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              autoComplete="off"
              disabled={disabled}
              spellCheck="false"
            />
            
            {/* Indicador silencioso */}
            {!isLoaded && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                <Search className="h-4 w-4" />
              </div>
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGetCurrentLocation}
            className="shrink-0"
            title="Usar ubicación actual"
            disabled={geoLoading || disabled}
          >
            {geoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Locate className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <>
          {showIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <MapPin className="h-4 w-4" />
            </div>
          )}
          
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder || 'Buscar dirección...'}
            className={`${baseInputClasses} ${variantClasses} ${showIcon ? 'pl-10' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            autoComplete="off"
            disabled={disabled}
            spellCheck="false"
          />
          
          {/* Indicador silencioso */}
          {!isLoaded && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              <Search className="h-4 w-4" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

 
import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/use-google-maps';

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
  variant = 'default'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (isLoaded) {
        initializeAutocomplete();
      }
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
      }
      .pac-item {
        padding: 8px 12px !important;
        cursor: pointer !important;
        border-bottom: 1px solid #f3f4f6 !important;
        pointer-events: auto !important;
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
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

      // Asegurar que el contenedor del autocompletado tenga el z-index correcto
      setTimeout(() => {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer) {
          (pacContainer as HTMLElement).style.zIndex = '99999';
          (pacContainer as HTMLElement).style.pointerEvents = 'auto';
        }
      }, 100);

      // Autocomplete inicializado correctamente
    } catch (error) {
      // Silenciar errores
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
  };

  const handleInputFocus = () => {
    // Asegurar que el autocomplete esté inicializado cuando el usuario hace focus
    if (!autocompleteRef.current && isLoaded) {
      initializeAutocomplete();
    }
    
    // Asegurar que el contenedor del autocompletado tenga el z-index correcto
    setTimeout(() => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        (pacContainer as HTMLElement).style.zIndex = '99999';
        (pacContainer as HTMLElement).style.pointerEvents = 'auto';
      }
    }, 100);
  };

  const baseInputClasses = "w-full border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuddi-purple focus:border-transparent";
  const variantClasses = variant === 'compact' 
    ? "px-3 py-2 text-sm" 
    : "px-4 py-3 text-base";

  return (
    <div className={`relative ${className || ''}`} style={{ zIndex: 99999 }}>
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
  );
};

 
import { useEffect, useRef, useCallback } from 'react';
import { useGoogleMaps } from './use-google-maps';

interface UseGoogleMapsAutocompleteProps {
  onSelectAddress?: (address: string, lat: number, lng: number, placeId?: string) => void;
  onSelectLocation?: (lat: number, lng: number) => void;
  country?: string;
  types?: string[];
}

export const useGoogleMapsAutocomplete = ({
  onSelectAddress,
  onSelectLocation,
  country = 'cl',
  types = ['geocode']
}: UseGoogleMapsAutocompleteProps) => {
  const autocompleteRef = useRef<any>(null);
  const { isLoaded } = useGoogleMaps();

  // Función para asegurar que el contenedor del autocompletado tenga el z-index correcto
  const ensureAutocompleteZIndex = useCallback(() => {
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
  }, []);

  // Función para inicializar el autocompletado
  const initializeAutocomplete = useCallback((inputElement: HTMLInputElement) => {
    if (!inputElement || !window.google?.maps?.places?.Autocomplete) {
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

      // Crear el objeto Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputElement, {
        componentRestrictions: { country },
        fields: ['formatted_address', 'geometry', 'place_id'],
        types,
        language: 'es',
      });

      // Escuchar el evento de selección
      autocompleteRef.current.addListener('place_changed', () => {
        try {
          const place = autocompleteRef.current.getPlace();
          
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || '';
            const placeId = place.place_id;

            // Llamar a los callbacks
            if (onSelectLocation) {
              onSelectLocation(lat, lng);
            }

            if (onSelectAddress) {
              onSelectAddress(address, lat, lng, placeId);
            }
          }
        } catch (error) {
          console.error('Error procesando selección de lugar:', error);
        }
      });

      // Asegurar z-index correcto y prevenir propagación de eventos
      ensureAutocompleteZIndex();

    } catch (error) {
      console.error('Error inicializando autocompletado:', error);
    }
  }, [country, types, onSelectAddress, onSelectLocation, ensureAutocompleteZIndex]);

  // Efecto para aplicar estilos CSS globales
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

  // Función para manejar el focus del input
  const handleInputFocus = useCallback((inputElement: HTMLInputElement) => {
    if (!autocompleteRef.current && isLoaded) {
      initializeAutocomplete(inputElement);
    }
    ensureAutocompleteZIndex();
  }, [isLoaded, initializeAutocomplete, ensureAutocompleteZIndex]);

  return {
    initializeAutocomplete,
    handleInputFocus,
    ensureAutocompleteZIndex,
    isLoaded
  };
}; 
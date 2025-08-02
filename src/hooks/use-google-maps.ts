import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: any;
          PlacesService: any;
          Autocomplete: any;
        };
      };
    };
  }
}

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Si ya está cargado, no hacer nada
      if (window.google?.maps?.places?.Autocomplete) {
        setIsLoaded(true);
        return;
      }

      // Si ya está cargando, no hacer nada
      if (isLoading) {
        return;
      }

      setIsLoading(true);

      // Verificar si el script ya existe
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        const checkGoogle = () => {
          if (window.google?.maps?.places?.Autocomplete) {
            setIsLoaded(true);
            setIsLoading(false);
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
        return;
      }

      // Crear y cargar el script
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCVBiEHX1US1BOUJGvkW76juBpKPiSDPYE&libraries=places&language=es&region=CL&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        const checkGoogle = () => {
          if (window.google?.maps?.places?.Autocomplete) {
            setIsLoaded(true);
            setIsLoading(false);
          } else {
            setTimeout(checkGoogle, 100);
          }
        };
        checkGoogle();
      };

      script.onerror = () => {
        setIsLoaded(false);
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [isLoading]);

  return { isLoaded, isLoading };
}; 
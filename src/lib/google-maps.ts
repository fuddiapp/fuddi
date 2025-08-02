// Configuración de Google Maps API
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  SCRIPT_ID: 'google-maps-script',
  LIBRARIES: ['places'],
  LANGUAGE: 'es',
  REGION: 'CL',
};

// Función para cargar Google Maps API de manera más robusta
export function loadGoogleMapsAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }

    // Verificar si ya existe el script
    const existingScript = document.getElementById(GOOGLE_MAPS_CONFIG.SCRIPT_ID);
    if (existingScript) {
      // Si el script existe pero Google no está disponible, esperar
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos máximo
      
      const checkGoogle = () => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
        } else if (attempts < maxAttempts) {
          setTimeout(checkGoogle, 100);
        } else {
          reject(new Error('Timeout esperando que Google Maps se cargue'));
        }
      };
      checkGoogle();
      return;
    }

    // Crear el script
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_CONFIG.SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.API_KEY}&libraries=${GOOGLE_MAPS_CONFIG.LIBRARIES.join(',')}&language=${GOOGLE_MAPS_CONFIG.LANGUAGE}&region=${GOOGLE_MAPS_CONFIG.REGION}`;
    script.async = true;
    script.defer = true;

    // Agregar timeout
    const timeout = setTimeout(() => {
      reject(new Error('Timeout al cargar Google Maps API (10 segundos)'));
    }, 10000);

    // Manejar éxito
    script.onload = () => {
      clearTimeout(timeout);
      
      // Verificar que Google Maps esté disponible
      let attempts = 0;
      const maxAttempts = 20; // 2 segundos máximo
      
      const checkGoogle = () => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
        } else if (attempts < maxAttempts) {
          setTimeout(checkGoogle, 100);
        } else {
          reject(new Error('Google Maps no se inicializó correctamente'));
        }
      };
      checkGoogle();
    };

    // Manejar error
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Error al cargar Google Maps API'));
    };

    // Agregar el script al DOM
    document.head.appendChild(script);
  });
}

// Función para verificar si Google Maps está disponible
export function isGoogleMapsLoaded(): boolean {
  return !!(window.google && window.google.maps && window.google.maps.places);
}

// Función para obtener dirección desde coordenadas usando Google Geocoding API
export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_CONFIG.API_KEY}&language=${GOOGLE_MAPS_CONFIG.LANGUAGE}&region=${GOOGLE_MAPS_CONFIG.REGION}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.error('Geocoding API error:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error obteniendo dirección:', error);
    return null;
  }
}

// Función para obtener coordenadas desde dirección usando Google Geocoding API
export async function getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number; placeId?: string } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_CONFIG.API_KEY}&language=${GOOGLE_MAPS_CONFIG.LANGUAGE}&region=${GOOGLE_MAPS_CONFIG.REGION}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
      };
    } else {
      console.error('Geocoding API error:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error obteniendo coordenadas:', error);
    return null;
  }
} 
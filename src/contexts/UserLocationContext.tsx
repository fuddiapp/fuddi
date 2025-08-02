import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAddressFromCoordinates, getCoordinatesFromAddress } from '@/lib/google-maps';

interface UserLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

interface UserLocationContextType {
  userLocation: UserLocation | null;
  isLoading: boolean;
  updateLocation: (location: UserLocation) => Promise<void>;
  updateLocationFromAddress: (address: string, lat: number, lng: number, placeId?: string) => Promise<void>;
  getCurrentLocation: () => Promise<UserLocation | null>;
  clearLocation: () => void;
}

const UserLocationContext = createContext<UserLocationContextType | undefined>(undefined);

export const useUserLocation = (): UserLocationContextType => {
  const context = useContext(UserLocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation must be used within a UserLocationProvider');
  }
  return context;
};

interface UserLocationProviderProps {
  children: ReactNode;
}

export const UserLocationProvider: React.FC<UserLocationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar ubicación inicial del usuario
  useEffect(() => {
    const loadUserLocation = async () => {
      if (!user?.id || user.type !== 'client') return;

      try {
        setIsLoading(true);
        
        // Obtener datos del cliente desde Supabase
        const { data: clientData, error } = await supabase
          .from('clients')
          .select('address, location_lat, location_lng')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error cargando ubicación del usuario:', error);
          return;
        }

        // Cargar ubicación desde la base de datos
        if (clientData?.address) {
          // Si tenemos coordenadas guardadas, usarlas
          if (clientData.location_lat && clientData.location_lng) {
            setUserLocation({
              address: clientData.address,
              latitude: clientData.location_lat,
              longitude: clientData.location_lng,
            });
          } else {
            // Si no tenemos coordenadas, intentar obtenerlas desde la dirección
            try {
              const coords = await getCoordinatesFromAddress(clientData.address);
              if (coords) {
                setUserLocation({
                  address: clientData.address,
                  latitude: coords.lat,
                  longitude: coords.lng,
                  placeId: coords.placeId,
                });
              } else {
                // Si no podemos obtener coordenadas, solo guardamos la dirección
                setUserLocation({
                  address: clientData.address,
                  latitude: 0,
                  longitude: 0,
                });
              }
            } catch (error) {
              console.error('Error obteniendo coordenadas:', error);
              // Fallback: solo dirección
              setUserLocation({
                address: clientData.address,
                latitude: 0,
                longitude: 0,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error inesperado cargando ubicación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserLocation();
  }, [user?.id, user?.type, toast]);

  // Función para obtener ubicación actual usando geolocalización
  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast({
          title: "Error",
          description: "La geolocalización no está soportada en este navegador.",
          variant: "destructive",
        });
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Usar la función mejorada para obtener la dirección
            const address = await getAddressFromCoordinates(latitude, longitude);
            
            if (address) {
              const location: UserLocation = {
                address,
                latitude,
                longitude,
                placeId: undefined, // No tenemos place_id en geocoding inverso
              };
              resolve(location);
            } else {
              toast({
                title: "Error",
                description: "No se pudo obtener la dirección a partir de tu ubicación.",
                variant: "destructive",
              });
              resolve(null);
            }
          } catch (error) {
            console.error('Error obteniendo dirección:', error);
            toast({
              title: "Error",
              description: "Error al obtener la dirección de tu ubicación.",
              variant: "destructive",
            });
            resolve(null);
          }
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          let errorMessage = 'No se pudo obtener tu ubicación.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso denegado para acceder a tu ubicación.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado al obtener tu ubicación.';
              break;
          }
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, [toast]);

  // Función para actualizar ubicación desde dirección seleccionada
  const updateLocationFromAddress = useCallback(async (
    address: string, 
    lat: number, 
    lng: number, 
    placeId?: string
  ) => {
    if (!user?.id || user.type !== 'client') return;

    try {
      setIsLoading(true);
      
      const newLocation: UserLocation = {
        address,
        latitude: lat,
        longitude: lng,
        placeId,
      };

      // Actualizar en Supabase
      const { error } = await supabase
        .from('clients')
        .update({
          address,
          location_lat: lat,
          location_lng: lng,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Actualizar estado local
      setUserLocation(newLocation);
      
      // Actualizar localStorage
      const userData = JSON.parse(localStorage.getItem('fuddi-user') || '{}');
      userData.address = address;
      localStorage.setItem('fuddi-user', JSON.stringify(userData));

      toast({
        title: "Ubicación actualizada",
        description: "Tu ubicación se ha actualizado correctamente.",
      });

      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('userLocationChanged', { 
        detail: newLocation 
      }));

      // También disparar un evento para recargar promociones
      window.dispatchEvent(new CustomEvent('locationUpdated', { 
        detail: newLocation 
      }));

    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu ubicación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.type, toast]);

  // Función para actualizar ubicación completa
  const updateLocation = useCallback(async (location: UserLocation) => {
    await updateLocationFromAddress(location.address, location.latitude, location.longitude, location.placeId);
  }, [updateLocationFromAddress]);

  // Función para limpiar ubicación
  const clearLocation = useCallback(() => {
    setUserLocation(null);
  }, []);

  return (
    <UserLocationContext.Provider value={{
      userLocation,
      isLoading,
      updateLocation,
      updateLocationFromAddress,
      getCurrentLocation,
      clearLocation,
    }}>
      {children}
    </UserLocationContext.Provider>
  );
}; 
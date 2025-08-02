import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isBusinessOpen = (openingTime?: string, closingTime?: string): boolean => {
  if (!openingTime || !closingTime) {
    return true; // Si no hay horario definido, asumir que está abierto
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Tiempo actual en minutos

  // Convertir horarios de apertura y cierre a minutos
  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = closingTime.split(':').map(Number);
  
  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  // Manejar horarios que cruzan la medianoche
  if (closeTimeInMinutes < openTimeInMinutes) {
    // El negocio cierra después de medianoche
    return currentTime >= openTimeInMinutes || currentTime <= closeTimeInMinutes;
  } else {
    // Horario normal
    return currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes;
  }
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns string - Fecha en formato YYYY-MM-DD
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del primer punto
 * @param lon1 Longitud del primer punto
 * @param lat2 Latitud del segundo punto
 * @param lon2 Longitud del segundo punto
 * @returns Distancia en kilómetros
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distancia en kilómetros
  return Math.round(distance * 10) / 10; // Redondear a 1 decimal
}

/**
 * Formatea la distancia para mostrar
 * @param distance Distancia en kilómetros
 * @returns String formateado de la distancia
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

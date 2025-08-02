import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshMenusOptions {
  refreshFunction: () => Promise<void> | void;
  dependencies?: any[];
  checkInterval?: number; // en milisegundos, por defecto 1 minuto
  enabled?: boolean; // por defecto true
}

/**
 * Hook para actualización automática de menús del día
 * Verifica si cambió la fecha y ejecuta la función de actualización automáticamente
 */
export function useAutoRefreshMenus({
  refreshFunction,
  dependencies = [],
  checkInterval = 60000, // 1 minuto por defecto
  enabled = true
}: UseAutoRefreshMenusOptions) {
  const lastDateRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Función para verificar si cambió la fecha
  const checkDateChange = useCallback(async () => {
    const currentDate = getCurrentDate();
    
    // Si es la primera vez, solo establecer la fecha
    if (!lastDateRef.current) {
      lastDateRef.current = currentDate;
      console.log('🔄 useAutoRefreshMenus: Fecha inicial establecida:', currentDate);
      return;
    }

    // Si cambió la fecha, ejecutar la función de actualización
    if (lastDateRef.current !== currentDate) {
      console.log('🔄 useAutoRefreshMenus: Cambio de fecha detectado:', {
        from: lastDateRef.current,
        to: currentDate
      });
      
      try {
        await refreshFunction();
        console.log('✅ useAutoRefreshMenus: Actualización completada');
      } catch (error) {
        console.error('❌ useAutoRefreshMenus: Error en actualización:', error);
      }
      
      // Actualizar la fecha de referencia
      lastDateRef.current = currentDate;
    }
  }, [getCurrentDate, refreshFunction]);

  // Función para limpiar el intervalo
  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Función para iniciar el intervalo
  const startInterval = useCallback(() => {
    if (!enabled) return;
    
    clearIntervalRef();
    
    // Establecer la fecha inicial
    lastDateRef.current = getCurrentDate();
    
    // Crear el intervalo
    intervalRef.current = setInterval(checkDateChange, checkInterval);
    
    console.log('🔄 useAutoRefreshMenus: Intervalo iniciado (cada', checkInterval / 1000, 'segundos)');
  }, [enabled, checkInterval, checkDateChange, clearIntervalRef, getCurrentDate]);

  // Efecto principal
  useEffect(() => {
    startInterval();
    
    // Limpiar al desmontar
    return () => {
      clearIntervalRef();
    };
  }, [startInterval, clearIntervalRef, ...dependencies]);

  // Efecto para manejar cambios en las dependencias
  useEffect(() => {
    if (enabled) {
      startInterval();
    } else {
      clearIntervalRef();
    }
  }, [enabled, startInterval, clearIntervalRef]);

  // Retornar funciones útiles
  return {
    currentDate: lastDateRef.current,
    isEnabled: enabled,
    forceRefresh: refreshFunction,
    restartInterval: startInterval,
    stopInterval: clearIntervalRef
  };
} 
import { useEffect, useState } from 'react';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Solo agregar el listener una vez
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

// Hook para evitar re-ejecución de efectos cuando la página vuelve a estar visible
export function useStableEffect(effect: () => void | (() => void), deps: any[] = []) {
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (!hasRun) {
      const cleanup = effect();
      setHasRun(true);
      return cleanup;
    }
  }, [hasRun, ...deps]);

  return hasRun;
} 
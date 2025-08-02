import { useEffect, useRef } from 'react';

/**
 * Hook que ejecuta un efecto solo una vez, evitando re-ejecuciones innecesarias
 * @param effect - La función del efecto
 * @param deps - Dependencias del efecto
 */
export function useStableEffect(effect: () => void | (() => void), deps: any[] = []) {
  const hasRun = useRef(false);
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      cleanupRef.current = effect();
    }

    return () => {
      if (cleanupRef.current && typeof cleanupRef.current === 'function') {
        cleanupRef.current();
      }
    };
  }, deps);

  return hasRun.current;
}

/**
 * Hook que ejecuta un efecto solo cuando las dependencias cambian realmente
 * @param effect - La función del efecto
 * @param deps - Dependencias del efecto
 */
export function useDeepEffect(effect: () => void | (() => void), deps: any[]) {
  const prevDeps = useRef<any[]>([]);
  const isFirstRun = useRef(true);

  useEffect(() => {
    // En la primera ejecución, siempre ejecutar
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return effect();
    }

    // En ejecuciones posteriores, comparar dependencias
    const depsChanged = deps.some((dep, index) => {
      const prevDep = prevDeps.current[index];
      return dep !== prevDep;
    });

    if (depsChanged) {
      prevDeps.current = [...deps];
      return effect();
    }
  }, deps);
}

/**
 * Hook para evitar re-renderizados cuando la pestaña vuelve a estar activa
 * @param effect - La función del efecto
 * @param deps - Dependencias del efecto
 */
export function usePageVisibilityEffect(effect: () => void | (() => void), deps: any[] = []) {
  const hasRun = useRef(false);
  const isPageVisible = useRef(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Solo ejecutar si la página está visible y no se ha ejecutado antes
    if (isPageVisible.current && !hasRun.current) {
      hasRun.current = true;
      return effect();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, deps);

  return hasRun.current;
} 
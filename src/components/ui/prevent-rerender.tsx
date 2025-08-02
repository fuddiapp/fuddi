import React, { memo, useMemo } from 'react';

interface PreventRerenderProps {
  children: React.ReactNode;
  dependencies?: any[];
  enabled?: boolean;
}

/**
 * Componente que previene re-renderizados innecesarios
 * Solo re-renderiza cuando las dependencias cambian realmente
 */
export const PreventRerender = memo<PreventRerenderProps>(
  ({ children, dependencies = [], enabled = true }) => {
    // Si está deshabilitado, renderizar normalmente
    if (!enabled) {
      return <>{children}</>;
    }

    // Memoizar el contenido basado en las dependencias
    const memoizedContent = useMemo(() => {
      return children;
    }, dependencies);

    return <>{memoizedContent}</>;
  },
  (prevProps, nextProps) => {
    // Comparación personalizada para evitar re-renderizados
    if (prevProps.enabled !== nextProps.enabled) {
      return false;
    }

    if (prevProps.dependencies?.length !== nextProps.dependencies?.length) {
      return false;
    }

    // Comparar cada dependencia
    return prevProps.dependencies?.every((dep, index) => {
      return dep === nextProps.dependencies?.[index];
    }) ?? true;
  }
);

/**
 * Hook para memoizar valores y evitar re-cálculos innecesarios
 */
export function useMemoizedValue<T>(value: T, dependencies: any[]): T {
  return useMemo(() => value, dependencies);
}

/**
 * Hook para memoizar funciones y evitar re-creaciones innecesarias
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  return useMemo(() => callback, dependencies) as T;
} 
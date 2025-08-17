import React, { memo, ReactNode } from 'react';

interface PreventRerenderProps {
  children: ReactNode;
  name?: string;
}

/**
 * Componente wrapper que previene re-renderizados innecesarios
 * Útil para evitar problemas de DOM como NotFoundError
 */
export const PreventRerender = memo<PreventRerenderProps>(({ children, name = 'PreventRerender' }) => {
  return <>{children}</>;
}, (prevProps, nextProps) => {
  // Solo re-renderizar si los children realmente cambiaron
  return prevProps.children === nextProps.children;
});

PreventRerender.displayName = 'PreventRerender';

/**
 * Hook para prevenir re-renderizados de funciones
 */
export function usePreventRerender<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList = []
): T {
  return React.useCallback(fn, deps);
}

/**
 * Hook para prevenir re-renderizados de valores
 */
export function usePreventRerenderValue<T>(value: T, deps: React.DependencyList = []): T {
  return React.useMemo(() => value, deps);
} 
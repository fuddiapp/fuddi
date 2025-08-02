import React, { useEffect, useRef } from 'react';

interface FormPersistenceProps {
  children: React.ReactNode;
  formKey: string;
  onRestore?: (data: any) => void;
}

export const FormPersistence: React.FC<FormPersistenceProps> = ({ 
  children, 
  formKey, 
  onRestore 
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const isRestoring = useRef(false);

  // Restaurar datos del formulario al montar
  useEffect(() => {
    const savedData = sessionStorage.getItem(`form-${formKey}`);
    if (savedData && onRestore) {
      try {
        const data = JSON.parse(savedData);
        isRestoring.current = true;
        onRestore(data);
        // Limpiar después de restaurar
        setTimeout(() => {
          sessionStorage.removeItem(`form-${formKey}`);
          isRestoring.current = false;
        }, 100);
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, [formKey, onRestore]);

  // Guardar datos del formulario antes de que se desmonte
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (formRef.current && !isRestoring.current) {
        const formData = new FormData(formRef.current);
        const data: Record<string, any> = {};
        
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
        
        sessionStorage.setItem(`form-${formKey}`, JSON.stringify(data));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formKey]);

  return (
    <form ref={formRef}>
      {children}
    </form>
  );
};

// Hook para manejar la persistencia de estado en formularios
export function useFormPersistence<T>(key: string, initialState: T) {
  const [state, setState] = React.useState<T>(() => {
    const saved = sessionStorage.getItem(`form-state-${key}`);
    return saved ? JSON.parse(saved) : initialState;
  });

  const setStateWithPersistence = React.useCallback((newState: T | ((prev: T) => T)) => {
    setState(prevState => {
      let nextState: T;
      if (typeof newState === 'function') {
        nextState = (newState as (prev: T) => T)(prevState);
      } else {
        nextState = newState;
      }
      sessionStorage.setItem(`form-state-${key}`, JSON.stringify(nextState));
      return nextState;
    });
  }, [key]);

  // Limpiar al desmontar
  React.useEffect(() => {
    return () => {
      sessionStorage.removeItem(`form-state-${key}`);
    };
  }, [key]);

  return [state, setStateWithPersistence] as const;
} 
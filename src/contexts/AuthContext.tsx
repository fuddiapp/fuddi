import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'business';
  token: string;
  address?: string;
  businessInfo?: {
    businessName: string;
    businessType: string;
    address: string;
    commune: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isBusiness: boolean;
  isClient: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para manejar la inserción de clientes después de la verificación
  const handleClientRegistration = async (supabaseUser: any) => {
    try {
      // Solo procesar si es un cliente
      if (supabaseUser.user_metadata?.type === 'client') {
        // Obtener datos de user_metadata primero
        const metadata = supabaseUser.user_metadata || {};
        let clientData = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          first_name: metadata.firstName || metadata.given_name || 'Cliente',
          last_name: metadata.lastName || metadata.family_name || '',
          address: metadata.address || '',
        };
        
        // Verificar si hay datos de registro en localStorage como respaldo
        const clientRegistrationData = localStorage.getItem('fuddi-client-registration');
        if (clientRegistrationData) {
          try {
            const registrationData = JSON.parse(clientRegistrationData);
            // Usar datos de localStorage solo si no están en metadata
            clientData = {
              ...clientData,
              first_name: metadata.firstName || registrationData.firstName || clientData.first_name,
              last_name: metadata.lastName || registrationData.lastName || clientData.last_name,
              address: metadata.address || registrationData.address || clientData.address,
            };
            localStorage.removeItem('fuddi-client-registration');
          } catch (error) {
            console.error('❌ AuthContext: Error al parsear datos de localStorage:', error);
          }
        }
        
        // Insertar cliente en la tabla clients (ignorar errores de duplicado)
        const { error: insertError } = await supabase.from('clients').insert(clientData);
        
        if (insertError && !insertError.message.includes('duplicate')) {
          console.error('❌ AuthContext: Error al insertar cliente:', insertError);
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Error en handleClientRegistration:', error);
    }
  };

  // Función simplificada para crear objeto de usuario
  const createUserObject = (supabaseUser: any): User | null => {
    // Usar user_metadata para determinar el tipo
    const userType = supabaseUser.user_metadata?.type || 'client';
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email || '',
      email: supabaseUser.email || '',
      type: userType,
      token: '',
    };
  };

  // Función simplificada para obtener sesión inicial
  const getInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData = createUserObject(session.user);
        
        if (userData) {
          setUser(userData);
          localStorage.setItem('fuddi-user', JSON.stringify(userData));
        }
        
        // Manejar registro de cliente de forma asíncrona (no bloquear)
        handleClientRegistration(session.user).catch(error => {
          console.error('Error en handleClientRegistration:', error);
        });
      }
    } catch (error) {
      console.error('❌ AuthContext: getInitialSession - Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect simple en lugar de useStableEffect
  useEffect(() => {
    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = createUserObject(session.user);
          if (userData) {
            setUser(userData);
            localStorage.setItem('fuddi-user', JSON.stringify(userData));
          }
          
          // Manejar registro de cliente de forma asíncrona (no bloquear)
          handleClientRegistration(session.user).catch(error => {
            console.error('Error en handleClientRegistration:', error);
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('fuddi-user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fuddi-user', JSON.stringify(userData));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('fuddi-user');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isBusiness: user?.type === 'business',
    isClient: user?.type === 'client',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
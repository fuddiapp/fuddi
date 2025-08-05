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
    console.log('🔍 AuthContext: handleClientRegistration - Iniciando...');
    console.log('🔍 AuthContext: handleClientRegistration - Usuario:', supabaseUser.id);
    console.log('🔍 AuthContext: handleClientRegistration - Tipo:', supabaseUser.user_metadata?.type);
    
    try {
      // Verificar si hay datos de registro de cliente en localStorage
      const clientRegistrationData = localStorage.getItem('fuddi-client-registration');
      console.log('🔍 AuthContext: handleClientRegistration - Datos en localStorage:', !!clientRegistrationData);
      
      if (clientRegistrationData && supabaseUser.user_metadata?.type === 'client') {
        const registrationData = JSON.parse(clientRegistrationData);
        
        console.log('🔍 AuthContext: Procesando registro de cliente:', registrationData);
        
        // Insertar cliente en la tabla clients
        const { error: insertError } = await supabase.from('clients').insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          first_name: registrationData.firstName,
          last_name: registrationData.lastName,
          address: registrationData.address,
        });
        
        if (insertError) {
          console.error('❌ AuthContext: Error al insertar cliente:', insertError);
          throw insertError;
        }
        
        console.log('✅ AuthContext: Cliente insertado exitosamente en la tabla clients');
        
        // Limpiar datos de localStorage
        localStorage.removeItem('fuddi-client-registration');
      } else {
        console.log('🔍 AuthContext: handleClientRegistration - No se cumplen las condiciones para insertar cliente');
        console.log('🔍 AuthContext: handleClientRegistration - clientRegistrationData existe:', !!clientRegistrationData);
        console.log('🔍 AuthContext: handleClientRegistration - user_metadata.type es client:', supabaseUser.user_metadata?.type === 'client');
      }
    } catch (error) {
      console.error('❌ AuthContext: Error en handleClientRegistration:', error);
    }
  };

  // Función simplificada para crear objeto de usuario
  const createUserObject = (supabaseUser: any): User | null => {
    console.log('🔍 AuthContext: createUserObject - Iniciando para usuario:', supabaseUser.id);
    
    // Usar user_metadata para determinar el tipo
    const userType = supabaseUser.user_metadata?.type || 'client';
    console.log('🔍 AuthContext: user_metadata.type:', userType);
    
    console.log('✅ AuthContext: createUserObject - Usuario creado con datos básicos');
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
    console.log('🚀 AuthContext: getInitialSession - Iniciando...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 AuthContext: getInitialSession - Sesión obtenida:', !!session);
      
      if (session?.user) {
        console.log('🔍 AuthContext: getInitialSession - Usuario encontrado:', session.user.id);
        
        // Manejar registro de cliente si es necesario
        await handleClientRegistration(session.user);
        
        const userData = createUserObject(session.user);
        console.log('🔍 AuthContext: getInitialSession - Objeto de usuario creado:', !!userData);
        
        if (userData) {
          console.log('✅ AuthContext: getInitialSession - Usuario configurado exitosamente');
          setUser(userData);
          localStorage.setItem('fuddi-user', JSON.stringify(userData));
        } else {
          console.log('❌ AuthContext: getInitialSession - No se pudo crear objeto de usuario');
        }
      } else {
        console.log('🔍 AuthContext: getInitialSession - No hay sesión activa');
      }
    } catch (error) {
      console.error('❌ AuthContext: getInitialSession - Error:', error);
    } finally {
      console.log('✅ AuthContext: getInitialSession - Finalizando, isLoading = false');
      setIsLoading(false);
    }
  };

  // useEffect simple en lugar de useStableEffect
  useEffect(() => {
    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 AuthContext: onAuthStateChange - Evento:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Manejar registro de cliente si es necesario
          await handleClientRegistration(session.user);
          
          const userData = createUserObject(session.user);
          if (userData) {
            setUser(userData);
            localStorage.setItem('fuddi-user', JSON.stringify(userData));
            console.log('✅ AuthContext: Usuario autenticado:', userData.type);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('fuddi-user');
          console.log('✅ AuthContext: Usuario desconectado');
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
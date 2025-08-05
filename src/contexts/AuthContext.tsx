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
    console.log('🔍 AuthContext: handleClientRegistration - Metadata:', supabaseUser.user_metadata);
    
    try {
      // Solo procesar si es un cliente
      if (supabaseUser.user_metadata?.type === 'client') {
        console.log('🔍 AuthContext: handleClientRegistration - Verificando si cliente existe en tabla...');
        
        // Verificar si el cliente ya existe en la tabla
        const { data: existingClient, error: checkError } = await supabase
          .from('clients')
          .select('id')
          .eq('id', supabaseUser.id)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ AuthContext: Error al verificar cliente existente:', checkError);
          return;
        }
        
        // Si el cliente no existe, insertarlo
        if (!existingClient) {
          console.log('🔍 AuthContext: Cliente no existe en tabla, insertando...');
          
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
              console.log('🔍 AuthContext: Usando datos de localStorage como respaldo:', registrationData);
              localStorage.removeItem('fuddi-client-registration');
            } catch (error) {
              console.error('❌ AuthContext: Error al parsear datos de localStorage:', error);
            }
          }
          
          console.log('🔍 AuthContext: Datos finales del cliente:', clientData);
          
          // Insertar cliente en la tabla clients
          const { error: insertError } = await supabase.from('clients').insert(clientData);
          
          if (insertError) {
            console.error('❌ AuthContext: Error al insertar cliente:', insertError);
            throw insertError;
          }
          
          console.log('✅ AuthContext: Cliente insertado exitosamente en la tabla clients');
        } else {
          console.log('✅ AuthContext: Cliente ya existe en la tabla');
        }
      } else {
        console.log('🔍 AuthContext: handleClientRegistration - No es un cliente, saltando inserción');
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
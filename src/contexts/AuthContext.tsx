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

  // Función para manejar la inserción de negocios después de la verificación
  const handleBusinessRegistration = async (supabaseUser: any) => {
    try {
      // Solo procesar si es un negocio
      if (supabaseUser.user_metadata?.type === 'business') {
        // Obtener datos de user_metadata primero
        const metadata = supabaseUser.user_metadata || {};
        let businessData = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          business_name: metadata.business_name || 'Negocio',
          category: metadata.category || '',
          description: metadata.description || '',
          address: metadata.address || '',
          opening_time: metadata.opening_time || '09:00',
          closing_time: metadata.closing_time || '18:00',
          location_lat: metadata.location_lat || null,
          location_lng: metadata.location_lng || null,
          logo_url: '',
        };
        
        // Verificar si hay datos de registro en localStorage como respaldo
        const businessRegistrationData = localStorage.getItem('fuddi-business-registration');
        if (businessRegistrationData) {
          try {
            const registrationData = JSON.parse(businessRegistrationData);
            // Usar datos de localStorage solo si no están en metadata
            businessData = {
              ...businessData,
              business_name: metadata.business_name || registrationData.business_name || businessData.business_name,
              category: metadata.category || registrationData.category || businessData.category,
              description: metadata.description || registrationData.description || businessData.description,
              address: metadata.address || registrationData.address || businessData.address,
              opening_time: metadata.opening_time || registrationData.opening_time || businessData.opening_time,
              closing_time: metadata.closing_time || registrationData.closing_time || businessData.closing_time,
              location_lat: metadata.location_lat || registrationData.location_lat || businessData.location_lat,
              location_lng: metadata.location_lng || registrationData.location_lng || businessData.location_lng,
            };
            localStorage.removeItem('fuddi-business-registration');
          } catch (error) {
            console.error('❌ AuthContext: Error al parsear datos de localStorage:', error);
          }
        }
        
        // Verificar si el negocio ya existe antes de insertar
        const { data: existingBusiness, error: checkError } = await supabase
          .from('businesses')
          .select('id')
          .eq('id', supabaseUser.id)
          .maybeSingle();
        
        if (checkError) {
          console.error('❌ AuthContext: Error al verificar negocio existente:', checkError);
        } else if (!existingBusiness) {
          // Solo insertar si no existe
          const { error: insertError } = await supabase.from('businesses').insert(businessData);
          
          if (insertError) {
            console.error('❌ AuthContext: Error al insertar negocio:', insertError);
          } else {
            console.log('✅ AuthContext: Negocio insertado exitosamente');
          }
        } else {
          console.log('✅ AuthContext: Negocio ya existe en la base de datos');
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Error en handleBusinessRegistration:', error);
    }
  };

  // Función para manejar la inserción de clientes después de la verificación
  const handleClientRegistration = async (supabaseUser: any) => {
    try {
      // Solo procesar si es un cliente y tiene datos completos
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
        
        // Solo insertar si tiene dirección (datos completos)
        if (clientData.address && clientData.address.trim()) {
          // Verificar si el cliente ya existe antes de insertar
          const { data: existingClient, error: checkError } = await supabase
            .from('clients')
            .select('id')
            .eq('id', supabaseUser.id)
            .maybeSingle();
          
          if (checkError) {
            console.error('❌ AuthContext: Error al verificar cliente existente:', checkError);
          } else if (!existingClient) {
            // Solo insertar si no existe
            const { error: insertError } = await supabase.from('clients').insert(clientData);
            
            if (insertError) {
              console.error('❌ AuthContext: Error al insertar cliente:', insertError);
            } else {
              console.log('✅ AuthContext: Cliente insertado exitosamente');
            }
          } else {
            console.log('✅ AuthContext: Cliente ya existe en la base de datos');
          }
        } else {
          console.log('⚠️ AuthContext: Cliente sin datos completos, esperando completar registro');
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
    
    // Si el usuario viene de Google y no tiene tipo definido, no asignar tipo automáticamente
    // para permitir que complete el registro
    const finalUserType = userType === 'client' && !supabaseUser.user_metadata?.address ? 'client' : userType;
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email || '',
      email: supabaseUser.email || '',
      type: finalUserType,
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
        
        // Manejar registro de cliente y negocio de forma asíncrona (no bloquear)
        handleClientRegistration(session.user).catch(error => {
          console.error('Error en handleClientRegistration:', error);
        });
        
        handleBusinessRegistration(session.user).catch(error => {
          console.error('Error en handleBusinessRegistration:', error);
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
          
          // Manejar registro de cliente y negocio de forma asíncrona (no bloquear)
          handleClientRegistration(session.user).catch(error => {
            console.error('Error en handleClientRegistration:', error);
          });
          handleBusinessRegistration(session.user).catch(error => {
            console.error('Error en handleBusinessRegistration:', error);
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
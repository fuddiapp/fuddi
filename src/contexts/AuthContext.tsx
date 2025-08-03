import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useStableEffect } from '@/hooks/use-stable-effect';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'client' | 'business';
  token: string;
  address?: string; // Dirección del usuario (para clientes)
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
  if (context === undefined) {
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para determinar el tipo de usuario
  const determineUserType = async (supabaseUser: SupabaseUser): Promise<'client' | 'business' | null> => {
    try {
      console.log('🔍 AuthContext: determineUserType - Iniciando para usuario:', supabaseUser.id);
      
      // Primero verificar en user_metadata
      let userType = supabaseUser.user_metadata?.type;
      console.log('🔍 AuthContext: user_metadata.type:', userType);
      
      if (!userType) {
        console.log('🔍 AuthContext: No hay user_metadata.type, buscando en tablas...');
        
        // Buscar en la tabla businesses por ID
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('id')
          .eq('id', supabaseUser.id)
          .maybeSingle();
        
        console.log('🔍 AuthContext: Búsqueda en businesses por ID:', { businessData, businessError });
        
        if (businessData && !businessError) {
          userType = 'business';
        } else {
          // Buscar en la tabla businesses por email
          const { data: businessDataByEmail, error: businessErrorByEmail } = await supabase
            .from('businesses')
            .select('id')
            .eq('email', supabaseUser.email)
            .maybeSingle();
          
          console.log('🔍 AuthContext: Búsqueda en businesses por email:', { businessDataByEmail, businessErrorByEmail });
          
          if (businessDataByEmail && !businessErrorByEmail) {
            userType = 'business';
          } else {
            // Buscar en la tabla clients por ID
            const { data: clientData, error: clientError } = await supabase
              .from('clients')
              .select('id')
              .eq('id', supabaseUser.id)
              .maybeSingle();
            
            console.log('🔍 AuthContext: Búsqueda en clients por ID:', { clientData, clientError });
            
            if (clientData && !clientError) {
              userType = 'client';
            } else {
              // Buscar en la tabla clients por email
              const { data: clientDataByEmail, error: clientErrorByEmail } = await supabase
                .from('clients')
                .select('id')
                .eq('email', supabaseUser.email)
                .maybeSingle();
              
              console.log('🔍 AuthContext: Búsqueda en clients por email:', { clientDataByEmail, clientErrorByEmail });
              
              if (clientDataByEmail && !clientErrorByEmail) {
                userType = 'client';
              }
            }
          }
        }
      }
      
      console.log('✅ AuthContext: determineUserType - Tipo determinado:', userType);
      return userType;
    } catch (error) {
      console.error('❌ AuthContext: determineUserType - Error:', error);
      return null;
    }
  };

  // Función para crear objeto de usuario
  const createUserObject = async (supabaseUser: SupabaseUser, userType: 'client' | 'business' | null): Promise<User | null> => {
    console.log('🔍 AuthContext: createUserObject - Iniciando para usuario:', supabaseUser.id, 'tipo:', userType);
    
    if (!userType) {
      console.log('❌ AuthContext: createUserObject - No hay tipo de usuario');
      return null;
    }
    
    let address: string | undefined;
    
    // Si es cliente, obtener la dirección desde la tabla clients
    if (userType === 'client') {
      console.log('🔍 AuthContext: createUserObject - Obteniendo datos del cliente desde Supabase...');
      try {
        const { data: clientData, error } = await supabase
          .from('clients')
          .select('first_name, last_name, address')
          .eq('id', supabaseUser.id)
          .maybeSingle();
        
        console.log('🔍 AuthContext: createUserObject - Datos del cliente obtenidos:', { clientData, error });
        
        if (clientData && !error) {
          address = clientData.address;
          // Usar el nombre completo del cliente si está disponible
          const fullName = `${clientData.first_name || ''} ${clientData.last_name || ''}`.trim();
          if (fullName) {
            console.log('✅ AuthContext: createUserObject - Usuario cliente creado con nombre completo');
            return {
              id: supabaseUser.id,
              name: fullName,
              email: supabaseUser.email || '',
              type: userType,
              token: '',
              address,
            };
          }
        }
      } catch (error) {
        console.error('❌ AuthContext: createUserObject - Error obteniendo datos del cliente:', error);
      }
    }
    
    console.log('✅ AuthContext: createUserObject - Usuario creado con datos básicos');
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email || '',
      email: supabaseUser.email || '',
      type: userType,
      token: '',
      address,
    };
  };

  useStableEffect(() => {
    // Obtener sesión inicial solo una vez
    const getInitialSession = async () => {
      console.log('🚀 AuthContext: getInitialSession - Iniciando...');
      try {
        console.log('🔍 AuthContext: getInitialSession - Iniciando...');
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 AuthContext: getInitialSession - Sesión obtenida:', !!session);
        
        if (session?.user) {
          console.log('🔍 AuthContext: getInitialSession - Usuario encontrado:', session.user.id);
          
          const userType = await determineUserType(session.user);
          console.log('🔍 AuthContext: getInitialSession - Tipo de usuario determinado:', userType);
          
          const userData = await createUserObject(session.user, userType);
          console.log('🔍 AuthContext: getInitialSession - Objeto de usuario creado:', !!userData);
          
          if (userData) {
            console.log('✅ AuthContext: getInitialSession - Usuario configurado exitosamente');
            setUser(userData);
            localStorage.setItem('fuddi-user', JSON.stringify(userData));
            // Si es cliente y no existe en la tabla, insertar datos desde localStorage
            if (userType === 'client') {
              await maybeInsertClientData(session.user);
            }
            // Si es negocio y no existe en la tabla, insertar datos desde localStorage
            if (userType === 'business') {
              await maybeInsertBusinessData(session.user);
            }
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
        setIsInitialized(true);
        console.log('✅ AuthContext: Estados actualizados - isLoading: false, isInitialized: true');
      }
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Solo procesar eventos de autenticación, no re-inicializar
        if (event === 'SIGNED_IN' && session?.user) {
          const userType = await determineUserType(session.user);
          const userData = await createUserObject(session.user, userType);
          if (userData) {
            setUser(userData);
            localStorage.setItem('fuddi-user', JSON.stringify(userData));
            // Si es cliente y no existe en la tabla, insertar datos desde localStorage
            if (userType === 'client') {
              await maybeInsertClientData(session.user);
            }
            // Si es negocio y no existe en la tabla, insertar datos desde localStorage
            if (userType === 'business') {
              await maybeInsertBusinessData(session.user);
            }
            // Redirigir según el tipo de usuario
            redirectUser(userType);
          } else {
            redirectUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('fuddi-user');
          window.location.href = '/';
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Función para insertar datos de cliente tras el primer login si no existe en la tabla
  const maybeInsertClientData = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('id')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      if (!client && !error) {
        const regData = localStorage.getItem('fuddi-client-registration');
        if (regData) {
          const { email, firstName, lastName, address } = JSON.parse(regData);
          // Insertar en la tabla clients
          const { error: insertError } = await supabase.from('clients').insert({
            id: supabaseUser.id,
            email,
            first_name: firstName,
            last_name: lastName,
            address,
          });
          if (!insertError) {
            localStorage.removeItem('fuddi-client-registration');
            // Vuelve a determinar el tipo y redirige
            const userType = await determineUserType(supabaseUser);
            redirectUser(userType);
          }
        }
      }
    } catch (e) {
      // Silenciar error
    }
  };

  // Función para insertar datos de negocio tras el primer login si no existe en la tabla
  const maybeInsertBusinessData = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🔍 Verificando si existe negocio para usuario:', supabaseUser.id);
      const { data: business, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', supabaseUser.id)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Error verificando negocio:', error);
        return;
      }
      
      if (!business) {
        console.log('📝 Negocio no existe, verificando datos en localStorage...');
        const regData = localStorage.getItem('fuddi-business-registration');
        if (regData) {
          console.log('✅ Datos de registro encontrados en localStorage');
          const businessData = JSON.parse(regData);
          console.log('📋 Datos del negocio:', businessData);
          
          // Manejar logo si existe
          let logoUrl = '';
          if (businessData.logo) {
            try {
              console.log('🖼️ Procesando logo...');
              // Convertir base64 a blob si es necesario
              let logoFile = businessData.logo;
              if (typeof businessData.logo === 'string' && businessData.logo.startsWith('data:')) {
                const response = await fetch(businessData.logo);
                logoFile = await response.blob();
              }
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('business-logos')
                .upload(`logos/${supabaseUser.id}`, logoFile, { upsert: true });
              
              if (!uploadError) {
                logoUrl = supabase.storage.from('business-logos').getPublicUrl(`logos/${supabaseUser.id}`).data.publicUrl;
                console.log('✅ Logo subido correctamente:', logoUrl);
              } else {
                console.error('❌ Error subiendo logo:', uploadError);
              }
            } catch (logoError) {
              console.error('❌ Error procesando logo:', logoError);
            }
          }
          
          // Insertar en la tabla businesses
          console.log('💾 Insertando negocio en la base de datos...');
          console.log('📋 Datos a insertar:', {
            id: supabaseUser.id,
            ...businessData,
            logo_url: logoUrl,
          });
          
          // Preparar datos con el formato correcto
          const insertData = {
            id: supabaseUser.id,
            email: businessData.email,
            business_name: businessData.business_name,
            category: businessData.category,
            description: businessData.description || '',
            address: businessData.address,
            opening_time: businessData.opening_time,
            closing_time: businessData.closing_time,
            logo_url: logoUrl || null,
            location_lat: businessData.location_lat || null,
            location_lng: businessData.location_lng || null,
          };
          
          console.log('📋 Datos formateados:', insertData);
          
          const { error: insertError } = await supabase.from('businesses').insert(insertData);
          
          if (!insertError) {
            console.log('✅ Negocio insertado correctamente');
            localStorage.removeItem('fuddi-business-registration');
            // Vuelve a determinar el tipo y redirige
            const userType = await determineUserType(supabaseUser);
            redirectUser(userType);
          } else {
            console.error('❌ Error insertando negocio:', insertError);
          }
        } else {
          console.log('❌ No se encontraron datos de registro en localStorage');
        }
      } else {
        console.log('✅ Negocio ya existe en la base de datos');
      }
    } catch (e) {
      console.error('❌ Error en maybeInsertBusinessData:', e);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fuddi-user', JSON.stringify(userData));
  };

  // Función para redirigir según el tipo de usuario
  const redirectUser = (userType: 'client' | 'business' | null) => {
    if (userType === 'business') {
      window.location.href = '/dashboard';
    } else if (userType === 'client') {
      window.location.href = '/home';
    } else {
      window.location.href = '/register/type';
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('fuddi-user');
  };

  const isBusiness = user?.type === 'business';
  const isClient = user?.type === 'client';
  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isBusiness,
    isClient,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
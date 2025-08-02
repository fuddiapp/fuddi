import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const LoginPage = () => {
  const handleClearSession = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-lobster text-fuddi-purple mb-2">Fuddi</h1>
        <p className="text-gray-600">Administra tus promociones e impulsa tu negocio</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearSession}
          className="text-xs text-gray-500"
        >
          Limpiar sesión
        </Button>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 Fuddi. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default LoginPage;

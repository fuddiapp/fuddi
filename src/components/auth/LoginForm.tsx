
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';

const LoginForm = () => {
  const navigate = useNavigate();
  // const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Respuesta de login manual:', data, authError);
      if (authError || !data.user) {
        setIsLoading(false);
        setError(authError?.message || 'Credenciales incorrectas');
        return;
      }
      // Buscar tipo de usuario en la base de datos
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();
      if (business && !businessError) {
        setIsLoading(false);
        navigate('/dashboard');
        return;
      }
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();
      if (client && !clientError) {
        setIsLoading(false);
        navigate('/home');
        return;
      }
      setIsLoading(false);
      setError('No se pudo determinar el tipo de usuario.');
    } catch (error) {
      console.error('Error inesperado en login:', error);
      setIsLoading(false);
      setError('Error inesperado durante el inicio de sesión');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Error en login con Google:', error);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Button 
                variant="link" 
                size="sm" 
                className="px-0 text-fuddi-purple"
                onClick={() => navigate('/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button 
            type="submit" 
            className="w-full bg-fuddi-purple hover:bg-fuddi-purple-light"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        <div className="my-4 flex items-center justify-center gap-2">
          <span className="h-px w-10 bg-muted-foreground/30" />
          <span className="text-xs text-muted-foreground">o</span>
          <span className="h-px w-10 bg-muted-foreground/30" />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg shadow-sm transition"
          onClick={handleGoogleLogin}
        >
          <FcGoogle className="w-5 h-5" />
          Iniciar sesión con Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4">
        <div className="text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Button variant="link" className="p-0 text-fuddi-purple" onClick={() => navigate('/register/type')}>
            Regístrate
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;

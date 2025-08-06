import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setError('Error inesperado durante el envío del correo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Correo enviado</CardTitle>
          <CardDescription className="text-center">
            Revisa tu bandeja de entrada para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
            Haz clic en el enlace del correo para restablecer tu contraseña.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={handleBackToLogin}
              className="w-full bg-fuddi-purple hover:bg-fuddi-purple-light"
            >
              Volver al login
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSuccess(false)}
              className="w-full"
            >
              Enviar otro correo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToLogin}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
        </div>
        <CardDescription>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button 
            type="submit" 
            className="w-full bg-fuddi-purple hover:bg-fuddi-purple-light"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar correo de recuperación'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm; 
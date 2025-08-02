import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EmailVerificationNotice = ({ email }: { email: string }) => {
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    await supabase.auth.resend({
      type: 'signup',
      email
    });
    setResent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-fuddi-purple/10 rounded-full flex items-center justify-center">
            <MailCheck className="h-8 w-8 text-fuddi-purple" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ¡Revisa tu correo!
          </CardTitle>
          <CardDescription className="text-lg">
            Te hemos enviado un correo de verificación a <b>{email}</b>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Haz clic en el enlace de verificación para activar tu cuenta.<br />
            Una vez verificado, podrás iniciar sesión y completar tu perfil.
          </p>
          <Button
            onClick={handleResend}
            className="w-full bg-fuddi-purple hover:bg-fuddi-purple-light"
            disabled={loading || resent}
          >
            {resent ? "Correo reenviado" : loading ? "Enviando..." : "Reenviar correo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationNotice; 
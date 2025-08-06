import React from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-lobster text-fuddi-purple mb-2">Fuddi</h1>
          <p className="text-gray-600">Recupera tu contraseña</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 
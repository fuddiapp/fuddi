import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-lobster text-fuddi-purple mb-2">Fuddi</h1>
        <p className="text-gray-600">Únete a nuestra plataforma y haz crecer tu negocio</p>
      </div>
      
      <RegisterForm />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 Fuddi. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default RegisterPage;

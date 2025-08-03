import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PromotionsProvider } from '@/contexts/PromotionsContext';
import { ClientPromotionsProvider } from '@/contexts/ClientPromotionsContext';
import { UserLocationProvider } from '@/contexts/UserLocationContext';
import { FollowedBusinessesProvider } from '@/contexts/FollowedBusinessesContext';

// Páginas de autenticación
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterTypePage from '@/pages/RegisterTypePage';
import ClientRegisterPage from '@/pages/ClientRegisterPage';
import BusinessRegisterPage from '@/pages/BusinessRegisterPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

// Páginas principales
import LandingPage from '@/pages/LandingPage';
import ClientHomePage from '@/pages/ClientHomePage';
import DashboardPage from '@/pages/DashboardPage';
import PromotionsPage from '@/pages/PromotionsPage';
import AllPromotionsPage from '@/pages/AllPromotionsPage';
import PromotionDetailPage from '@/pages/PromotionDetailPage';
import EditPromotionPage from '@/pages/EditPromotionPage';
import BusinessesPage from '@/pages/BusinessesPage';
import BusinessDetailPage from '@/pages/BusinessDetailPage';
import FollowedBusinessesPage from '@/pages/FollowedBusinessesPage';
import DailyMenuPage from '@/pages/DailyMenuPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/Profile';

// Componentes de layout
import BusinessRoute from '@/components/auth/BusinessRoute';

// Log de diagnóstico
console.log('🚀 App.tsx: Aplicación iniciando...');
console.log('🔍 App.tsx: Verificando variables de entorno básicas...');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada');

// Componente para proteger rutas públicas (landing page, login, register)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  console.log('🔒 App.tsx: PublicRoute renderizando...');
  // TEMPORAL: Habilitar useAuth con versión completamente nueva
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    // Si el usuario está autenticado, redirigir según su tipo
    if (user.type === 'business') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  console.log('🔄 App.tsx: AppRoutes renderizando...');
  return (
    <div className="min-h-screen bg-gray-50">
            <Routes>
        {/* Rutas públicas (protegidas para usuarios autenticados) */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="/register/type" element={
          <PublicRoute>
            <RegisterTypePage />
          </PublicRoute>
        } />
        <Route path="/register/client" element={
          <PublicRoute>
            <ClientRegisterPage />
          </PublicRoute>
        } />
        <Route path="/register/business" element={
          <PublicRoute>
            <BusinessRegisterPage />
          </PublicRoute>
        } />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              
        {/* Rutas de clientes */}
        <Route path="/home" element={<ClientHomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/promotions" element={<AllPromotionsPage />} />
        <Route path="/promotion/:id" element={<PromotionDetailPage />} />
        <Route path="/promotions/:id" element={<PromotionDetailPage />} />
        <Route path="/businesses" element={<BusinessesPage />} />
        <Route path="/businesses/:id" element={<BusinessDetailPage />} />
        <Route path="/followed" element={<FollowedBusinessesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
              
        {/* Rutas de negocios */}
              <Route path="/dashboard" element={
                <BusinessRoute>
                  <DashboardPage />
                </BusinessRoute>
              } />
        <Route path="/promotions/manage" element={
                <BusinessRoute>
                  <PromotionsPage />
                </BusinessRoute>
              } />
              <Route path="/promotions/edit/:id" element={
                <BusinessRoute>
                  <EditPromotionPage />
                </BusinessRoute>
              } />
              <Route path="/daily-menu" element={
                <BusinessRoute>
                  <DailyMenuPage />
                </BusinessRoute>
              } />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  console.log('🚀 App.tsx: Componente App renderizando...');
  return (
    <Router>
      {/* Habilitar TODOS los Context Providers */}
      <AuthProvider>
      <UserLocationProvider>
      <PromotionsProvider>
      <ClientPromotionsProvider>
      <FollowedBusinessesProvider>
        <AppRoutes />
      </FollowedBusinessesProvider>
          </ClientPromotionsProvider>
      </PromotionsProvider>
  </UserLocationProvider>
    </AuthProvider>
    </Router>
);
}

export default App;

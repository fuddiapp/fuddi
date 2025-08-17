import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PromotionsProvider } from '@/contexts/PromotionsContext';
import { ClientPromotionsProvider } from '@/contexts/ClientPromotionsContext';
import { UserLocationProvider } from '@/contexts/UserLocationContext';
import { FollowedBusinessesProvider } from '@/contexts/FollowedBusinessesContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Páginas de autenticación
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterTypePage from '@/pages/RegisterTypePage';
import ClientRegisterPage from '@/pages/ClientRegisterPage';
import BusinessRegisterPage from '@/pages/BusinessRegisterPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

// Páginas principales
import LandingPage from '@/pages/LandingPage';
import ClientHomePage from '@/pages/ClientHomePage';
import DashboardPage from '@/pages/DashboardPage';
import PromotionsPage from '@/pages/PromotionsPage';
import AllPromotionsPage from '@/pages/AllPromotionsPage';
import PromotionDetailPage from '@/pages/PromotionDetailPage';
import EditPromotionPage from '@/pages/EditPromotionPage';
import NewPromotionPage from '@/pages/NewPromotionPage';
import BusinessesPage from '@/pages/BusinessesPage';
import BusinessDetailPage from '@/pages/BusinessDetailPage';
import FollowedBusinessesPage from '@/pages/FollowedBusinessesPage';
import DailyMenuPage from '@/pages/DailyMenuPage';
import ProductsPage from '@/pages/ProductsPage';
import QRCodePage from '@/pages/QRCodePage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/Profile';
import AnalyticsPage from '@/pages/AnalyticsPage';

// Componentes de layout
import BusinessRoute from '@/components/auth/BusinessRoute';

// Componente para proteger rutas públicas (landing page, login, register)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
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
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
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
                  <ErrorBoundary
                    onError={(error, errorInfo) => {
                      console.error('Error en DashboardPage:', error, errorInfo);
                    }}
                  >
                    <DashboardPage />
                  </ErrorBoundary>
                </BusinessRoute>
              } />
        <Route path="/analytics" element={
          <BusinessRoute>
            <AnalyticsPage />
          </BusinessRoute>
        } />
        <Route path="/promotions/manage" element={
                <BusinessRoute>
                  <PromotionsPage />
                </BusinessRoute>
              } />
              <Route path="/promotions/new" element={
                <BusinessRoute>
                  <NewPromotionPage />
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
              <Route path="/products" element={
                <BusinessRoute>
                  <ProductsPage />
                </BusinessRoute>
              } />
              <Route path="/qr-codes" element={
                <BusinessRoute>
                  <QRCodePage />
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

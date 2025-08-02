import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { PromotionsProvider } from '@/contexts/PromotionsContext';
import { ClientPromotionsProvider } from '@/contexts/ClientPromotionsContext';
import { UserLocationProvider } from '@/contexts/UserLocationContext';
import { FollowedBusinessesProvider } from '@/contexts/FollowedBusinessesContext';

// Páginas de autenticación
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterTypePage from '@/pages/RegisterTypePage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

// Páginas principales
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

// Componentes de layout
import BusinessRoute from '@/components/auth/BusinessRoute';

// Log de diagnóstico
console.log('🚀 App.tsx: Aplicación iniciando...');
console.log('🔍 App.tsx: Verificando variables de entorno básicas...');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada');

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserLocationProvider>
          <PromotionsProvider>
            <ClientPromotionsProvider>
              <FollowedBusinessesProvider>
                <div className="min-h-screen bg-gray-50">
                  <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<ClientHomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/register/type" element={<RegisterTypePage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    
                    {/* Rutas de clientes */}
                    <Route path="/promotions" element={<AllPromotionsPage />} />
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
              </FollowedBusinessesProvider>
            </ClientPromotionsProvider>
          </PromotionsProvider>
        </UserLocationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

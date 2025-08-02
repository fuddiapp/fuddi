import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PromotionsProvider } from "./contexts/PromotionsContext";
import { ClientPromotionsProvider } from "./contexts/ClientPromotionsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserLocationProvider } from "./contexts/UserLocationContext";
import { FollowedBusinessesProvider } from "./contexts/FollowedBusinessesContext";
import { StrictMode } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterTypePage from "./pages/RegisterTypePage";
import ClientRegisterPage from "./pages/ClientRegisterPage";
import BusinessRegisterPage from "./pages/BusinessRegisterPage";
import BusinessInfoPage from "./pages/BusinessInfoPage";
import ClientPage from "./pages/ClientPage";
import BusinessesPage from "./pages/BusinessesPage";
import BusinessDetailPage from "./pages/BusinessDetailPage";
import DashboardPage from "./pages/DashboardPage";
import PromotionsPage from "./pages/PromotionsPage";
import NewPromotionPage from "./pages/NewPromotionPage";
import EditPromotionPage from "./pages/EditPromotionPage";
import PromotionDetailPage from "./pages/PromotionDetailPage";
import AllPromotionsPage from "./pages/AllPromotionsPage";
import FollowedBusinessesPage from "./pages/FollowedBusinessesPage";
import AddressDemoPage from "./pages/AddressDemoPage";

import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import QRCodePage from "./pages/QRCodePage";
import DailyMenuPage from "./pages/DailyMenuPage";
import ProductsPage from './pages/ProductsPage';
import BusinessRoute from './components/auth/BusinessRoute';
import ProfilePage from './pages/Profile';
import AuthCallbackPage from './pages/AuthCallbackPage';

const queryClient = new QueryClient();

const App = () => (
  <StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserLocationProvider>
      <FollowedBusinessesProvider>
        <PromotionsProvider>
            <ClientPromotionsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Landing */}
              <Route path="/" element={<LandingPage />} />
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/type" element={<RegisterTypePage />} />
              <Route path="/register/client" element={<ClientRegisterPage />} />
              <Route path="/register/business" element={<BusinessRegisterPage />} />
              <Route path="/business-info" element={<BusinessInfoPage />} />
              <Route path="/address-demo" element={<AddressDemoPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              
                {/* Client routes independientes */}
              <Route path="/client" element={<ClientPage />} />
              <Route path="/businesses" element={<BusinessesPage />} />
              <Route path="/followed" element={<FollowedBusinessesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/business/:id" element={<BusinessDetailPage />} />
              <Route path="/promotion/:id" element={<PromotionDetailPage />} />
              <Route path="/all-promotions" element={<AllPromotionsPage />} />
              
              {/* Protected business routes */}
              <Route path="/dashboard" element={
                <BusinessRoute>
                  <DashboardPage />
                </BusinessRoute>
              } />
              <Route path="/promotions" element={
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
              <Route path="/qr-codes" element={
                <BusinessRoute>
                  <QRCodePage />
                </BusinessRoute>
              } />
              <Route path="/daily-menu" element={
                <BusinessRoute>
                  <DailyMenuPage />
                </BusinessRoute>
              } />

              <Route path="/settings" element={
                <BusinessRoute>
                  <SettingsPage />
                </BusinessRoute>
              } />
              <Route path="/products" element={
                <BusinessRoute>
                  <ProductsPage />
                </BusinessRoute>
              } />
              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
          </ClientPromotionsProvider>
      </PromotionsProvider>
    </FollowedBusinessesProvider>
  </UserLocationProvider>
    </AuthProvider>
  </QueryClientProvider>
  </StrictMode>
);

export default App;

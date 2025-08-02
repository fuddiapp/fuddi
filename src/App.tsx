import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { PromotionsProvider } from '@/contexts/PromotionsContext';
import { ClientPromotionsProvider } from '@/contexts/ClientPromotionsContext';
import { UserLocationProvider } from '@/contexts/UserLocationContext';
import { FollowedBusinessesProvider } from '@/contexts/FollowedBusinessesContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

// Páginas de autenticación
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RegisterTypePage from '@/pages/RegisterTypePage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

// Páginas principales
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import PromotionsPage from '@/pages/PromotionsPage';
import AllPromotionsPage from '@/pages/AllPromotionsPage';
import PromotionDetailPage from '@/pages/PromotionDetailPage';
import CreatePromotionPage from '@/pages/CreatePromotionPage';
import EditPromotionPage from '@/pages/EditPromotionPage';
import BusinessesPage from '@/pages/BusinessesPage';
import BusinessDetailPage from '@/pages/BusinessDetailPage';
import FollowedBusinessesPage from '@/pages/FollowedBusinessesPage';
import DailyMenuPage from '@/pages/DailyMenuPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';

// Componentes de layout
import BusinessRoute from '@/components/auth/BusinessRoute';
import ClientRoute from '@/components/auth/ClientRoute';
import DatabaseSetupAlert from '@/components/ui/database-setup-alert';

// Log de diagnóstico
console.log('🚀 App.tsx: Aplicación iniciando...');
console.log('🔍 App.tsx: Verificando variables de entorno básicas...');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('VITE_GOOGLE_MAPS_API_KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✅ Configurada' : '❌ No configurada');

function App() {

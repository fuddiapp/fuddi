import ClientLayout from './components/layout/ClientLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterTypePage from './pages/RegisterTypePage';
import ClientRegisterPage from './pages/ClientRegisterPage';
import BusinessRegisterPage from './pages/BusinessRegisterPage';
import BusinessInfoPage from './pages/BusinessInfoPage';
import AddressDemoPage from './pages/AddressDemoPage';
import ClientHomePage from './pages/ClientHomePage';
import BusinessesPage from './pages/BusinessesPage';
import FollowedBusinessesPage from './pages/FollowedBusinessesPage';
import ProfilePage from './pages/ProfilePage';
import BusinessDetailPage from './pages/BusinessDetailPage';
import PromotionDetailPage from './pages/PromotionDetailPage';
import NotFound from './pages/NotFound';

function App() {
  return (
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

      {/* Client routes agrupadas bajo ClientLayout */}
      <Route path="/client" element={<ClientLayout />}>
        <Route index element={<ClientHomePage />} />
        <Route path="businesses" element={<BusinessesPage />} />
        <Route path="followed" element={<FollowedBusinessesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="/business/:id" element={<BusinessDetailPage />} />
      <Route path="/promotion/:id" element={<PromotionDetailPage />} />

      {/* Protected business routes */}
      {/* Not found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App; 
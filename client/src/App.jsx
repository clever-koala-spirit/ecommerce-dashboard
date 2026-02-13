import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import { useShopify } from './providers/ShopifyProvider';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ForecastPage from './pages/ForecastPage';
import SettingsPage from './pages/SettingsPage';
import ConnectPage from './pages/ConnectPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Lazy load legal pages
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1117' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading Slay Season...</p>
      </div>
    </div>
  );
}

// Protected route wrapper — requires user auth OR Shopify auth
function ProtectedRoute({ children }) {
  const { isAuthenticated: isUserAuth, isLoading: isUserLoading } = useAuth();
  const { isAuthenticated: isShopifyAuth, isLoading: isShopifyLoading } = useShopify();

  if (isUserLoading || isShopifyLoading) {
    return <LoadingScreen />;
  }

  // Allow access if authenticated via either method
  if (isUserAuth || isShopifyAuth) {
    return children;
  }

  // Not authenticated — redirect to login
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* === PUBLIC ROUTES === */}

        {/* Marketing landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Legal pages */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Shopify connect page (for embedded app flow) */}
        <Route path="/connect" element={<ConnectPage />} />

        {/* === PROTECTED ROUTES (require login) === */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all: redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import { useShopify } from './providers/ShopifyProvider';
import ErrorBoundary from './components/common/ErrorBoundary';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ForecastPage from './pages/ForecastPage';
import SettingsPage from './pages/SettingsPage';
import ConnectPage from './pages/ConnectPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

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
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* === PUBLIC ROUTES === */}

          {/* Marketing landing page */}
          <Route path="/" element={
            <ErrorBoundary>
              <LandingPage />
            </ErrorBoundary>
          } />

          {/* Auth pages */}
          <Route path="/login" element={
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          } />
          <Route path="/signup" element={
            <ErrorBoundary>
              <SignupPage />
            </ErrorBoundary>
          } />
          <Route path="/forgot-password" element={
            <ErrorBoundary>
              <ForgotPasswordPage />
            </ErrorBoundary>
          } />

          {/* Legal pages */}
          <Route path="/privacy" element={
            <ErrorBoundary>
              <PrivacyPage />
            </ErrorBoundary>
          } />
          <Route path="/terms" element={
            <ErrorBoundary>
              <TermsPage />
            </ErrorBoundary>
          } />

          {/* Shopify connect page (for embedded app flow) */}
          <Route path="/connect" element={
            <ErrorBoundary>
              <ConnectPage />
            </ErrorBoundary>
          } />

          {/* === PROTECTED ROUTES (require login) === */}
          <Route element={
            <ErrorBoundary>
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          }>
            <Route path="/dashboard" element={
              <ErrorBoundary>
                <DashboardPage />
              </ErrorBoundary>
            } />
            <Route path="/forecast" element={
              <ErrorBoundary>
                <ForecastPage />
              </ErrorBoundary>
            } />
            <Route path="/settings" element={
              <ErrorBoundary>
                <SettingsPage />
              </ErrorBoundary>
            } />
          </Route>

          {/* 404 page for unknown routes */}
          <Route path="*" element={
            <ErrorBoundary>
              <NotFoundPage />
            </ErrorBoundary>
          } />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

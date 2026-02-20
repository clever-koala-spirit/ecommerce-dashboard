import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import { useShopify } from './providers/ShopifyProvider';
import ErrorBoundary from './components/common/ErrorBoundary';
import DashboardLayout from './components/layout/DashboardLayout';
import ChatWidget from './components/chat/ChatWidget';

// Lazy load all pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ForecastPage = lazy(() => import('./pages/ForecastPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ConnectPage = lazy(() => import('./pages/ConnectPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const GdprPage = lazy(() => import('./pages/GdprPage'));
const AcademyPage = lazy(() => import('./pages/AcademyPage'));
const ProfitLossPage = lazy(() => import('./pages/ProfitLossPage'));
const MarketingPage = lazy(() => import('./pages/MarketingPage'));
const LtvCohortPage = lazy(() => import('./pages/LtvCohortPage'));
const PredictionsDashboard = lazy(() => import('./components/predictions/PredictionsDashboard'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary, #0a0b0f)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm" style={{ color: 'var(--color-text-secondary, #86868b)' }}>Loading Slay Season...</p>
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
          <Route path="/auth-callback" element={
            <ErrorBoundary>
              <AuthCallbackPage />
            </ErrorBoundary>
          } />

          {/* Public pages */}
          <Route path="/about" element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />
          <Route path="/pricing" element={<ErrorBoundary><PricingPage /></ErrorBoundary>} />
          <Route path="/blog" element={<ErrorBoundary><BlogPage /></ErrorBoundary>} />
          <Route path="/contact" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
          <Route path="/help" element={<ErrorBoundary><HelpPage /></ErrorBoundary>} />
          <Route path="/integrations" element={<ErrorBoundary><IntegrationsPage /></ErrorBoundary>} />
          <Route path="/security" element={<ErrorBoundary><SecurityPage /></ErrorBoundary>} />
          <Route path="/gdpr" element={<ErrorBoundary><GdprPage /></ErrorBoundary>} />
          <Route path="/academy" element={<ErrorBoundary><AcademyPage /></ErrorBoundary>} />

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
            <Route path="/orders" element={
              <ErrorBoundary>
                <OrdersPage />
              </ErrorBoundary>
            } />
            <Route path="/products" element={
              <ErrorBoundary>
                <ProductsPage />
              </ErrorBoundary>
            } />
            <Route path="/customers" element={
              <ErrorBoundary>
                <CustomersPage />
              </ErrorBoundary>
            } />
            <Route path="/reports" element={
              <ErrorBoundary>
                <ReportsPage />
              </ErrorBoundary>
            } />
            <Route path="/profit-loss" element={
              <ErrorBoundary>
                <ProfitLossPage />
              </ErrorBoundary>
            } />
            <Route path="/marketing" element={
              <ErrorBoundary>
                <MarketingPage />
              </ErrorBoundary>
            } />
            <Route path="/ltv" element={
              <ErrorBoundary>
                <LtvCohortPage />
              </ErrorBoundary>
            } />
            <Route path="/forecast" element={
              <ErrorBoundary>
                <ForecastPage />
              </ErrorBoundary>
            } />
            <Route path="/predictions" element={
              <ErrorBoundary>
                <PredictionsDashboard />
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
        {/* Global chat widget - appears on all pages */}
        <ChatWidget />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

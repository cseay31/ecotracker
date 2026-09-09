import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import WebMcpTools from '@/components/WebMcpTools';
import GlobalBanner from '@/components/GlobalBanner';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Onboarding from '@/pages/Onboarding';
import Splash from '@/pages/Splash';
import Home from '@/pages/Home';
import Scanner from '@/pages/Scanner';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import Observations from '@/pages/Observations';
import Status from '@/pages/Status';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Connect from '@/pages/Connect';
import Forums from '@/pages/Forums';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import ConsentGate from '@/pages/ConsentGate';
import AdminRoute from '@/components/AdminRoute';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, isAuthenticated } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Existing users who haven't accepted the current Privacy Policy + Terms and
  // confirmed their age must do so before using any part of the app.
  const needsConsent =
    isAuthenticated && user && (!user.privacy_accepted || !user.tos_accepted || !user.age_confirmed_over_13);

  if (needsConsent) {
    return (
      <Routes>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<ConsentGate />} />
      </Routes>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/" element={<Splash />} />
      <Route path="/map" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/connect" element={<Connect />} />
      <Route path="/forums" element={<Forums />} />
      <Route path="/onboarding" element={
        <ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />}>
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/status" element={<Status />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/observations" element={<AdminRoute><Observations /></AdminRoute>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <WebMcpTools />
          <GlobalBanner />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
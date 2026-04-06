import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DataGovernance from "./pages/DataGovernance";
import IPPolicy from "./pages/IPPolicy";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateAccount from "./pages/CreateAccount";
import NotFound from "./pages/NotFound";
import Affiliate from "./pages/Affiliate";
import CurrencyConverter from "./pages/CurrencyConverter";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import CookieConsent from "@/components/CookieConsent";

const queryClient = new QueryClient();

const SessionTimeoutWrapper = ({ children }: { children: React.ReactNode }) => {
  useSessionTimeout();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SessionTimeoutWrapper>
              <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
                <Route path="/terms" element={<Layout><TermsOfService /></Layout>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/create-account" element={<CreateAccount />} />
                <Route path="/affiliate" element={<ProtectedRoute><Affiliate /></ProtectedRoute>} />
                <Route path="/converter" element={<CurrencyConverter />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SessionTimeoutWrapper>
            <CookieConsent />
          </AuthProvider>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
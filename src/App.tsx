import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { isConfigured } from "@/lib/supabase";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import Setup from "./pages/Setup";

const queryClient = new QueryClient();

// Routes that require Supabase configuration
const AuthenticatedApp = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/setup" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

// Routes when Supabase is NOT configured
const SetupApp = () => (
  <Routes>
    <Route path="/setup" element={<Setup />} />
    <Route path="*" element={<Navigate to="/setup" replace />} />
  </Routes>
);

const App = () => {
  const [configured, setConfigured] = useState(() => isConfigured());

  useEffect(() => {
    // Listen for storage changes (when config is saved)
    const handleStorage = () => {
      setConfigured(isConfigured());
    };

    window.addEventListener('storage', handleStorage);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(() => {
      const newConfigured = isConfigured();
      if (newConfigured !== configured) {
        setConfigured(newConfigured);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [configured]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {configured ? <AuthenticatedApp /> : <SetupApp />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isConfigured } from '@/lib/supabase';
import Auth from './Auth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if Supabase is configured
    const isSetup = isConfigured();
    setConfigured(isSetup);
    
    if (!isSetup) {
      navigate('/setup');
    }
  }, [navigate]);

  // If not configured, redirect will happen
  if (configured === false || configured === null) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only render Auth component if configured
  return <AuthWrapper />;
};

// Separate component to avoid using auth hook when not configured
const AuthWrapper = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Auth />;
};

export default Index;

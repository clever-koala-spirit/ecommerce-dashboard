import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (error) {
      // Handle OAuth errors
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token) {
      // Save the token and redirect to dashboard
      const shop = searchParams.get('shop');
      if (shop) {
        localStorage.setItem('ss_shop', shop);
      }
      setToken(token);
      localStorage.setItem('ss_token', token);
      navigate('/dashboard');
    } else {
      // No token found
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, setToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#1a1b23] to-[#0a0b0f] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Completing sign in...</h1>
        <p className="text-gray-400">Please wait while we set up your account</p>
      </div>
    </div>
  );
}
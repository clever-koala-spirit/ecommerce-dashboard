import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Phone, Hash } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, requestOtp, verifyOtp } = useAuth();

  const [authMode, setAuthMode] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for error in URL params (from social OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      setError(urlError);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('ss_remember_email', email);
      } else {
        localStorage.removeItem('ss_remember_email');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1c2033] to-[#0f1117] relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/50">
              <span className="text-white font-bold text-xl">SS</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-300 bg-clip-text text-transparent mb-2">
              Slay Season
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to your dashboard
            </p>
          </div>

          {/* Login Card - Glass Morphism */}
          <div className="relative group mb-6">
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500 animate-pulse" />

            <div className="relative bg-gradient-to-b from-[#1c2033]/90 to-[#151922]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-2xl">
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-5">
                <a href={`${import.meta.env.VITE_API_URL || ''}/api/auth/shopify?shop=`}
                  onClick={(e) => {
                    e.preventDefault();
                    const shop = prompt('Enter your Shopify store domain (e.g. mystore.myshopify.com)');
                    if (shop) window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/shopify?shop=${encodeURIComponent(shop)}`;
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#96bf48]/10 border border-[#96bf48]/30 hover:border-[#96bf48]/60 rounded-xl text-[#96bf48] font-medium transition-all duration-200 cursor-pointer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.34 3.04c-.14-.05-.28-.01-.37.1-.07.1-1.62 1.87-1.62 1.87s-.44-.1-.98-.17c-.14-.75-.39-1.8-.69-2.4-.76-1.52-1.71-1.58-2.12-1.53-.05 0-.1.01-.15.02C8.96.64 8.56.03 8.14.01c-.02 0-.04 0-.06 0-.34.02-.62.27-.84.76-.4.87-.63 2.22-.7 2.84-1.2.37-2.04.63-2.13.66-.66.21-.68.23-.77.85C3.55 5.73 2 17.64 2 17.64l10.97 1.9L20 17.98s-4.53-14.71-4.66-15.14zM10.5 5.07v-.16c0-.56.08-1.3.22-1.82.56.1.93.71 1.1 1.14-.44.1-.88.22-1.32.33v.5zm1.5-3.15c.18 0 .35.09.5.26.35.38.62 1.08.72 1.74-.53.16-1.12.35-1.64.5.17-.73.48-1.7.89-2.22.11-.13.27-.22.42-.26.04-.01.08-.02.11-.02zM9.5 1.28c.05 0 .15.01.28.1.53.32.88 1.63 1 2.31-.64.2-1.34.42-1.97.61.24-1.18.58-2.54.93-2.93.05-.05.1-.08.16-.09h.01z"/></svg>
                  Sign in with Shopify
                </a>
                <button onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/auth/oauth/google`; }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 hover:border-white/30 rounded-xl text-gray-300 font-medium transition-all duration-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Sign in with Google
                </button>
                <div className="flex gap-3">
                  <button onClick={() => alert('Facebook login not available yet')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 hover:border-white/30 rounded-xl text-gray-400 text-sm font-medium transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </button>
                  <button onClick={() => alert('Apple login not available yet')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 hover:border-white/30 rounded-xl text-gray-400 text-sm font-medium transition-all">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    Apple
                  </button>
                </div>
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-indigo-500/20"></div>
                  <span className="text-xs text-gray-500 uppercase">or</span>
                  <div className="flex-1 h-px bg-indigo-500/20"></div>
                </div>
              </div>

              {/* Auth Mode Toggle */}
              <div className="flex rounded-xl bg-[#0f1117]/50 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMode('email'); setError(''); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${authMode === 'email' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />Email
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('phone'); setError(''); setOtpSent(false); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${authMode === 'phone' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-400 hover:text-gray-300'}`}
                >
                  <Phone className="w-4 h-4 inline mr-2" />Phone
                </button>
              </div>

              {authMode === 'email' ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading}
                        className="w-full pl-12 pr-12 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading} className="absolute right-4 top-3.5 text-gray-400 hover:text-indigo-400 transition disabled:opacity-50">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center mt-0.5"><span className="text-red-400 text-xs">!</span></div>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={isLoading}
                        className="w-4 h-4 rounded-lg bg-indigo-500/20 border border-indigo-500/50 checked:bg-indigo-500 checked:border-indigo-500 accent-indigo-500 cursor-pointer disabled:opacity-50" />
                      <span className="text-sm text-gray-400">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition font-medium">Forgot password?</Link>
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center gap-2 group">
                    {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Signing in...</>) : (<>Sign in<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>)}
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  {!otpSent ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" disabled={isLoading}
                            className="w-full pl-12 pr-4 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center mt-0.5"><span className="text-red-400 text-xs">!</span></div>
                          <p className="text-red-300 text-sm">{error}</p>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={isLoading || !phone.trim()}
                        onClick={async () => {
                          setIsLoading(true); setError('');
                          try { await requestOtp(phone); setOtpSent(true); }
                          catch (err) { setError(err.message); }
                          finally { setIsLoading(false); }
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                        {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Sending code...</>) : (<>Send verification code<ArrowRight className="w-5 h-5" /></>)}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400 text-center">We sent a 6-digit code to <span className="text-indigo-300 font-medium">{phone}</span></p>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                          <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} disabled={isLoading}
                            className="w-full pl-12 pr-4 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 text-center text-2xl tracking-[0.5em] font-mono" />
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center mt-0.5"><span className="text-red-400 text-xs">!</span></div>
                          <p className="text-red-300 text-sm">{error}</p>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={isLoading || otpCode.length !== 6}
                        onClick={async () => {
                          setIsLoading(true); setError('');
                          try { await verifyOtp(phone, otpCode); navigate('/dashboard'); }
                          catch (err) { setError(err.message); }
                          finally { setIsLoading(false); }
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                        {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Verifying...</>) : (<>Verify & Sign in<ArrowRight className="w-5 h-5" /></>)}
                      </button>

                      <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }} className="w-full text-sm text-gray-400 hover:text-indigo-300 transition py-2">
                        ← Use a different number
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Security Info */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>🔒 Your data is encrypted and secure</p>
            <p>
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-indigo-400 hover:text-indigo-300">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

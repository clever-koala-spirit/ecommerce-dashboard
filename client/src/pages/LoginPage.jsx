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
              {/* Social Auth Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/oauth/google`}
                  className="w-full px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-3 group"
                >
                  <div className="w-5 h-5 bg-[#4285f4] rounded flex items-center justify-center text-white text-xs font-bold">G</div>
                  Continue with Google
                </button>
                
                <button
                  type="button" 
                  onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/oauth/shopify`}
                  className="w-full px-4 py-3 bg-[#95bf47] hover:bg-[#7ba92f] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-3 group"
                >
                  <div className="w-5 h-5 bg-white rounded flex items-center justify-center text-[#95bf47] text-xs font-bold">S</div>
                  Continue with Shopify
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/oauth/facebook`}
                    className="px-4 py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    <div className="w-4 h-4 bg-white rounded flex items-center justify-center text-[#1877f2] text-xs font-bold">f</div>
                    Facebook
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/oauth/apple`}
                    className="px-4 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    <div className="w-4 h-4 bg-white rounded flex items-center justify-center text-black text-xs font-bold">🍎</div>
                    Apple
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-indigo-500/20"></div>
                <span className="px-4 text-sm text-gray-400">or continue with</span>
                <div className="flex-1 border-t border-indigo-500/20"></div>
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

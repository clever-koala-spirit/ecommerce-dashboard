import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, Check, Phone, Hash } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, requestOtp, verifyOtp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [authMode, setAuthMode] = useState('email'); // 'email' or 'phone'
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: 'bg-gray-600' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { level: 2, label: 'Medium', color: 'bg-yellow-500' };
    return { level: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = () => {
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }

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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signup(fullName, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
              Create your account and start analyzing
            </p>
          </div>

          {/* Signup Card - Glass Morphism */}
          <div className="relative group mb-6">
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500 animate-pulse" />

            <div className="relative bg-gradient-to-b from-[#1c2033]/90 to-[#151922]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                <span className="px-4 text-sm text-gray-400">or sign up with</span>
                <div className="flex-1 border-t border-indigo-500/20"></div>
              </div>

              {/* Auth Mode Toggle */}
              <div className="flex rounded-xl bg-[#0f1117]/50 p-1 mb-5">
                <button type="button" onClick={() => { setAuthMode('email'); setError(''); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${authMode === 'email' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-400 hover:text-gray-300'}`}>
                  <Mail className="w-4 h-4 inline mr-2" />Email
                </button>
                <button type="button" onClick={() => { setAuthMode('phone'); setError(''); setOtpSent(false); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${authMode === 'phone' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-gray-400 hover:text-gray-300'}`}>
                  <Phone className="w-4 h-4 inline mr-2" />Phone
                </button>
              </div>

              {authMode === 'phone' ? (
                <div className="space-y-4">
                  {!otpSent ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" disabled={isLoading}
                            className="w-full pl-12 pr-4 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50" />
                        </div>
                      </div>
                      {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl"><p className="text-red-300 text-sm">{error}</p></div>
                      )}
                      <button type="button" disabled={isLoading || !phone.trim()} onClick={async () => {
                        setIsLoading(true); setError('');
                        try { await requestOtp(phone); setOtpSent(true); } catch (err) { setError(err.message); } finally { setIsLoading(false); }
                      }} className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                        {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Sending...</>) : (<>Send verification code<ArrowRight className="w-5 h-5" /></>)}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400 text-center">Enter the 6-digit code sent to <span className="text-indigo-300 font-medium">{phone}</span></p>
                      <div className="relative">
                        <Hash className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                        <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} disabled={isLoading}
                          className="w-full pl-12 pr-4 py-3 bg-[#0f1117]/50 border border-indigo-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center text-2xl tracking-[0.5em] font-mono" />
                      </div>
                      {error && (<div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl"><p className="text-red-300 text-sm">{error}</p></div>)}
                      <button type="button" disabled={isLoading || otpCode.length !== 6} onClick={async () => {
                        setIsLoading(true); setError('');
                        try { await verifyOtp(phone, otpCode); navigate('/dashboard'); } catch (err) { setError(err.message); } finally { setIsLoading(false); }
                      }} className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                        {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Verifying...</>) : (<>Create account<ArrowRight className="w-5 h-5" /></>)}
                      </button>
                      <button type="button" onClick={() => { setOtpSent(false); setOtpCode(''); setError(''); }} className="w-full text-sm text-gray-400 hover:text-indigo-300 transition py-2">← Different number</button>
                    </>
                  )}
                  <p className="mt-3 text-center text-gray-400 text-sm">Already have an account?{' '}<Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">Sign in</Link></p>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className="w-full pl-12 pr-4 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pl-12 pr-12 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-indigo-400 transition disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Password strength:</span>
                        <span className={`text-xs font-semibold ${passwordStrength.color === 'bg-red-500' ? 'text-red-400' : passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-400' : 'text-green-400'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{
                            width: `${(passwordStrength.level / 3) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-indigo-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="w-full pl-12 pr-12 py-3 bg-[#0f1117]/50 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-indigo-400 transition disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      {password === confirmPassword ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-400">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-red-500/30 flex items-center justify-center">
                            <span className="text-red-400 text-xs font-bold">!</span>
                          </div>
                          <span className="text-xs text-red-400">Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-red-400 text-xs">!</span>
                    </div>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Terms Agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded-lg bg-indigo-500/20 border border-indigo-500/50 checked:bg-indigo-500 checked:border-indigo-500 accent-indigo-500 cursor-pointer mt-1 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-400">
                    I agree to the{' '}
                    <Link to="/terms" className="text-indigo-400 hover:text-indigo-300 font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center gap-2 group mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              {/* Login Link */}
              <p className="mt-5 text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
                >
                  Sign in
                </Link>
              </p>
              </form>
              )}
            </div>
          </div>

          {/* Security Info */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>🔒 Your data is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

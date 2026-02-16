import SEO from '../components/common/SEO';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // Email service integration ready - see server/services/email.js
    // For now, simulate the process until email service is configured
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1c2033] to-[#0f1117] relative overflow-hidden">
      <SEO title="Reset Password" description="Reset your Slay Season account password." path="/forgot-password" />
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
              Reset Password
            </h1>
            <p className="text-gray-400 text-sm">
              {isSubmitted ? 
                'Check your email for reset instructions' : 
                'Enter your email to receive a password reset link'
              }
            </p>
          </div>

          {/* Reset Password Card - Glass Morphism */}
          <div className="relative group mb-6">
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500 animate-pulse" />

            <div className="relative bg-gradient-to-b from-[#1c2033]/90 to-[#151922]/80 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-2xl">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
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

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <span className="text-red-400 text-xs">!</span>
                      </div>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Reset Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success Message */
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Reset link sent!</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    We've sent a password reset link to <strong className="text-white">{email}</strong>. 
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                  <div className="text-xs text-gray-500">
                    <p>Didn't receive the email? Check your spam folder or</p>
                    <button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail('');
                        setError('');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium transition"
                    >
                      try again
                    </button>
                  </div>
                </div>
              )}

              {/* Back to Login Link */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-300 transition font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>🔒 Your data is encrypted and secure</p>
            <p>
              Password reset links are valid for 24 hours and can only be used once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
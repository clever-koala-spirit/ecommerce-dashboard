import SEO from '../components/common/SEO';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Zap } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#f0f2f8] flex items-center justify-center relative overflow-hidden">
      <SEO title="Page Not Found" description="The page you are looking for does not exist." path="/404" />
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a855f7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            Slay Season
          </span>
        </div>

        {/* 404 Visual */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent mb-4 tracking-tight">
            404
          </h1>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 blur-xl rounded-full"></div>
            <Search className="relative w-16 h-16 mx-auto text-[#8b92b0] animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-[#1c2033]/60 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-[#8b92b0] mb-6 leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0f1117]/50 border border-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">New to Slay Season?</h3>
              <p className="text-sm text-[#8b92b0] mb-3">Start with our main marketing page</p>
              <button
                onClick={() => navigate('/')}
                className="text-[#6366f1] hover:text-[#a855f7] text-sm font-medium transition-colors"
              >
                Visit Homepage →
              </button>
            </div>
            
            <div className="bg-[#0f1117]/50 border border-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Existing User?</h3>
              <p className="text-sm text-[#8b92b0] mb-3">Access your analytics dashboard</p>
              <button
                onClick={() => navigate('/login')}
                className="text-[#6366f1] hover:text-[#a855f7] text-sm font-medium transition-colors"
              >
                Sign In →
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#6366f1]/30 text-white hover:bg-[#6366f1]/10 transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Home Page
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-[#8b92b0] mt-8">
          Still can't find what you're looking for? 
          <br />
          <span className="text-[#6366f1] hover:text-[#a855f7] cursor-pointer transition-colors">
            Contact our support team
          </span>
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Apply animation to content */
        .relative.z-10 {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
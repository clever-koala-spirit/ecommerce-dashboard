/**
 * Connect Page — Shown when no shop is authenticated
 * Clean onboarding experience for new merchants
 */
import { useState } from 'react';
import { useShopify } from '../providers/ShopifyProvider';

export default function ConnectPage() {
  const { connectShop, isLoading } = useShopify();
  const [shopUrl, setShopUrl] = useState('');
  const [error, setError] = useState('');

  const handleConnect = (e) => {
    e.preventDefault();
    setError('');

    const cleaned = shopUrl.trim().toLowerCase()
      .replace('https://', '')
      .replace('http://', '')
      .replace('/admin', '')
      .replace('/', '');

    if (!cleaned) {
      setError('Please enter your Shopify store URL');
      return;
    }

    connectShop(cleaned);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Slay Season
          </h1>
          <p className="mt-2 text-gray-400 text-lg">
            Ecommerce Analytics That Actually Works
          </p>
        </div>

        {/* Connect Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-2">
            Connect Your Store
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            One-click install. Your data stays encrypted and secure.
          </p>

          <form onSubmit={handleConnect}>
            <div className="relative">
              <input
                type="text"
                value={shopUrl}
                onChange={(e) => setShopUrl(e.target.value)}
                placeholder="yourstore.myshopify.com"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
            >
              {isLoading ? 'Connecting...' : 'Connect Shopify Store'}
            </button>
          </form>

          {/* Security badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              AES-256 Encrypted
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5C18.047 5.749 18 7.348 18 8c0 4.991-5.539 10.193-7.399 11.799a1 1 0 01-1.202 0C7.539 18.193 2 12.991 2 8c0-.652-.047-2.251.166-3.001z" clipRule="evenodd" />
              </svg>
              GDPR Compliant
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Shopify Verified
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs text-gray-400">Real-time analytics across all channels</p>
          </div>
          <div className="p-3">
            <div className="text-2xl mb-1">🤖</div>
            <p className="text-xs text-gray-400">AI-powered forecasting & insights</p>
          </div>
          <div className="p-3">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-gray-400">True profit tracking with COGS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

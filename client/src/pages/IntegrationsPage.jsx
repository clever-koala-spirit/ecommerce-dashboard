import SEO from '../components/common/SEO';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, BarChart3, Target, Users, Mail, Video } from 'lucide-react';

const integrations = [
  { name: 'Shopify', icon: <ShoppingBag className="w-6 h-6" />, color: 'from-green-500 to-emerald-600', desc: 'Pull real-time orders, refunds, shipping costs, and product data directly from your Shopify store. The foundation of your true profit calculations.' },
  { name: 'Google Ads', icon: <Target className="w-6 h-6" />, color: 'from-blue-500 to-blue-600', desc: 'Import campaign spend, clicks, conversions, and ROAS data. See exactly how your Google Ads budget translates to real profit.' },
  { name: 'Google Analytics 4', icon: <BarChart3 className="w-6 h-6" />, color: 'from-amber-500 to-orange-600', desc: 'Enrich your dashboard with GA4 traffic, conversion paths, and attribution data for a complete view of your funnel.' },
  { name: 'Meta Ads', icon: <Users className="w-6 h-6" />, color: 'from-blue-600 to-indigo-600', desc: 'Connect Facebook and Instagram ad accounts to track spend, CPAs, and ROAS across all your Meta campaigns.' },
  { name: 'Klaviyo', icon: <Mail className="w-6 h-6" />, color: 'from-purple-500 to-violet-600', desc: 'Attribute revenue from email and SMS flows. Understand which Klaviyo campaigns drive the most profit, not just revenue.' },
  { name: 'TikTok Ads', icon: <Video className="w-6 h-6" />, color: 'from-pink-500 to-rose-600', desc: 'Track TikTok ad spend and conversions alongside your other channels. Perfect for brands scaling on short-form video.' },
];

const IntegrationsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased min-h-screen">
      <SEO title="Integrations" description="Connect Shopify, Meta Ads, Google Ads, Klaviyo and more in minutes." path="/integrations" />
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050608]/80 backdrop-blur-xl border-b border-white/[.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-[#6b7194] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Integrations</h1>
        <p className="text-lg text-[#6b7194] mb-14 max-w-2xl">Connect all your data sources in minutes. Slay Season pulls everything together so you can see true profit — not just revenue.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {integrations.map((item) => (
            <div key={item.name} className="rounded-2xl border border-white/[.06] bg-white/[.02] p-6 hover:border-white/[.12] transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
              </div>
              <p className="text-sm text-[#6b7194] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-white/[.06] bg-white/[.02] p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">More integrations coming soon</h2>
          <p className="text-[#6b7194] mb-6">Snapchat Ads, Pinterest Ads, Amazon, and more. We add new integrations monthly based on user requests.</p>
          <button onClick={() => navigate('/contact')} className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            Request an Integration
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;

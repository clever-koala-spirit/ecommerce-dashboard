import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Shield,
  BarChart3,
  Target,
  Code2,
  Brain,
  LineChart,
  TrendingUp,
  Users,
  Clock,
  Globe,
  Lock,
  Mail,
  MessageSquare,
  Play,
  X,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pricingBilling, setPricingBilling] = useState('monthly');
  const [expandedFAQ, setExpandedFAQ] = useState(0);
  const heroRef = useRef(null);

  // Handle navbar glass morphism on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const pricing = {
    monthly: {
      starter: 49,
      growth: 149,
      pro: 399,
    },
    annual: {
      starter: 49 * 12 * 0.8,
      growth: 149 * 12 * 0.8,
      pro: 399 * 12 * 0.8,
    },
  };

  const currentPricing = pricing[pricingBilling];

  const faqs = [
    {
      question: 'How long does it take to set up Slay Season?',
      answer:
        'Setup takes less than 5 minutes. Connect your Shopify store and one ad platform with one click using OAuth. Start seeing real-time data immediately—no API keys, no developers needed.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes. We use enterprise-grade encryption, SOC 2 Type II compliance, and never store sensitive credentials. Your data syncs securely via OAuth and is encrypted at rest.',
    },
    {
      question: 'Which platforms can I connect?',
      answer:
        'Slay Season connects Shopify, Meta Ads, Google Ads, Klaviyo, and Google Analytics 4. We add new integrations monthly based on customer demand.',
    },
    {
      question: 'Can I export data or use the API?',
      answer:
        'Yes! Growth and Pro plans include full API access and custom report builders. Starter plan includes basic exports. API documentation is available in your dashboard.',
    },
    {
      question: 'What if I need help?',
      answer:
        'Starter: Email support (24hr response). Growth: Priority Slack support. Pro: Dedicated account manager + custom integrations.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        'Yes. Cancel anytime, no questions asked. If you cancel mid-month, you get a prorated refund. We only succeed when you succeed.',
    },
  ];

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Real-Time Analytics',
      description: 'Live KPIs across Shopify, Meta, Google, Klaviyo & GA4 in one unified dashboard.',
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Forecasting',
      description: 'Predict revenue, LTV, and CAC using 4 proprietary machine learning algorithms.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'True Profit Tracking',
      description: 'See actual margins: COGS, ad spend, shipping, fulfillment, and refunds all accounted for.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'One-Click Integrations',
      description: 'Connect any platform with OAuth. No API keys, no engineering required.',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Budget Optimizer',
      description: 'AI automatically allocates ad budget across channels for maximum ROAS.',
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: 'Custom Reports',
      description: 'Build any report with our visual code editor. Share with your team instantly.',
    },
  ];

  const testimonials = [
    {
      quote:
        '"Slay Season helped us go from $500K to $3M ARR. The profit tracking showed us we were actually losing money on certain products. Game-changer."',
      author: 'Sarah Chen',
      role: 'Founder & CEO',
      company: 'Glow Beauty Co.',
      rating: 5,
    },
    {
      quote:
        '"We switched from spreadsheets to Slay Season and saved 15 hours/week. The AI forecasting is scary accurate. Highly recommend."',
      author: 'Marcus Thompson',
      role: 'Chief Marketing Officer',
      company: 'Revival Wellness',
      rating: 5,
    },
    {
      quote:
        '"As a bootstrapped founder, I needed affordable analytics that didn\'t require a data analyst. Slay Season is exactly that."',
      author: 'Priya Patel',
      role: 'Owner',
      company: 'Artisan Home Studio',
      rating: 5,
    },
  ];

  const comparisonData = [
    {
      feature: 'Price (per month)',
      slayseason: 'From $49',
      triplewhale: 'From $99',
      polaranalytics: 'From $150',
      spreadsheets: 'Free (but your time)',
    },
    {
      feature: 'Setup time',
      slayseason: '5 minutes',
      triplewhale: '30 minutes',
      polaranalytics: '1+ hours',
      spreadsheets: 'Hours/days',
    },
    {
      feature: 'Integrations included',
      slayseason: '5',
      triplewhale: '8',
      polaranalytics: '6',
      spreadsheets: 'Manual entry',
    },
    {
      feature: 'AI Forecasting',
      slayseason: 'Yes',
      triplewhale: 'No',
      polaranalytics: 'Limited',
      spreadsheets: 'No',
    },
    {
      feature: 'True Profit Tracking',
      slayseason: 'Yes',
      triplewhale: 'No',
      polaranalytics: 'No',
      spreadsheets: 'Manual calc',
    },
    {
      feature: 'Free trial',
      slayseason: '14 days, no card',
      triplewhale: '7 days',
      polaranalytics: '14 days',
      spreadsheets: 'Unlimited',
    },
  ];

  return (
    <div className="w-full bg-[#0f1117] text-[#f0f2f8] overflow-hidden">
      {/* Sticky Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#1c2033]/80 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
              Slay Season
            </span>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
            >
              FAQ
            </button>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors hidden sm:block"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a855f7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/30">
            <Zap className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm font-semibold text-[#6366f1]">AI-Powered Analytics Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            All Your Ecommerce Data.
            <br />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
              One Dashboard.
            </span>
            <br />
            Zero Headaches.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-[#8b92b0] mb-8 max-w-3xl mx-auto leading-relaxed">
            Slay Season connects Shopify, Meta Ads, Google Ads, Klaviyo & GA4 in one click. See your real profit, not vanity
            metrics.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => alert('Demo video would play here')}
              className="w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-lg border-2 border-[#6366f1]/50 text-white hover:bg-[#6366f1]/10 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Trust badges */}
          <p className="text-sm text-[#8b92b0] mb-12">
            💳 No credit card required • 🎁 Free for 14 days • ✌️ Cancel anytime
          </p>

          {/* Dashboard Mockup */}
          <div className="relative mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-[#1c2033]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-hidden">
              {/* Mockup Dashboard */}
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-[#0f1117] rounded-lg p-4 border border-white/5">
                    <div className="text-[#8b92b0] text-xs font-semibold mb-2">REVENUE (7D)</div>
                    <div className="flex items-end gap-1 h-12 mb-2">
                      <div className="w-1 bg-[#22c55e]/30 rounded-full" style={{ height: '30%' }}></div>
                      <div className="w-1 bg-[#22c55e]/50 rounded-full" style={{ height: '50%' }}></div>
                      <div className="w-1 bg-[#22c55e]/70 rounded-full" style={{ height: '70%' }}></div>
                      <div className="w-1 bg-[#22c55e] rounded-full" style={{ height: '100%' }}></div>
                      <div className="w-1 bg-[#22c55e]/80 rounded-full" style={{ height: '80%' }}></div>
                      <div className="w-1 bg-[#22c55e]/60 rounded-full" style={{ height: '60%' }}></div>
                      <div className="w-1 bg-[#22c55e]/75 rounded-full" style={{ height: '75%' }}></div>
                    </div>
                    <div className="text-white text-2xl font-bold">$47.2K</div>
                    <div className="text-[#22c55e] text-xs mt-1">↑ 12.5% vs last week</div>
                  </div>

                  <div className="flex-1 bg-[#0f1117] rounded-lg p-4 border border-white/5">
                    <div className="text-[#8b92b0] text-xs font-semibold mb-2">PROFIT MARGIN</div>
                    <div className="text-white text-2xl font-bold">34.8%</div>
                    <div className="text-[#f59e0b] text-xs mt-2">Actual (not GAAP)</div>
                  </div>

                  <div className="flex-1 bg-[#0f1117] rounded-lg p-4 border border-white/5">
                    <div className="text-[#8b92b0] text-xs font-semibold mb-2">CAC</div>
                    <div className="text-white text-2xl font-bold">$12.50</div>
                    <div className="text-[#22c55e] text-xs mt-1">↓ 8.2% vs target</div>
                  </div>
                </div>

                {/* Chart Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f1117] rounded-lg p-4 border border-white/5">
                    <div className="text-[#8b92b0] text-xs font-semibold mb-3">CHANNELS</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8b92b0]">Shopify</span>
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-[#6366f1]"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8b92b0]">Meta Ads</span>
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-1/2 bg-[#a855f7]"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8b92b0]">Google Ads</span>
                        <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-[#0ea5e9]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f1117] rounded-lg p-4 border border-white/5">
                    <div className="text-[#8b92b0] text-xs font-semibold mb-3">AI FORECAST</div>
                    <div className="flex items-end gap-1 h-16">
                      <div className="flex-1 bg-[#6366f1]/30 rounded-t hover:bg-[#6366f1]/50 transition-all" style={{ height: '40%' }}></div>
                      <div className="flex-1 bg-[#6366f1]/40 rounded-t hover:bg-[#6366f1]/60 transition-all" style={{ height: '55%' }}></div>
                      <div className="flex-1 bg-[#6366f1]/50 rounded-t hover:bg-[#6366f1]/70 transition-all" style={{ height: '70%' }}></div>
                      <div className="flex-1 bg-[#6366f1] rounded-t hover:bg-[#7c3aed] transition-all" style={{ height: '85%' }}></div>
                      <div className="flex-1 bg-[#6366f1]/80 rounded-t hover:bg-[#6366f1] transition-all" style={{ height: '75%' }}></div>
                    </div>
                    <div className="text-[#8b92b0] text-xs mt-2">Next 30 days</div>
                  </div>
                </div>
              </div>

              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-transparent opacity-0 animate-pulse rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-white/5 bg-[#1c2033]/40 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[#8b92b0] mb-8 font-semibold">
            Trusted by 500+ DTC brands managing over $2B in annual revenue
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {['Fashion', 'Beauty', 'Health', 'Home', 'Food'].map((category) => (
              <div
                key={category}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#8b92b0] text-sm font-medium hover:bg-white/10 transition-all"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integrations Section */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Connect Everything.
              <br />
              <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                Instantly.
              </span>
            </h2>
            <p className="text-[#8b92b0] text-lg max-w-2xl mx-auto">
              One-click OAuth integrations. No API keys. No engineers. Just connect and start seeing real data.
            </p>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {[
              { name: 'Shopify', icon: '🛍️', delay: '0s' },
              { name: 'Meta Ads', icon: '📘', delay: '0.1s' },
              { name: 'Google Ads', icon: '🔍', delay: '0.2s' },
              { name: 'Klaviyo', icon: '📧', delay: '0.3s' },
              { name: 'Google Analytics', icon: '📊', delay: '0.4s' },
            ].map((integration) => (
              <div
                key={integration.name}
                className="relative group"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: integration.delay,
                  opacity: 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                <div className="relative bg-[#1c2033] border border-white/10 rounded-xl p-6 text-center hover:border-[#6366f1]/50 transition-all">
                  <div className="text-4xl mb-3">{integration.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{integration.name}</h3>
                  <p className="text-xs text-[#8b92b0]">Connect in 1 click</p>
                </div>
              </div>
            ))}
          </div>

          {/* Connection Flow Visualization */}
          <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              <div className="text-3xl">📱</div>
              <div className="hidden md:block">→</div>
              <div className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-6 py-3 rounded-lg text-white font-bold">Slay Season</div>
              <div className="hidden md:block">→</div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['🛍️', '📘', '🔍', '📧', '📊'].map((icon, idx) => (
                  <div key={idx} className="text-2xl">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-[#8b92b0] text-sm mt-6">
              Data flows in real-time. Updates every hour. Zero manual work.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Everything You Need.
              <br />
              <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                Nothing You Don't.
              </span>
            </h2>
            <p className="text-[#8b92b0] text-lg max-w-2xl mx-auto">
              Purpose-built for DTC brands that want to grow profitably.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                <div className="relative bg-[#1c2033] border border-white/10 rounded-xl p-8 hover:border-[#6366f1]/50 transition-all h-full">
                  <div className="text-[#6366f1] mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-[#8b92b0] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why Slay Season?
            </h2>
            <p className="text-[#8b92b0] text-lg max-w-2xl mx-auto">
              We built the analytics platform we wish existed.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 font-semibold text-white">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#6366f1]">Slay Season</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#8b92b0]">Triple Whale</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#8b92b0]">Polar Analytics</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#8b92b0]">Spreadsheets</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-medium text-white">{row.feature}</td>
                    <td className="text-center py-4 px-4 text-[#22c55e]">
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4 text-white">{row.triplewhale}</td>
                    <td className="text-center py-4 px-4 text-white">{row.polaranalytics}</td>
                    <td className="text-center py-4 px-4 text-white">{row.spreadsheets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple, Transparent
              <br />
              <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-[#8b92b0] text-lg mb-8">
              No hidden fees. No surprise charges. 14-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`font-semibold ${pricingBilling === 'monthly' ? 'text-white' : 'text-[#8b92b0]'}`}>
                Monthly
              </span>
              <button
                onClick={() => setPricingBilling(pricingBilling === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-[#1c2033] border border-white/10"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] transition-transform ${
                    pricingBilling === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${pricingBilling === 'annual' ? 'text-white' : 'text-[#8b92b0]'}`}>
                  Annual
                </span>
                <span className="bg-[#22c55e]/20 text-[#22c55e] text-xs font-bold px-3 py-1 rounded-full">
                  SAVE 20%
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: currentPricing.starter,
                description: 'Perfect for small brands',
                features: [
                  'Up to $500K GMV',
                  '3 integrations',
                  'Real-time dashboard',
                  'Basic analytics',
                  'Email support',
                ],
                popular: false,
              },
              {
                name: 'Growth',
                price: currentPricing.growth,
                description: 'Most popular plan',
                features: [
                  'Up to $5M GMV',
                  'All 5 integrations',
                  'AI forecasting',
                  'Budget optimizer',
                  'Priority support',
                  'Custom reports',
                ],
                popular: true,
              },
              {
                name: 'Pro',
                price: currentPricing.pro,
                description: 'For scaling brands',
                features: [
                  'Unlimited GMV',
                  'All integrations',
                  'Full API access',
                  'Dedicated account manager',
                  'Custom integrations',
                  '24/7 phone support',
                ],
                popular: false,
              },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`relative group ${tier.popular ? 'md:scale-105' : ''}`}
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div
                  className={`absolute inset-0 rounded-xl transition-all ${
                    tier.popular
                      ? 'bg-gradient-to-r from-[#6366f1]/30 to-[#a855f7]/30'
                      : 'bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10'
                  } opacity-0 group-hover:opacity-100 blur`}
                ></div>
                <div
                  className={`relative bg-[#1c2033] border rounded-xl p-8 h-full transition-all ${
                    tier.popular
                      ? 'border-[#6366f1]/50'
                      : 'border-white/10 hover:border-[#6366f1]/50'
                  }`}
                >
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-[#8b92b0] text-sm mb-6">{tier.description}</p>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">
                        ${Math.round(tier.price)}
                      </span>
                      <span className="text-[#8b92b0]">
                        /{pricingBilling === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {pricingBilling === 'annual' && (
                      <p className="text-xs text-[#22c55e] mt-2">
                        Save ${Math.round((tier.price / 0.8 - tier.price) * 12 / 12)} per month
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full py-3 rounded-lg font-bold transition-all mb-8 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white shadow-lg'
                        : 'border-2 border-[#6366f1]/30 text-white hover:bg-[#6366f1]/10'
                    }`}
                  >
                    Start Free Trial
                  </button>

                  <ul className="space-y-3">
                    {tier.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                        <span className="text-[#f0f2f8]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Loved by DTC Brands
            </h2>
            <p className="text-[#8b92b0] text-lg max-w-2xl mx-auto">
              Join 500+ founders and growth leaders using Slay Season.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="relative group"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                <div className="relative bg-[#1c2033] border border-white/10 rounded-xl p-8 hover:border-[#6366f1]/50 transition-all">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-white mb-6 leading-relaxed italic">{testimonial.quote}</p>

                  {/* Author */}
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-[#8b92b0] text-sm">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#8b92b0] text-lg">
              Everything you need to know about Slay Season.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-white/10 rounded-lg overflow-hidden hover:border-[#6366f1]/50 transition-all"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? -1 : idx)}
                  className="w-full bg-[#1c2033] p-6 flex items-center justify-between hover:bg-[#1c2033]/80 transition-colors"
                >
                  <span className="text-lg font-semibold text-white text-left">{faq.question}</span>
                  <div className="text-[#6366f1] flex-shrink-0 ml-4">
                    {expandedFAQ === idx ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>
                {expandedFAQ === idx && (
                  <div className="bg-[#0f1117] p-6 border-t border-white/5">
                    <p className="text-[#8b92b0] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* FAQ CTA */}
          <div className="text-center mt-12">
            <p className="text-[#8b92b0] mb-4">Still have questions?</p>
            <button className="flex items-center gap-2 mx-auto text-[#6366f1] hover:text-[#a855f7] transition-colors font-semibold">
              <MessageSquare className="w-5 h-5" />
              Chat with our team
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a855f7]/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            Ready to Slay Your
            <br />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
              Competition?
            </span>
          </h2>
          <p className="text-xl text-[#8b92b0] mb-8 max-w-2xl mx-auto">
            Join 500+ brands already using Slay Season to grow profitably. Start your free 14-day trial today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center gap-2 group"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-lg font-bold text-lg border-2 border-[#6366f1]/30 text-white hover:bg-[#6366f1]/10 transition-all"
            >
              Already a user? Log In
            </button>
          </div>

          <p className="text-sm text-[#8b92b0] mt-6">
            💳 No credit card required • 🎁 Free for 14 days • ✌️ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1c2033]/50 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Slay Season</span>
              </div>
              <p className="text-[#8b92b0] text-sm">
                All-in-one analytics for DTC brands. Made with ❤️ for ecommerce.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="text-[#8b92b0] hover:text-white transition-colors text-sm"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="text-[#8b92b0] hover:text-white transition-colors text-sm"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('faq')}
                    className="text-[#8b92b0] hover:text-white transition-colors text-sm"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-[#8b92b0] hover:text-white transition-colors text-sm">
                    Blog
                  </button>
                </li>
                <li>
                  <button className="text-[#8b92b0] hover:text-white transition-colors text-sm">
                    About
                  </button>
                </li>
                <li>
                  <button className="text-[#8b92b0] hover:text-white transition-colors text-sm">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-[#8b92b0] hover:text-white transition-colors text-sm">
                    Privacy
                  </button>
                </li>
                <li>
                  <button className="text-[#8b92b0] hover:text-white transition-colors text-sm">
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-[#8b92b0] text-sm mb-4 sm:mb-0">
              © 2024 Slay Season. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button className="text-[#8b92b0] hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </button>
              <button className="text-[#8b92b0] hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0f1117;
        }

        ::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }

        /* Selection color */
        ::selection {
          background-color: #6366f1;
          color: #f0f2f8;
        }

        /* Focus styles */
        button:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }

        a:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

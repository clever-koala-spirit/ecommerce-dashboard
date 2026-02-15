import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  X,
  Star,
  Zap,
  Shield,
  BarChart3,
  Brain,
  Users,
  Clock,
  DollarSign,
  Sparkles,
  HeadphonesIcon,
  MessageSquare,
  Cpu,
  ChevronRight,
  HelpCircle,
  CreditCard,
  RefreshCw,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';

const PricingPage = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const pricing = {
    monthly: { starter: 49, growth: 149, pro: 399 },
    annual: { starter: 39, growth: 119, pro: 319 },
  };
  const p = pricing[billingPeriod];
  const savings = {
    starter: (49 - 39) * 12,
    growth: (149 - 119) * 12,
    pro: (399 - 319) * 12,
  };

  const features = {
    starter: [
      'Up to $500K annual revenue',
      'Shopify + 2 ad platforms',
      'Real-time profit tracking',
      'Basic forecasting (30 days)',
      'Standard integrations',
      'Email support (24hr response)',
      'Basic reporting',
      'Mobile app access'
    ],
    growth: [
      'Up to $3M annual revenue',
      'All integrations included',
      'Advanced profit tracking',
      'AI forecasting (90 days)',
      'Budget optimization',
      'Concierge setup service',
      'Priority Slack support',
      'API access & exports',
      'Custom reports builder',
      'Multi-store support (up to 3)',
      'Advanced segmentation',
      'Cohort analysis'
    ],
    pro: [
      'Unlimited revenue',
      'Enterprise integrations',
      'White-label options',
      'Custom AI forecasting',
      'Advanced budget optimization',
      'Dedicated account manager',
      'Phone support',
      'Full API & webhooks',
      'Custom report builder',
      'Unlimited stores',
      'Advanced user permissions',
      'Custom data exports',
      'Quarterly business reviews',
      'Custom integrations'
    ]
  };

  const faqs = [
    {
      q: 'What happens after the free trial?',
      a: "Your 14-day trial includes full access to all Growth plan features. No credit card required to start. After the trial, you can choose any plan or cancel with no charges."
    },
    {
      q: 'Can I change plans anytime?',
      a: "Yes! Upgrade or downgrade anytime from your dashboard. Changes take effect immediately, and we'll prorate billing automatically."
    },
    {
      q: 'What if I exceed my revenue limit?',
      a: "We'll notify you before you reach 90% of your plan's revenue limit. You can upgrade to the next tier, or contact us for custom pricing on higher volumes."
    },
    {
      q: 'Do you offer refunds?',
      a: "Yes. 30-day money-back guarantee, no questions asked. If Slay Season isn't right for your business, we'll refund your payment in full."
    },
    {
      q: 'What payment methods do you accept?',
      a: "We accept all major credit cards (Visa, MasterCard, Amex, Discover) and PayPal. Enterprise customers can pay by bank transfer or check."
    },
    {
      q: 'Are there any setup fees?',
      a: "No setup fees, ever. The concierge onboarding service (included with Growth & Pro) is completely free."
    },
    {
      q: 'What integrations are included?',
      a: "Shopify (required), Meta Ads, Google Ads, GA4, Klaviyo, TikTok Ads, Snapchat Ads, Pinterest Ads, and more. We add new integrations monthly based on customer requests."
    },
    {
      q: 'How does the concierge setup work?',
      a: "Our team connects your platforms, configures tracking, validates data accuracy, and sets up your dashboard — typically within 24 hours. Available on Growth & Pro plans."
    }
  ];

  const competitors = [
    { name: 'Triple Whale', price: '$129-$2790/mo', profit: '❌', ai: '❌', setup: '30+ min', support: 'Email' },
    { name: 'Northbeam', price: '$999+/mo', profit: '⚠️', ai: 'Basic', setup: 'Hours', support: 'Enterprise only' },
    { name: 'Polar Analytics', price: '$200+/mo', profit: 'Limited', ai: '❌', setup: '15 min', support: 'Email' },
    { name: 'Slay Season', price: '$49-$399/mo', profit: '✅', ai: '✅', setup: '5 min', support: 'Slack + Email' }
  ];

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased">
      <style>{`
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .gradient-border { position: relative; }
        .gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(99,102,241,.4), rgba(168,85,247,.4), rgba(16,185,129,.2)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; overflow: hidden; transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .pricing-popular { background: linear-gradient(135deg, rgba(99,102,241,.08), rgba(168,85,247,.08)); border: 1px solid rgba(99,102,241,.3); }
        .mesh-bg { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,.12), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168,85,247,.08), transparent); }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Slay Season</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <button onClick={() => navigate('/')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Home</button>
            <button onClick={() => navigate('/about')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">About</button>
            <button onClick={() => navigate('/blog')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Blog</button>
            <button onClick={() => navigate('/help')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Help</button>
            <button onClick={() => navigate('/contact')} className="text-[#8b92b0] hover:text-white transition-colors duration-200">Contact</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-[#8b92b0] hover:text-white transition-colors px-4 py-2">Log in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-white px-5 py-2 rounded-lg text-sm font-semibold">
              <span className="flex items-center gap-1.5">Start Free Trial <ArrowRight className="w-3.5 h-3.5" /></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-16 mesh-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Simple, Transparent
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-[#8b92b0] max-w-2xl mx-auto leading-relaxed mb-8">
            Start with a 14-day free trial. No credit card required. Scale when you're ready.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-[#6b7194]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              30-day money-back guarantee
            </span>
          </div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-8 border-t border-white/[.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 glass rounded-full px-1.5 py-1.5">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'monthly' ? 'bg-indigo-500/20 text-white' : 'text-[#6b7194]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${billingPeriod === 'annual' ? 'bg-indigo-500/20 text-white' : 'text-[#6b7194]'}`}
            >
              Annual
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Starter */}
            <div className="glass rounded-xl p-8 hover:bg-white/[.02] transition-colors">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                <p className="text-sm text-[#6b7194] mb-6">Perfect for new DTC brands</p>
                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-white">${p.starter}</span>
                  <span className="text-[#6b7194] text-lg">/mo</span>
                </div>
                {billingPeriod === 'annual' && (
                  <p className="text-sm text-emerald-400 mb-6">
                    Billed annually • Save ${savings.starter}/year
                  </p>
                )}
                <button 
                  onClick={() => navigate('/signup')} 
                  className="w-full py-3 rounded-lg text-sm font-semibold border border-white/20 text-white hover:bg-white/[.04] transition-all"
                >
                  Start Free Trial
                </button>
              </div>
              
              <ul className="space-y-3">
                {features.starter.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#8b92b0]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth - Most Popular */}
            <div className="pricing-popular rounded-xl p-8 relative hover:bg-white/[.02] transition-colors">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Growth</h3>
                <p className="text-sm text-[#6b7194] mb-6">For scaling DTC brands</p>
                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-white">${p.growth}</span>
                  <span className="text-[#6b7194] text-lg">/mo</span>
                </div>
                {billingPeriod === 'annual' && (
                  <p className="text-sm text-emerald-400 mb-6">
                    Billed annually • Save ${savings.growth}/year
                  </p>
                )}
                <button 
                  onClick={() => navigate('/signup')} 
                  className="w-full btn-primary py-3 rounded-lg text-sm font-semibold text-white"
                >
                  Start Free Trial
                </button>
              </div>
              
              <ul className="space-y-3">
                {features.growth.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#c4c9d8]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="glass rounded-xl p-8 hover:bg-white/[.02] transition-colors">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <p className="text-sm text-[#6b7194] mb-6">For enterprise & agencies</p>
                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-white">${p.pro}</span>
                  <span className="text-[#6b7194] text-lg">/mo</span>
                </div>
                {billingPeriod === 'annual' && (
                  <p className="text-sm text-emerald-400 mb-6">
                    Billed annually • Save ${savings.pro}/year
                  </p>
                )}
                <button 
                  onClick={() => navigate('/signup')} 
                  className="w-full py-3 rounded-lg text-sm font-semibold border border-white/20 text-white hover:bg-white/[.04] transition-all"
                >
                  Start Free Trial
                </button>
              </div>
              
              <ul className="space-y-3">
                {features.pro.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#8b92b0]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trust badges */}
          <div className="text-center mt-12">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-[#6b7194]">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                5-minute setup
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                SOC 2 compliant
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                800+ brands trust us
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 border-t border-white/[.04] mesh-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Feature <span className="text-indigo-400">Comparison</span>
            </h3>
            <p className="text-[#8b92b0]">Everything you need to make informed decisions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6b7194]">Feature</th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-white">Starter</th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-indigo-400 bg-indigo-500/5 rounded-t-lg">Growth</th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-white">Pro</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['Revenue Limit', '$500K/year', '$3M/year', 'Unlimited'],
                  ['Profit Tracking', '✓', '✓', '✓'],
                  ['AI Forecasting', '30 days', '90 days', 'Custom'],
                  ['Budget Optimizer', '✗', '✓', '✓'],
                  ['Concierge Setup', '✗', '✓', '✓'],
                  ['Multi-Store', '1 store', '3 stores', 'Unlimited'],
                  ['API Access', '✗', '✓', 'Full access'],
                  ['Support', 'Email', 'Slack + Email', 'Phone + Slack'],
                  ['Custom Reports', '✗', '✓', '✓'],
                  ['Account Manager', '✗', '✗', '✓'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 px-4 font-medium text-[#c4c9d8]">{row[0]}</td>
                    <td className="text-center py-3 px-6">
                      {row[1] === '✓' ? <Check className="w-4 h-4 mx-auto text-emerald-400" /> : 
                       row[1] === '✗' ? <X className="w-4 h-4 mx-auto text-red-400/40" /> : 
                       <span className="text-[#8b92b0]">{row[1]}</span>}
                    </td>
                    <td className="text-center py-3 px-6 bg-indigo-500/[.02]">
                      {row[2] === '✓' ? <Check className="w-4 h-4 mx-auto text-emerald-400" /> : 
                       row[2] === '✗' ? <X className="w-4 h-4 mx-auto text-red-400/40" /> : 
                       <span className="text-white font-medium">{row[2]}</span>}
                    </td>
                    <td className="text-center py-3 px-6">
                      {row[3] === '✓' ? <Check className="w-4 h-4 mx-auto text-emerald-400" /> : 
                       row[3] === '✗' ? <X className="w-4 h-4 mx-auto text-red-400/40" /> : 
                       <span className="text-[#8b92b0]">{row[3]}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-16 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              How We <span className="text-emerald-400">Stack Up</span>
            </h3>
            <p className="text-[#8b92b0]">Compare Slay Season to other analytics platforms</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6b7194]">Platform</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#6b7194]">Starting Price</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#6b7194]">True Profit</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#6b7194]">AI Forecasting</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#6b7194]">Setup Time</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#6b7194]">Support</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {competitors.map((comp, i) => (
                  <tr key={i} className={`border-b border-white/5 ${comp.name === 'Slay Season' ? 'bg-indigo-500/5' : ''}`}>
                    <td className={`py-3 px-4 font-semibold ${comp.name === 'Slay Season' ? 'text-indigo-400' : 'text-[#c4c9d8]'}`}>
                      {comp.name}
                    </td>
                    <td className="text-center py-3 px-4 text-[#8b92b0]">{comp.price}</td>
                    <td className="text-center py-3 px-4">{comp.profit}</td>
                    <td className="text-center py-3 px-4 text-[#8b92b0]">{comp.ai}</td>
                    <td className="text-center py-3 px-4 text-[#8b92b0]">{comp.setup}</td>
                    <td className="text-center py-3 px-4 text-[#8b92b0]">{comp.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-white/[.04]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Billing <span className="text-purple-400">FAQ</span>
            </h3>
            <p className="text-[#8b92b0]">Common questions about pricing and billing</p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/[.02] transition-colors"
                >
                  <span className="font-medium text-white text-sm pr-4">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-[#6b7194] flex-shrink-0 transition-transform ${expandedFAQ === i ? 'rotate-90' : ''}`} />
                </button>
                {expandedFAQ === i && (
                  <div className="px-6 pb-4 border-t border-white/5">
                    <p className="text-sm text-[#8b92b0] leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-[#8b92b0] mb-4">Still have questions?</p>
            <button
              onClick={() => navigate('/contact')}
              className="glass px-6 py-3 rounded-lg font-semibold hover:bg-white/[.04] transition-all flex items-center gap-2 mx-auto"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Sales</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 border-t border-white/[.04] mesh-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to See Your <span className="text-emerald-400">True Profit</span>?
          </h3>
          <p className="text-lg text-[#8b92b0] mb-8 max-w-2xl mx-auto">
            Join 800+ DTC brands who replaced spreadsheets and guesswork with Slay Season.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary text-white px-10 py-4 rounded-xl font-semibold text-lg group"
          >
            <span className="flex items-center gap-2">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
          <p className="text-xs text-[#6b7194] mt-4">
            No credit card required • 5-minute setup • 14-day free trial • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">Slay Season</span>
            </div>
            <p className="text-xs text-[#4a4f6a]">© 2025 Slay Season by Convictlabs Holdings LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
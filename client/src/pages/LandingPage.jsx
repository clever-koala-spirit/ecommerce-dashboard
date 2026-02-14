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
  Calculator,
  HeadphonesIcon,
  DollarSign,
  Gauge,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pricingBilling, setPricingBilling] = useState('monthly');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [roiInputs, setRoiInputs] = useState({
    monthlyRevenue: 100000,
    timeSpent: 10,
    hourlyRate: 50
  });
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

  // ROI Calculator
  const calculateROI = () => {
    const timeValue = roiInputs.timeSpent * roiInputs.hourlyRate * 52; // Weekly time saved per year
    const efficiencyGain = roiInputs.monthlyRevenue * 0.20; // 20% profit increase
    const totalAnnualSavings = timeValue + efficiencyGain * 12;
    const annualCost = currentPricing.growth * (pricingBilling === 'monthly' ? 12 : 1);
    return {
      timeSavings: timeValue,
      profitIncrease: efficiencyGain * 12,
      totalSavings: totalAnnualSavings,
      netROI: totalAnnualSavings - annualCost,
      roiMultiple: Math.round((totalAnnualSavings / annualCost) * 10) / 10
    };
  };

  const roi = calculateROI();

  const faqs = [
    {
      question: 'How long does setup actually take?',
      answer: 'Seriously, 5 minutes. Connect your Shopify store with one click (OAuth), then connect Meta Ads and Google Ads the same way. Start seeing unified data immediately. No API keys, no developer needed, no technical BS.'
    },
    {
      question: 'What if my data is wrong or incomplete?',
      answer: 'We audit every integration during onboarding. If something looks off, our team fixes it for free. We also validate your numbers against Shopify\'s data to ensure accuracy. Your data quality is our reputation.'
    },
    {
      question: 'How do you compare to Triple Whale and Northbeam?',
      answer: 'We\'re newer but better tech. Triple Whale is $129-$2790/month and clunky. Northbeam is $999+/month and overcomplicated. We\'re $49-$399/month with modern UI and better forecasting. Plus we actually show true profit, not vanity metrics.'
    },
    {
      question: 'What if I\'m not technical?',
      answer: 'Perfect. Slay Season was built for founders, not data scientists. Everything is point-and-click. Our "We\'ll Set It Up For You" concierge service means you can literally do nothing and we\'ll have your dashboard ready in 24 hours.'
    },
    {
      question: 'Can I cancel if it doesn\'t work for me?',
      answer: 'Yes, instantly. Cancel in your dashboard with one click. If you cancel within 7 days, we refund everything automatically. If you cancel later, you get prorated refund. No questions, no retention calls.'
    },
    {
      question: 'What platforms do you integrate with?',
      answer: 'Shopify (required), Meta Ads, Google Ads, Klaviyo, Google Analytics 4, TikTok Ads, Snapchat Ads. We add new integrations monthly. If you need something specific, we can build it for Pro customers.'
    },
    {
      question: 'How accurate is your profit tracking?',
      answer: 'More accurate than any competitor. We factor in: COGS, ad spend, shipping costs, payment processing fees, refunds, discounts, and even your fixed costs. Most tools show "gross profit" - we show actual profit in your bank account.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'Starter: Email support (24hr response). Growth: Priority Slack channel. Pro: Dedicated account manager plus our team sets up custom reports for you. Everyone gets access to our private founder community.'
    },
    {
      question: 'Do you have an API or can I export data?',
      answer: 'Yes! Growth plan includes API access and CSV exports. Pro plan includes full API access plus custom webhook endpoints. You own your data - we just make it useful.'
    },
    {
      question: 'What if I have multiple Shopify stores?',
      answer: 'Each store needs its own plan, but we offer bulk discounts for 3+ stores. Pro plan includes multi-store dashboard views. Perfect for agencies or holding companies.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Bank-level security. SOC 2 Type II certified. All data encrypted at rest and in transit. We never sell your data or share with competitors. You can delete everything instantly from your dashboard.'
    },
    {
      question: 'What happens if I outgrow the Starter plan?',
      answer: 'Upgrade instantly in your dashboard. Pro-rated billing so you only pay the difference. As you grow, we grow with you. Our AI gets smarter with more data, so scaling actually improves your insights.'
    }
  ];

  return (
    <div className="w-full bg-[#0f1117] text-[#f0f2f8] overflow-hidden">
      {/* Sticky Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#1c2033]/90 backdrop-blur-md border-b border-white/10'
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
              onClick={() => scrollToSection('comparison')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
            >
              vs Competition
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
            >
              Pricing
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
              Try Free 14 Days
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - PAS Framework */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a855f7]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Problem - Impact Stats Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40">
            <TrendingUp className="w-5 h-5 text-[#22c55e]" />
            <span className="text-sm font-semibold text-[#22c55e]">
              +20% Profit · Save 5-10hrs/week · $1,200-$30,000 saved yearly
            </span>
          </div>

          {/* Problem Statement */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Stop Losing Money on
            <br />
            <span className="bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#eab308] bg-clip-text text-transparent">
              Bad Data
            </span>
          </h1>

          {/* Agitation */}
          <p className="text-xl sm:text-2xl text-[#8b92b0] mb-8 max-w-4xl mx-auto leading-relaxed">
            Your Shopify dashboard shows revenue. Meta shows ROAS. Google shows conversions. Klaviyo shows opens.
            <br />
            <strong className="text-[#f0f2f8]">But what's your actual profit?</strong> 
            <br />
            <span className="text-[#ef4444]">Most brands don't know until it's too late.</span>
          </p>

          {/* Solution */}
          <div className="bg-[#1c2033]/80 backdrop-blur-xl border border-[#6366f1]/30 rounded-2xl p-8 mb-8 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#6366f1]">
              One Dashboard. Real Profit. True ROAS.
            </h2>
            <p className="text-lg text-[#8b92b0] mb-6">
              Slay Season connects all your platforms and shows what actually matters: 
              profit after COGS, ad spend, shipping, fees, and refunds.
            </p>
            
            {/* How it Works - 3 Steps */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#6366f1]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#6366f1] font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Connect Platforms</h3>
                <p className="text-sm text-[#8b92b0]">One-click OAuth. 5 minutes setup.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#6366f1]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#6366f1] font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-white mb-2">See Real Data</h3>
                <p className="text-sm text-[#8b92b0]">Unified dashboard. True profit metrics.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#6366f1]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#6366f1] font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Scale Profitably</h3>
                <p className="text-sm text-[#8b92b0]">AI optimization. Predictive insights.</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center justify-center gap-2 group"
            >
              Start Free Trial (14 Days)
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg border-2 border-[#6366f1]/50 text-white hover:bg-[#6366f1]/10 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              See Live Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#8b92b0]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22c55e]" />
              Setup in 5 minutes
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#22c55e]" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Sound Familiar - Pain Section */}
      <section className="py-20 border-y border-white/5 bg-[#1c2033]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-[#ef4444]">Sound Familiar?</span>
            </h2>
            <p className="text-xl text-[#8b92b0]">These are real quotes from founders before they found Slay Season</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pain Point 1 - Spreadsheet Hell */}
            <div className="bg-[#0f1117] border border-[#ef4444]/30 rounded-xl p-8">
              <AlertTriangle className="w-8 h-8 text-[#ef4444] mb-4" />
              <blockquote className="text-[#f0f2f8] mb-4 italic">
                "I spend 15 hours every week updating spreadsheets. I'm pulling data from Shopify, Meta, Google, Klaviyo... 
                by the time I finish, the data is already outdated. I should be running my business, not doing data entry."
              </blockquote>
              <div className="text-sm text-[#8b92b0]">
                - Sarah M., Beauty Brand Founder ($2M ARR)
              </div>
            </div>

            {/* Pain Point 2 - Fragmented Data */}
            <div className="bg-[#0f1117] border border-[#ef4444]/30 rounded-xl p-8">
              <BarChart3 className="w-8 h-8 text-[#ef4444] mb-4" />
              <blockquote className="text-[#f0f2f8] mb-4 italic">
                "Meta shows 4.2x ROAS. Google shows 6.1x ROAS. Shopify shows revenue going up. 
                But my bank account is getting smaller. Which numbers do I trust? I'm flying blind."
              </blockquote>
              <div className="text-sm text-[#8b92b0]">
                - Marcus T., Supplement Brand Owner ($500K ARR)
              </div>
            </div>

            {/* Pain Point 3 - iOS 14.5 Attribution */}
            <div className="bg-[#0f1117] border border-[#ef4444]/30 rounded-xl p-8">
              <TrendingUp className="w-8 h-8 text-[#ef4444] mb-4" />
              <blockquote className="text-[#f0f2f8] mb-4 italic">
                "iOS 14.5 broke everything. Meta's reporting is useless now. I don't know which ads actually work. 
                I'm wasting thousands on ads that look good in Meta but don't drive real profit."
              </blockquote>
              <div className="text-sm text-[#8b92b0]">
                - Jennifer K., Fashion Brand CMO ($3M ARR)
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-2xl text-[#f0f2f8] mb-4 font-semibold">
              Stop the pain. Get clarity in 5 minutes.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl"
            >
              Try Slay Season Free →
            </button>
          </div>
        </div>
      </section>

      {/* Features Deep-Dive */}
      <section id="features" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Features That Actually
              <br />
              <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                Move The Needle
              </span>
            </h2>
            <p className="text-xl text-[#8b92b0] max-w-3xl mx-auto">
              Every feature solves a real problem DTC founders face daily
            </p>
          </div>

          <div className="space-y-16">
            {/* Feature 1 - True Profit Tracking */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40">
                  <DollarSign className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-sm font-semibold text-[#22c55e]">Most Requested Feature</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">True Profit Tracking</h3>
                <p className="text-lg text-[#8b92b0] mb-6">
                  See your actual profit, not vanity metrics. We factor in COGS, ad spend, shipping, fees, refunds, 
                  and even your monthly expenses. Know exactly how much money hits your bank account.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Real-time profit margins by product, channel, and campaign</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Accounts for COGS, shipping, payment fees, refunds automatically</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Identifies which products are actually profitable</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#1c2033] border border-white/10 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-white">Profit Overview - November 2024</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#0f1117] rounded-lg">
                    <span className="text-[#8b92b0]">Gross Revenue</span>
                    <span className="font-bold text-white">$84,250</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#0f1117] rounded-lg">
                    <span className="text-[#8b92b0]">- COGS</span>
                    <span className="font-bold text-[#ef4444]">-$33,700</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#0f1117] rounded-lg">
                    <span className="text-[#8b92b0]">- Ad Spend</span>
                    <span className="font-bold text-[#ef4444]">-$16,850</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#0f1117] rounded-lg">
                    <span className="text-[#8b92b0]">- Shipping & Fees</span>
                    <span className="font-bold text-[#ef4444]">-$8,425</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center p-3 bg-[#22c55e]/20 border border-[#22c55e]/40 rounded-lg">
                      <span className="font-bold text-[#22c55e]">True Profit</span>
                      <span className="font-bold text-[#22c55e] text-xl">$25,275</span>
                    </div>
                    <p className="text-center text-sm text-[#8b92b0] mt-2">30% profit margin (industry avg: 10-15%)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - AI Forecasting */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-[#1c2033] border border-white/10 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-white">Revenue Forecast - Next 90 Days</h4>
                  </div>
                  <div className="h-48 flex items-end gap-2 mb-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1">
                        <div 
                          className="bg-[#6366f1]/30 rounded-t"
                          style={{ height: `${30 + i * 10 + Math.sin(i) * 10}%` }}
                        />
                        <div 
                          className="bg-[#6366f1] rounded-b"
                          style={{ height: `${40 + i * 8}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[#8b92b0] text-xs">Conservative</p>
                      <p className="font-bold text-white">$89K</p>
                    </div>
                    <div>
                      <p className="text-[#8b92b0] text-xs">Expected</p>
                      <p className="font-bold text-[#22c55e]">$127K</p>
                    </div>
                    <div>
                      <p className="text-[#8b92b0] text-xs">Optimistic</p>
                      <p className="font-bold text-[#6366f1]">$165K</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/40">
                  <Brain className="w-4 h-4 text-[#6366f1]" />
                  <span className="text-sm font-semibold text-[#6366f1]">Powered by Machine Learning</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">AI Revenue Forecasting</h3>
                <p className="text-lg text-[#8b92b0] mb-6">
                  Predict your revenue, profit, and cash flow with scary accuracy. Our AI learns from your historical data 
                  and external factors like seasonality, trends, and market conditions.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">90-day revenue predictions with 85%+ accuracy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Identifies seasonal trends and growth opportunities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Alerts you before cash flow problems hit</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 - Budget Optimizer */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/40">
                  <Target className="w-4 h-4 text-[#a855f7]" />
                  <span className="text-sm font-semibold text-[#a855f7]">AI-Powered Optimization</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Smart Budget Allocation</h3>
                <p className="text-lg text-[#8b92b0] mb-6">
                  Stop guessing where to spend your ad budget. Our AI automatically recommends the optimal allocation 
                  across Meta, Google, TikTok, and other channels based on true ROAS and profit margins.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Increase total ROAS by 15-30% with better allocation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Real-time recommendations based on performance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Accounts for attribution delays and iOS limitations</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#1c2033] border border-white/10 rounded-xl p-6">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-white">Budget Recommendation - This Week</h4>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-[#0f1117] rounded-lg border border-[#22c55e]/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-white">Meta Ads</span>
                      <span className="text-[#22c55e] font-bold">↑ +$2,000</span>
                    </div>
                    <div className="text-sm text-[#8b92b0] mb-2">Current: $8,000 → Recommended: $10,000</div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-[#22c55e] h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <p className="text-xs text-[#22c55e] mt-1">+15% ROAS expected</p>
                  </div>
                  
                  <div className="p-4 bg-[#0f1117] rounded-lg border border-[#ef4444]/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-white">Google Ads</span>
                      <span className="text-[#ef4444] font-bold">↓ -$1,500</span>
                    </div>
                    <div className="text-sm text-[#8b92b0] mb-2">Current: $5,000 → Recommended: $3,500</div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-[#ef4444] h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    <p className="text-xs text-[#ef4444] mt-1">Poor performance this week</p>
                  </div>

                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-sm text-[#8b92b0]">Expected weekly improvement</p>
                    <p className="text-2xl font-bold text-[#22c55e]">+$8,400 revenue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* More features... */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-[#1c2033] border border-white/10 rounded-xl p-6">
                <Gauge className="w-8 h-8 text-[#6366f1] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">Real-Time Dashboard</h4>
                <p className="text-[#8b92b0] text-sm">
                  Live data from all your platforms in one place. Updates every hour. See exactly what's happening right now.
                </p>
              </div>

              <div className="bg-[#1c2033] border border-white/10 rounded-xl p-6">
                <Code2 className="w-8 h-8 text-[#a855f7] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">Custom Reports</h4>
                <p className="text-[#8b92b0] text-sm">
                  Build any report you want with our visual code editor. No technical skills required. Share with your team instantly.
                </p>
              </div>

              <div className="bg-[#1c2033] border border-white/10 rounded-xl p-6">
                <Shield className="w-8 h-8 text-[#22c55e] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">1-Click Integrations</h4>
                <p className="text-[#8b92b0] text-sm">
                  Connect Shopify, Meta, Google, Klaviyo in minutes. OAuth security. No API keys. No developer needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Comparison Table */}
      <section id="comparison" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How We Stack Up
            </h2>
            <p className="text-xl text-[#8b92b0] max-w-3xl mx-auto">
              We built Slay Season because existing solutions suck. Here's the honest comparison.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max bg-[#1c2033] rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[#0f1117] border-b border-white/10">
                  <th className="text-left py-6 px-6 font-bold text-white">Feature</th>
                  <th className="text-center py-6 px-6 font-bold text-[#6366f1] bg-[#6366f1]/10">Slay Season</th>
                  <th className="text-center py-6 px-6 font-bold text-[#8b92b0]">Triple Whale</th>
                  <th className="text-center py-6 px-6 font-bold text-[#8b92b0]">BeProfit</th>
                  <th className="text-center py-6 px-6 font-bold text-[#8b92b0]">Northbeam</th>
                  <th className="text-center py-6 px-6 font-bold text-[#8b92b0]">Shopify Native</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Price (per month)</td>
                  <td className="text-center py-4 px-6 text-[#22c55e] bg-[#6366f1]/5">$49 - $399</td>
                  <td className="text-center py-4 px-6 text-white">$129 - $2,790</td>
                  <td className="text-center py-4 px-6 text-white">$25 - $999</td>
                  <td className="text-center py-4 px-6 text-white">$999+</td>
                  <td className="text-center py-4 px-6 text-white">Free (limited)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Setup Time</td>
                  <td className="text-center py-4 px-6 text-[#22c55e] bg-[#6366f1]/5">5 minutes</td>
                  <td className="text-center py-4 px-6 text-white">30+ minutes</td>
                  <td className="text-center py-4 px-6 text-white">15 minutes</td>
                  <td className="text-center py-4 px-6 text-white">Hours/Days</td>
                  <td className="text-center py-4 px-6 text-white">N/A</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">True Profit Tracking</td>
                  <td className="text-center py-4 px-6 bg-[#6366f1]/5">
                    <Check className="w-6 h-6 mx-auto text-[#22c55e]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Limited</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">AI Forecasting</td>
                  <td className="text-center py-4 px-6 bg-[#6366f1]/5">
                    <Check className="w-6 h-6 mx-auto text-[#22c55e]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Basic</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Data Ownership</td>
                  <td className="text-center py-4 px-6 bg-[#6366f1]/5">
                    <Check className="w-6 h-6 mx-auto text-[#22c55e]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-6 h-6 mx-auto text-[#22c55e]" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Custom Code Editor</td>
                  <td className="text-center py-4 px-6 bg-[#6366f1]/5">
                    <Check className="w-6 h-6 mx-auto text-[#22c55e]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#ef4444]" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/40">
              <Crown className="w-4 h-4 text-[#22c55e]" />
              <span className="text-sm font-semibold text-[#22c55e]">Winner: Slay Season</span>
            </div>
            <p className="text-lg text-[#8b92b0] mb-6">
              Better features, lower price, faster setup. Why would you choose anything else?
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl"
            >
              Start Your Free Trial →
            </button>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi-calculator" className="py-20 border-b border-white/5 bg-[#1c2033]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              ROI Calculator
            </h2>
            <p className="text-xl text-[#8b92b0]">
              See how much Slay Season will save you this year
            </p>
          </div>

          <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Your Current Situation</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Monthly Revenue
                  </label>
                  <input
                    type="number"
                    value={roiInputs.monthlyRevenue}
                    onChange={(e) => setRoiInputs(prev => ({...prev, monthlyRevenue: parseInt(e.target.value)}))}
                    className="w-full bg-[#0f1117] border border-white/20 rounded-lg px-4 py-3 text-white"
                    placeholder="100000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Hours per week on analytics/reporting
                  </label>
                  <input
                    type="number"
                    value={roiInputs.timeSpent}
                    onChange={(e) => setRoiInputs(prev => ({...prev, timeSpent: parseInt(e.target.value)}))}
                    className="w-full bg-[#0f1117] border border-white/20 rounded-lg px-4 py-3 text-white"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Your hourly rate (or cost of hiring)
                  </label>
                  <input
                    type="number"
                    value={roiInputs.hourlyRate}
                    onChange={(e) => setRoiInputs(prev => ({...prev, hourlyRate: parseInt(e.target.value)}))}
                    className="w-full bg-[#0f1117] border border-white/20 rounded-lg px-4 py-3 text-white"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="bg-[#0f1117] border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-6">Annual Savings with Slay Season</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b92b0]">Time savings value</span>
                    <span className="font-bold text-[#22c55e]">${roi.timeSavings.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b92b0]">20% profit increase</span>
                    <span className="font-bold text-[#22c55e]">${roi.profitIncrease.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b92b0]">Slay Season cost</span>
                    <span className="font-bold text-[#ef4444]">-${(currentPricing.growth * (pricingBilling === 'monthly' ? 12 : 1)).toLocaleString()}</span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white">Net ROI</span>
                      <span className="font-bold text-[#22c55e] text-2xl">${roi.netROI.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-[#8b92b0]">That's a </span>
                      <span className="font-bold text-[#22c55e]">{roi.roiMultiple}x</span>
                      <span className="text-sm text-[#8b92b0]"> return on investment</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className="w-full mt-6 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Start Saving Money →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* We'll Set It Up For You - Concierge */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/40">
            <HeadphonesIcon className="w-5 h-5 text-[#f59e0b]" />
            <span className="text-sm font-semibold text-[#f59e0b]">HUGE DIFFERENTIATOR</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-bold mb-6">
            We'll Set It Up
            <br />
            <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
              For You
            </span>
          </h2>

          <p className="text-xl sm:text-2xl text-[#8b92b0] mb-8 max-w-4xl mx-auto">
            Don't want to deal with setup? No problem. 
            <br />
            <strong className="text-[#f0f2f8]">Send us your login details and we'll have your dashboard ready in 24 hours.</strong>
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
              <div className="w-16 h-16 bg-[#6366f1]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Send Us Your Details</h3>
              <p className="text-[#8b92b0]">
                Just email us your platform login details (secure encrypted transfer). Takes 2 minutes.
              </p>
            </div>

            <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
              <div className="w-16 h-16 bg-[#6366f1]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">We Set Everything Up</h3>
              <p className="text-[#8b92b0]">
                Our team connects all your platforms, configures your dashboard, and validates your data.
              </p>
            </div>

            <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
              <div className="w-16 h-16 bg-[#6366f1]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dashboard Ready</h3>
              <p className="text-[#8b92b0]">
                Get a notification when it's done. Log in and start making better decisions immediately.
              </p>
            </div>
          </div>

          <div className="bg-[#1c2033] border border-[#f59e0b]/30 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-[#f59e0b]" />
              <span className="font-bold text-[#f59e0b]">100% SECURE</span>
            </div>
            <p className="text-[#8b92b0] mb-4">
              We use military-grade encryption and delete all credentials after setup. 
              Your data never leaves secure servers. SOC 2 Type II certified.
            </p>
            <p className="text-sm text-[#8b92b0]">
              Available for Growth and Pro plans. Setup usually completed within 24 hours.
            </p>
          </div>

          <button
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl"
          >
            Sign Up & We'll Set It Up →
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Pricing That Makes Sense
            </h2>
            <p className="text-xl text-[#8b92b0] mb-8">
              No hidden fees. No surprises. Just honest pricing for real value.
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
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-[#8b92b0] mb-6">Perfect for new brands</p>
              
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">
                    ${Math.round(currentPricing.starter)}
                  </span>
                  <span className="text-[#8b92b0]">
                    /{pricingBilling === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {pricingBilling === 'annual' && (
                  <p className="text-xs text-[#22c55e] mt-2">
                    Save ${Math.round((pricing.monthly.starter * 12 - pricing.annual.starter))} per year
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 rounded-lg font-bold transition-all mb-8 border-2 border-[#6366f1]/30 text-white hover:bg-[#6366f1]/10"
              >
                Start Free Trial
              </button>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Up to $500K annual revenue</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Shopify + 2 ad platforms</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Real-time profit tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Basic forecasting</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Email support</span>
                </li>
              </ul>
            </div>

            {/* Growth - Most Popular */}
            <div className="relative md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              
              <div className="bg-[#1c2033] border border-[#6366f1]/50 rounded-xl p-8 h-full">
                <h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
                <p className="text-[#8b92b0] mb-6">For scaling brands</p>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">
                      ${Math.round(currentPricing.growth)}
                    </span>
                    <span className="text-[#8b92b0]">
                      /{pricingBilling === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {pricingBilling === 'annual' && (
                    <p className="text-xs text-[#22c55e] mt-2">
                      Save ${Math.round((pricing.monthly.growth * 12 - pricing.annual.growth))} per year
                    </p>
                  )}
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3 rounded-lg font-bold transition-all mb-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white shadow-lg"
                >
                  Start Free Trial
                </button>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Up to $5M annual revenue</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">All platform integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Advanced AI forecasting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Budget optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Custom reports & API</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]"><strong>We'll set it up for you</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Priority Slack support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro */}
            <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-[#8b92b0] mb-6">For established brands</p>
              
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">
                    ${Math.round(currentPricing.pro)}
                  </span>
                  <span className="text-[#8b92b0]">
                    /{pricingBilling === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {pricingBilling === 'annual' && (
                  <p className="text-xs text-[#22c55e] mt-2">
                    Save ${Math.round((pricing.monthly.pro * 12 - pricing.annual.pro))} per year
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 rounded-lg font-bold transition-all mb-8 border-2 border-[#6366f1]/30 text-white hover:bg-[#6366f1]/10"
              >
                Start Free Trial
              </button>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Unlimited revenue</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Multi-store dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Full API access & webhooks</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">24/7 phone support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              What Founders Are Saying
            </h2>
            <p className="text-xl text-[#8b92b0]">Real results from real DTC founders</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <blockquote className="text-white mb-6 text-lg italic">
                "Slay Season showed us we were losing $40K/month on unprofitable Facebook campaigns. 
                We reallocated budget and increased profit by 35% in 60 days. Best investment we've made."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Sarah Chen</p>
                  <p className="text-[#8b92b0] text-sm">CEO, Glow Beauty Co. · $2.5M ARR</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <blockquote className="text-white mb-6 text-lg italic">
                "Setup took 4 minutes. I was shocked how easy it was. Now I have better data than brands 
                10x my size. The AI forecasting is scary accurate - helped me avoid a cash flow crisis."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MT</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Marcus Thompson</p>
                  <p className="text-[#8b92b0] text-sm">CMO, Revival Wellness · $800K ARR</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1c2033] border border-white/10 rounded-xl p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <blockquote className="text-white mb-6 text-lg italic">
                "I was spending 20 hours a week on spreadsheets. Now it's zero. Slay Season gives me back 
                my weekends and shows me insights I never would have found manually."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PP</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Priya Patel</p>
                  <p className="text-[#8b92b0] text-sm">Owner, Artisan Home Studio · $1.2M ARR</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#22c55e] mb-2">500+</div>
              <div className="text-[#8b92b0]">Active Brands</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#22c55e] mb-2">$2B+</div>
              <div className="text-[#8b92b0]">Revenue Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#22c55e] mb-2">94%</div>
              <div className="text-[#8b92b0]">Setup in &lt;10min</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#22c55e] mb-2">4.9/5</div>
              <div className="text-[#8b92b0]">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Common Questions
            </h2>
            <p className="text-xl text-[#8b92b0]">
              The honest answers to what you're really wondering
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-white/10 rounded-lg overflow-hidden hover:border-[#6366f1]/50 transition-all"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
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

          <div className="text-center mt-12">
            <p className="text-[#8b92b0] mb-4">Still have questions?</p>
            <button className="flex items-center gap-2 mx-auto text-[#6366f1] hover:text-[#a855f7] transition-colors font-semibold">
              <MessageSquare className="w-5 h-5" />
              Chat with our team
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA with Urgency */}
      <section className="relative py-20 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a855f7]/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/40">
            <Clock className="w-4 h-4 text-[#ef4444]" />
            <span className="text-sm font-semibold text-[#ef4444]">LIMITED TIME: Black Friday 50% Off</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            Your Competition is Already
            <br />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
              Using Better Data
            </span>
          </h2>

          <p className="text-xl sm:text-2xl text-[#8b92b0] mb-8 max-w-4xl mx-auto">
            Every day you wait is another day you're making decisions with bad data.
            <br />
            <strong className="text-[#f0f2f8]">Start your free trial now. No credit card required.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#d946ef] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center justify-center gap-2 group text-center"
            >
              Start Your Free Trial (14 Days)
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg border-2 border-[#6366f1]/30 text-white hover:bg-[#6366f1]/10 transition-all"
            >
              Already Have an Account?
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#8b92b0]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#22c55e]" />
              5-minute setup
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#22c55e]" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <HeadphonesIcon className="w-4 h-4 text-[#22c55e]" />
              We'll set it up for you
            </div>
          </div>
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
                The all-in-one analytics platform for DTC brands who want to grow profitably.
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
                    onClick={() => scrollToSection('comparison')}
                    className="text-[#8b92b0] hover:text-white transition-colors text-sm"
                  >
                    vs Competition
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection('faq')}
                    className="text-[#8b92b0] hover:text-white transition-colors text-sm"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button className="text-[#8b92b0] hover:text-white transition-colors text-sm">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="text-[#8b92b0] hover:text-white transition-colors text-sm">
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => navigate('/privacy')}
                    className="text-[#8b92b0] hover:text-white transition-colors text-sm"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/terms')}
                    className="text-[#8b92b0] hover:text-white transition-colors text-sm"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

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

        html {
          scroll-behavior: smooth;
        }

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

        ::selection {
          background-color: #6366f1;
          color: #f0f2f8;
        }

        button:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
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
  Brain,
  LineChart,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Gauge,
  Sparkles,
  AlertTriangle,
  Play,
  X,
  Calculator,
  HeadphonesIcon,
  Award,
  Menu,
  Percent,
  Smartphone,
  Globe,
  Layers,
  MessageSquare,
  Settings,
  Download,
  Lock,
  Wifi
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingBilling, setPricingBilling] = useState('monthly');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [roiInputs, setRoiInputs] = useState({
    analyticsSpend: 300,
    timeSpent: 8
  });
  const heroRef = useRef(null);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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
    setMobileMenuOpen(false);
  };

  const pricing = {
    monthly: {
      starter: 49,
      growth: 149,
      pro: 399,
    },
    annual: {
      starter: Math.round(49 * 12 * 0.8),
      growth: Math.round(149 * 12 * 0.8),
      pro: Math.round(399 * 12 * 0.8),
    },
  };

  const currentPricing = pricing[pricingBilling];

  // ROI Calculator
  const calculateROI = () => {
    const timeValue = roiInputs.timeSpent * 75 * 52; // $75/hr * weekly time * 52 weeks
    const profitIncrease = roiInputs.analyticsSpend * 10 * 12; // 10x return monthly * 12 months
    const totalSavings = timeValue + profitIncrease;
    const annualCost = currentPricing.growth * (pricingBilling === 'monthly' ? 12 : 1);
    return {
      timeSavings: timeValue,
      profitIncrease: profitIncrease,
      totalSavings: totalSavings,
      netROI: totalSavings - annualCost,
      roiMultiple: Math.round((totalSavings / annualCost) * 10) / 10
    };
  };

  const roi = calculateROI();

  const faqs = [
    {
      question: 'How long does setup actually take?',
      answer: 'Literally 5 minutes. One-click OAuth for Shopify, Meta, Google, and Klaviyo. No API keys, no developer needed, no technical BS. Connect your platforms and start seeing unified data immediately.'
    },
    {
      question: 'What if my data is wrong or incomplete?',
      answer: 'We audit every integration during setup. If something looks off, our team fixes it for free within 24 hours. We validate your numbers against each platform to ensure 99%+ accuracy. Your data quality is our reputation.'
    },
    {
      question: 'How do you compare to Triple Whale and Northbeam?',
      answer: 'Triple Whale: $129-$2,790/month, clunky interface, shows vanity metrics. Northbeam: $999+/month, overcomplicated, built for enterprises. We\'re $49-$399/month with modern UI, true profit tracking, and better forecasting.'
    },
    {
      question: 'What if I\'m not technical at all?',
      answer: 'Perfect! Slay Season was built for business owners, not data scientists. Everything is point-and-click. Plus our concierge service means we can set up your entire dashboard for you in 24 hours.'
    },
    {
      question: 'Can I cancel if it doesn\'t work for me?',
      answer: 'Absolutely. Cancel with one click in your dashboard. 14-day money-back guarantee, no questions asked. If you cancel within 14 days, automatic full refund. After that, prorated refund.'
    },
    {
      question: 'What platforms do you integrate with?',
      answer: 'Shopify (required), Meta Ads, Google Ads, Google Analytics 4, Klaviyo, TikTok Ads, Snapchat Ads, Pinterest Ads. We add new integrations monthly based on user requests. Custom integrations for Pro customers.'
    },
    {
      question: 'How accurate is your profit tracking?',
      answer: 'More accurate than any competitor. We factor in: COGS, ad spend, shipping, payment fees, refunds, discounts, chargebacks, and even your fixed costs like software subscriptions. True profit in your bank account.'
    },
    {
      question: 'What support do you provide?',
      answer: 'Starter: Email (24hr response). Growth: Priority Slack + setup concierge. Pro: Dedicated account manager + custom reporting. Everyone gets our founder community access and comprehensive help docs.'
    },
    {
      question: 'Do you have an API or exports?',
      answer: 'Yes! Growth includes API access and CSV exports. Pro includes full API, webhooks, and white-label options. You own your data—we just make it useful. Export everything anytime.'
    },
    {
      question: 'What if I have multiple stores?',
      answer: 'Each Shopify store needs its own plan, but we offer bulk discounts for 3+ stores. Pro plan includes consolidated multi-store dashboards. Perfect for agencies or holding companies.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Bank-level security. SOC 2 Type II certified, GDPR compliant. All data encrypted at rest and in transit. We never sell data or share with competitors. Delete everything instantly from your dashboard.'
    },
    {
      question: 'What if I outgrow the Starter plan?',
      answer: 'Upgrade instantly with pro-rated billing. As you scale, Slay Season gets smarter with more data points. Our AI forecasting actually improves accuracy with larger datasets.'
    }
  ];

  return (
    <div className="w-full bg-[#0a0b0f] text-[#f0f2f8] overflow-hidden">
      {/* Add CSS for animations */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        
        .glass-morphism {
          backdrop-filter: blur(16px) saturate(180%);
          background: rgba(28, 32, 51, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .floating-particles::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.15) 2px, transparent 2px);
          background-size: 50px 50px;
          animation: float 20s linear infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-50px); }
        }
      `}</style>

      {/* Fixed Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-morphism shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
              Slay Season
            </span>
          </div>

          {/* Desktop Navigation */}
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
              onClick={() => scrollToSection('founder-story')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
            >
              Story
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
            >
              FAQ
            </button>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-[#f0f2f8]" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-morphism border-t border-white/10">
            <div className="px-4 py-4 space-y-4">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('founder-story')}
                className="block w-full text-left text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
              >
                Story
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
              >
                FAQ
              </button>
              <hr className="border-white/10" />
              <button
                onClick={() => navigate('/login')}
                className="block w-full text-left text-[#8b92b0] hover:text-[#f0f2f8] transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white py-2 rounded-lg font-semibold"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden floating-particles">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3b82f6]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#10b981]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Badges */}
          <div className="inline-flex items-center gap-4 mb-8 px-8 py-4 rounded-full glass-morphism">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#10b981]" />
              <span className="text-sm font-semibold text-[#10b981]">500+ brands</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#10b981]" />
              <span className="text-sm font-semibold text-[#10b981]">$128M+ tracked</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#10b981]" />
              <span className="text-sm font-semibold text-[#10b981]">94% accuracy</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-8 leading-tight">
            Finally See Your
            <br />
            <span className="bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#10b981] bg-clip-text text-transparent">
              Real Profit
            </span>
            <br />
            In Real Time
          </h1>

          {/* Subtext */}
          <p className="text-xl sm:text-2xl text-[#8b92b0] mb-8 max-w-4xl mx-auto leading-relaxed">
            Stop drowning in spreadsheets and fragmented data.
            <br />
            <strong className="text-[#f0f2f8]">One dashboard. All your platforms. True profit tracking.</strong>
          </p>

          {/* Animated Dashboard Preview */}
          <div className="glass-morphism rounded-2xl p-1 mb-8 max-w-4xl mx-auto shadow-2xl">
            <div className="bg-[#0a0b0f] rounded-xl p-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#10b981]">$847K</div>
                  <div className="text-xs text-[#8b92b0]">True Profit This Month</div>
                </div>
                <div className="bg-gradient-to-r from-[#3b82f6]/20 to-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#3b82f6]">4.7x</div>
                  <div className="text-xs text-[#8b92b0]">True ROAS</div>
                </div>
                <div className="bg-gradient-to-r from-[#8b5cf6]/20 to-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#8b5cf6]">$1.2M</div>
                  <div className="text-xs text-[#8b92b0]">Forecasted Revenue</div>
                </div>
              </div>
              <div className="h-32 glass-morphism rounded-lg flex items-center justify-center">
                <div className="text-[#8b92b0] flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>Live Dashboard Preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center justify-center gap-2 group transform hover:scale-105"
            >
              Start Free Trial — No Credit Card
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg glass-morphism text-white hover:bg-[#3b82f6]/10 transition-all flex items-center justify-center gap-2 border border-[#3b82f6]/30"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#8b92b0]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#10b981]" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#10b981]" />
              5-minute setup
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#10b981]" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#8b92b0] mb-8 font-semibold">Works with the tools you already use</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            <div className="flex items-center gap-3 glass-morphism px-6 py-3 rounded-lg">
              <div className="w-8 h-8 bg-[#95bf47] rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
              <span className="font-semibold">Shopify</span>
            </div>
            <div className="flex items-center gap-3 glass-morphism px-6 py-3 rounded-lg">
              <div className="w-8 h-8 bg-[#1877f2] rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
              <span className="font-semibold">Meta</span>
            </div>
            <div className="flex items-center gap-3 glass-morphism px-6 py-3 rounded-lg">
              <div className="w-8 h-8 bg-[#4285f4] rounded-lg flex items-center justify-center text-white font-bold text-sm">G</div>
              <span className="font-semibold">Google</span>
            </div>
            <div className="flex items-center gap-3 glass-morphism px-6 py-3 rounded-lg">
              <div className="w-8 h-8 bg-[#ff6900] rounded-lg flex items-center justify-center text-white font-bold text-sm">K</div>
              <span className="font-semibold">Klaviyo</span>
            </div>
            <div className="flex items-center gap-3 glass-morphism px-6 py-3 rounded-lg">
              <div className="w-8 h-8 bg-[#e37400] rounded-lg flex items-center justify-center text-white font-bold text-sm">GA</div>
              <span className="font-semibold">GA4</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem - "Sound Familiar?" */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-br from-[#0a0b0f] to-[#1a1b23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-[#f87171]">Sound Familiar?</span>
            </h2>
            <p className="text-xl text-[#8b92b0]">Real quotes from founders before they found Slay Season</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-morphism rounded-xl p-8 border border-[#f87171]/30 animate-on-scroll">
              <AlertTriangle className="w-8 h-8 text-[#f87171] mb-4" />
              <blockquote className="text-[#f0f2f8] mb-4 italic leading-relaxed">
                "I spend 15 hours every week updating spreadsheets. Pulling data from Shopify, Meta, Google, Klaviyo... 
                by the time I finish, it's already outdated. I should be running my business, not doing data entry."
              </blockquote>
              <div className="text-sm text-[#8b92b0]">
                — Sarah M., Beauty Brand ($2M ARR)
              </div>
            </div>

            <div className="glass-morphism rounded-xl p-8 border border-[#f87171]/30 animate-on-scroll">
              <BarChart3 className="w-8 h-8 text-[#f87171] mb-4" />
              <blockquote className="text-[#f0f2f8] mb-4 italic leading-relaxed">
                "Meta shows 4.2x ROAS. Google shows 6.1x ROAS. Shopify shows revenue going up. 
                But my bank account is getting smaller. Which numbers do I trust? I'm flying blind."
              </blockquote>
              <div className="text-sm text-[#8b92b0]">
                — Marcus T., Supplement Brand ($500K ARR)
              </div>
            </div>

            <div className="glass-morphism rounded-xl p-8 border border-[#f87171]/30 animate-on-scroll">
              <TrendingUp className="w-8 h-8 text-[#f87171] mb-4" />
              <blockquote className="text-[#f0f2f8] mb-4 italic leading-relaxed">
                "iOS 14.5 broke everything. Meta's reporting is useless now. I don't know which ads actually work. 
                I'm wasting thousands on ads that look good in Meta but don't drive real profit."
              </blockquote>
              <div className="text-sm text-[#8b92b0]">
                — Jennifer K., Fashion Brand ($3M ARR)
              </div>
            </div>
          </div>

          <div className="text-center mt-12 animate-on-scroll">
            <p className="text-2xl text-[#f0f2f8] mb-6 font-semibold">
              Stop the pain. Get clarity in 5 minutes.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl transform hover:scale-105"
            >
              Try Slay Season Free →
            </button>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section id="founder-story" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/40">
                <Award className="w-5 h-5 text-[#f59e0b]" />
                <span className="text-sm font-semibold text-[#f59e0b]">Built By Operators, Not Engineers</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                We Built the Tool 
                <br />
                <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                  We Always Wished Existed
                </span>
              </h2>

              <div className="space-y-6 text-lg text-[#8b92b0] leading-relaxed">
                <p>
                  <strong className="text-[#f0f2f8]">Leo and his co-founder spent over a decade in ecommerce.</strong> 
                  They made millions of dollars across multiple ecommerce businesses. They also helped hundreds of brands over the years as a marketing agency.
                </p>
                
                <p>
                  Through all of this, they were <strong className="text-[#f0f2f8]">exhausted</strong> — never being able to get a clear picture of their business without spending late nights doing spreadsheets and talking to accountants and finance teams.
                </p>

                <p>
                  <strong className="text-[#f0f2f8]">"We were STILL spending late nights on spreadsheets and accountant calls..."</strong>
                </p>

                <p>
                  Their goal was simple: <strong className="text-[#10b981]">have a tool in your pocket that lets you look at your business data anytime to make informed decisions.</strong>
                </p>

                <p className="text-xl font-semibold text-[#f0f2f8]">
                  That's why they built Slay Season.
                </p>
              </div>
            </div>

            <div className="animate-on-scroll">
              <div className="glass-morphism rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    L
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">Leo Martinez</div>
                    <div className="text-[#8b92b0] text-sm">Co-Founder & CEO</div>
                    <div className="text-[#10b981] text-xs">$50M+ Revenue Generated</div>
                  </div>
                </div>

                <blockquote className="text-[#f0f2f8] text-lg italic mb-4 leading-relaxed">
                  "After helping 500+ brands optimize their marketing, I realized we were all solving the same problem over and over: getting a single source of truth for business performance. 
                  
                  Slay Season is the dashboard I wish I had for my own businesses."
                </blockquote>

                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#10b981]">10+</div>
                    <div className="text-xs text-[#8b92b0]">Years in Ecommerce</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#3b82f6]">500+</div>
                    <div className="text-xs text-[#8b92b0]">Brands Helped</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#8b5cf6]">$50M+</div>
                    <div className="text-xs text-[#8b92b0]">Revenue Generated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-br from-[#0a0b0f] to-[#1a1b23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              One Dashboard.
              <br />
              <span className="bg-gradient-to-r from-[#10b981] to-[#3b82f6] bg-clip-text text-transparent">
                Zero Guesswork.
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <h3 className="text-3xl font-bold text-white mb-6">Before Slay Season</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#f87171]">
                  <X className="w-5 h-5" />
                  <span>15+ hours/week on spreadsheets</span>
                </div>
                <div className="flex items-center gap-3 text-[#f87171]">
                  <X className="w-5 h-5" />
                  <span>Data scattered across 6 platforms</span>
                </div>
                <div className="flex items-center gap-3 text-[#f87171]">
                  <X className="w-5 h-5" />
                  <span>Vanity metrics, not true profit</span>
                </div>
                <div className="flex items-center gap-3 text-[#f87171]">
                  <X className="w-5 h-5" />
                  <span>Make decisions based on guesswork</span>
                </div>
                <div className="flex items-center gap-3 text-[#f87171]">
                  <X className="w-5 h-5" />
                  <span>No idea which ads actually work</span>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll">
              <h3 className="text-3xl font-bold text-white mb-6">After Slay Season</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#10b981]">
                  <Check className="w-5 h-5" />
                  <span>5-minute daily check-ins</span>
                </div>
                <div className="flex items-center gap-3 text-[#10b981]">
                  <Check className="w-5 h-5" />
                  <span>All data unified in one dashboard</span>
                </div>
                <div className="flex items-center gap-3 text-[#10b981]">
                  <Check className="w-5 h-5" />
                  <span>True profit after all costs</span>
                </div>
                <div className="flex items-center gap-3 text-[#10b981]">
                  <Check className="w-5 h-5" />
                  <span>Data-driven decisions with confidence</span>
                </div>
                <div className="flex items-center gap-3 text-[#10b981]">
                  <Check className="w-5 h-5" />
                  <span>Know exactly which campaigns are profitable</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16 animate-on-scroll">
            <h3 className="text-2xl font-bold text-white mb-8">3 Key Outcomes</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-morphism rounded-xl p-6">
                <div className="w-12 h-12 bg-[#10b981]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-[#10b981]" />
                </div>
                <h4 className="font-bold text-white mb-2">Save 10+ Hours/Week</h4>
                <p className="text-[#8b92b0]">No more manual spreadsheets or data hunting across platforms</p>
              </div>
              <div className="glass-morphism rounded-xl p-6">
                <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <h4 className="font-bold text-white mb-2">Increase Profit 15-30%</h4>
                <p className="text-[#8b92b0]">Better allocation + killing unprofitable campaigns</p>
              </div>
              <div className="glass-morphism rounded-xl p-6">
                <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <h4 className="font-bold text-white mb-2">Make Confident Decisions</h4>
                <p className="text-[#8b92b0]">Data-driven choices based on true performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep-Dive */}
      <section id="features" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Features That Actually
              <br />
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                Move The Needle
              </span>
            </h2>
            <p className="text-xl text-[#8b92b0] max-w-3xl mx-auto">
              Every feature solves a real problem DTC founders face daily
            </p>
          </div>

          <div className="space-y-20">
            {/* Feature 1 - Real-Time Profit */}
            <div className="grid lg:grid-cols-2 gap-12 items-center animate-on-scroll">
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#10b981]/20 border border-[#10b981]/40">
                  <DollarSign className="w-4 h-4 text-[#10b981]" />
                  <span className="text-sm font-semibold text-[#10b981]">Most Requested</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Real-Time Profit Tracking</h3>
                <p className="text-lg text-[#8b92b0] mb-6 leading-relaxed">
                  See your actual profit, not vanity metrics. We factor in COGS, ad spend, shipping, fees, refunds, 
                  and even monthly expenses. Know exactly how much money hits your bank account.
                </p>
                
                <div className="bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-[#f0f2f8] font-semibold">Pain it solves:</p>
                  <p className="text-sm text-[#8b92b0]">"I see $100K revenue but only $15K profit. Where did the other $85K go?"</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Real-time profit margins by product, channel, and campaign</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Automatically accounts for all costs including COGS and fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Identifies which products and campaigns are actually profitable</span>
                  </li>
                </ul>
              </div>
              <div className="glass-morphism rounded-xl p-6">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-white">True Profit Breakdown</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#0a0b0f] rounded-lg">
                    <span className="text-[#8b92b0]">Gross Revenue</span>
                    <span className="font-bold text-white">$84,250</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#0a0b0f] rounded-lg">
                    <span className="text-[#8b92b0]">- COGS</span>
                    <span className="font-bold text-[#f87171]">-$33,700</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#0a0b0f] rounded-lg">
                    <span className="text-[#8b92b0]">- Ad Spend</span>
                    <span className="font-bold text-[#f87171]">-$16,850</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#0a0b0f] rounded-lg">
                    <span className="text-[#8b92b0]">- Shipping & Fees</span>
                    <span className="font-bold text-[#f87171]">-$8,425</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center p-3 bg-[#10b981]/20 border border-[#10b981]/40 rounded-lg">
                      <span className="font-bold text-[#10b981]">True Profit</span>
                      <span className="font-bold text-[#10b981] text-xl">$25,275</span>
                    </div>
                    <p className="text-center text-sm text-[#8b92b0] mt-2">30% profit margin (vs 10-15% industry avg)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - AI Forecasting */}
            <div className="grid lg:grid-cols-2 gap-12 items-center animate-on-scroll">
              <div className="order-2 lg:order-1">
                <div className="glass-morphism rounded-xl p-6">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-white">AI Revenue Forecast - Next 90 Days</h4>
                  </div>
                  <div className="h-48 flex items-end gap-2 mb-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1">
                        <div 
                          className="bg-[#3b82f6]/30 rounded-t"
                          style={{ height: `${30 + i * 8 + Math.sin(i) * 10}%` }}
                        />
                        <div 
                          className="bg-[#3b82f6] rounded-b"
                          style={{ height: `${40 + i * 6}%` }}
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
                      <p className="font-bold text-[#10b981]">$127K</p>
                    </div>
                    <div>
                      <p className="text-[#8b92b0] text-xs">Optimistic</p>
                      <p className="font-bold text-[#3b82f6]">$165K</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40">
                  <Brain className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-sm font-semibold text-[#8b5cf6]">AI-Powered</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">AI Revenue Forecasting</h3>
                <p className="text-lg text-[#8b92b0] mb-6 leading-relaxed">
                  Predict your revenue, profit, and cash flow with scary accuracy. Our AI learns from your historical data 
                  and external factors like seasonality, trends, and market conditions.
                </p>
                
                <div className="bg-[#f87171]/10 border border-[#f87171]/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-[#f0f2f8] font-semibold">Pain it solves:</p>
                  <p className="text-sm text-[#8b92b0]">"Will I hit my Q4 targets? Should I increase ad spend? Do I need more inventory?"</p>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">90-day revenue predictions with 85%+ accuracy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Identifies seasonal trends and growth opportunities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#f0f2f8]">Alerts you before cash flow problems hit</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* More Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 animate-on-scroll">
              <div className="glass-morphism rounded-xl p-6 border border-[#3b82f6]/30">
                <Target className="w-8 h-8 text-[#3b82f6] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">Budget Optimizer</h4>
                <p className="text-[#8b92b0] text-sm mb-4">
                  AI automatically recommends optimal budget allocation across channels for maximum ROAS.
                </p>
                <div className="text-xs text-[#3b82f6] bg-[#3b82f6]/10 px-3 py-1 rounded-full">
                  +15-30% ROAS improvement
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6 border border-[#8b5cf6]/30">
                <Layers className="w-8 h-8 text-[#8b5cf6] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">Multi-Channel Attribution</h4>
                <p className="text-[#8b92b0] text-sm mb-4">
                  True attribution that accounts for iOS 14.5 limitations and cross-channel touchpoints.
                </p>
                <div className="text-xs text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-full">
                  Post-iOS 14.5 accuracy
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6 border border-[#10b981]/30">
                <MessageSquare className="w-8 h-8 text-[#10b981] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">AI Chat Assistant</h4>
                <p className="text-[#8b92b0] text-sm mb-4">
                  Ask questions about your data in plain English. Get instant insights and recommendations.
                </p>
                <div className="text-xs text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full">
                  Natural language queries
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6 border border-[#f59e0b]/30">
                <Settings className="w-8 h-8 text-[#f59e0b] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">Custom Reports</h4>
                <p className="text-[#8b92b0] text-sm mb-4">
                  Build any report you want with our visual code editor. No technical skills required.
                </p>
                <div className="text-xs text-[#f59e0b] bg-[#f59e0b]/10 px-3 py-1 rounded-full">
                  Visual editor included
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6 border border-[#3b82f6]/30">
                <Wifi className="w-8 h-8 text-[#3b82f6] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">One-Click Integrations</h4>
                <p className="text-[#8b92b0] text-sm mb-4">
                  Connect all platforms in minutes with OAuth. No API keys, no developer required.
                </p>
                <div className="text-xs text-[#3b82f6] bg-[#3b82f6]/10 px-3 py-1 rounded-full">
                  5-minute setup
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6 border border-[#8b5cf6]/30">
                <Smartphone className="w-8 h-8 text-[#8b5cf6] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">Mobile Dashboard</h4>
                <p className="text-[#8b92b0] text-sm mb-4">
                  Check your key metrics anywhere. Native mobile app coming Q1 2025.
                </p>
                <div className="text-xs text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-full">
                  Mobile-optimized
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6 border border-[#10b981]/30">
                <Download className="w-8 h-8 text-[#10b981] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">Data Exports</h4>
                <p className="text-[#8b92b0] text-sm mb-4">
                  Export any data as CSV, PDF, or via API. You own your data, always.
                </p>
                <div className="text-xs text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full">
                  Full data ownership
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6 border border-[#f59e0b]/30">
                <Globe className="w-8 h-8 text-[#f59e0b] mb-4" />
                <h4 className="text-xl font-bold text-white mb-3">Multi-Currency</h4>
                <p className="text-[#8b92b0] text-sm mb-4">
                  Perfect for international brands. Automatic currency conversion and regional insights.
                </p>
                <div className="text-xs text-[#f59e0b] bg-[#f59e0b]/10 px-3 py-1 rounded-full">
                  Global ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-br from-[#0a0b0f] to-[#1a1b23]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-[#8b92b0]">Get set up in 5 minutes, see results immediately</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 animate-on-scroll">
            <div className="relative">
              <div className="glass-morphism rounded-xl p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Connect Your Store</h3>
                <p className="text-[#8b92b0]">One-click OAuth for Shopify, Meta, Google, and Klaviyo. No API keys or technical setup required.</p>
                <div className="mt-4 text-sm text-[#3b82f6]">⚡ Takes 2 minutes</div>
              </div>
              {/* Connecting line */}
              <div className="hidden md:block absolute top-20 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]"></div>
            </div>

            <div className="relative">
              <div className="glass-morphism rounded-xl p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#8b5cf6] to-[#10b981] rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-white mb-4">See Your Real Numbers</h3>
                <p className="text-[#8b92b0]">Instantly unified dashboard showing true profit, ROAS, and performance across all channels.</p>
                <div className="mt-4 text-sm text-[#8b5cf6]">🚀 Instant results</div>
              </div>
              {/* Connecting line */}
              <div className="hidden md:block absolute top-20 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#8b5cf6] to-[#10b981]"></div>
            </div>

            <div>
              <div className="glass-morphism rounded-xl p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl">
                  3
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Make Smarter Decisions</h3>
                <p className="text-[#8b92b0]">Use AI insights, forecasting, and budget optimization to scale profitably every day.</p>
                <div className="mt-4 text-sm text-[#10b981]">📈 Scale with confidence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How We Stack Up
            </h2>
            <p className="text-xl text-[#8b92b0] max-w-3xl mx-auto">
              We built Slay Season because existing solutions suck. Here's the honest comparison.
            </p>
          </div>

          <div className="overflow-x-auto animate-on-scroll">
            <table className="w-full min-w-max glass-morphism rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[#0a0b0f] border-b border-white/10">
                  <th className="text-left py-6 px-6 font-bold text-white">Feature</th>
                  <th className="text-center py-6 px-6 font-bold text-[#3b82f6] bg-[#3b82f6]/10">Slay Season</th>
                  <th className="text-center py-6 px-6 font-bold text-[#8b92b0]">Triple Whale</th>
                  <th className="text-center py-6 px-6 font-bold text-[#8b92b0]">BeProfit</th>
                  <th className="text-center py-6 px-6 font-bold text-[#8b92b0]">Northbeam</th>
                  <th className="text-center py-6 px-6 font-bold text-[#8b92b0]">Shopify Native</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Monthly Price</td>
                  <td className="text-center py-4 px-6 text-[#10b981] bg-[#3b82f6]/5 font-bold">$49 - $399</td>
                  <td className="text-center py-4 px-6 text-white">$129 - $2,790</td>
                  <td className="text-center py-4 px-6 text-white">$25 - $999</td>
                  <td className="text-center py-4 px-6 text-white">$999+</td>
                  <td className="text-center py-4 px-6 text-white">Free (limited)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Setup Time</td>
                  <td className="text-center py-4 px-6 text-[#10b981] bg-[#3b82f6]/5 font-bold">5 minutes</td>
                  <td className="text-center py-4 px-6 text-white">30+ minutes</td>
                  <td className="text-center py-4 px-6 text-white">15 minutes</td>
                  <td className="text-center py-4 px-6 text-white">Hours/Days</td>
                  <td className="text-center py-4 px-6 text-white">Built-in</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">True Profit Tracking</td>
                  <td className="text-center py-4 px-6 bg-[#3b82f6]/5">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Limited</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">AI Forecasting</td>
                  <td className="text-center py-4 px-6 bg-[#3b82f6]/5">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Basic</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Budget Optimizer</td>
                  <td className="text-center py-4 px-6 bg-[#3b82f6]/5">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Basic</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Basic</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Multi-channel Attribution</td>
                  <td className="text-center py-4 px-6 bg-[#3b82f6]/5">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Basic</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Custom Reports</td>
                  <td className="text-center py-4 px-6 bg-[#3b82f6]/5">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Limited</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Limited</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 px-6 font-semibold text-white">Data Ownership</td>
                  <td className="text-center py-4 px-6 bg-[#3b82f6]/5">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-white">Setup Concierge</td>
                  <td className="text-center py-4 px-6 bg-[#3b82f6]/5">
                    <Check className="w-6 h-6 mx-auto text-[#10b981]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                  <td className="text-center py-4 px-6">
                    <span className="text-[#f59e0b]">Enterprise Only</span>
                  </td>
                  <td className="text-center py-4 px-6">
                    <X className="w-6 h-6 mx-auto text-[#f87171]" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-12 animate-on-scroll">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#10b981]/20 border border-[#10b981]/40">
              <Award className="w-4 h-4 text-[#10b981]" />
              <span className="text-sm font-semibold text-[#10b981]">Clear Winner: Slay Season</span>
            </div>
            <p className="text-lg text-[#8b92b0] mb-6">
              Better features, lower price, faster setup, and we actually care about your success.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl transform hover:scale-105"
            >
              Start Your Free Trial →
            </button>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-br from-[#0a0b0f] to-[#1a1b23]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              ROI Calculator
            </h2>
            <p className="text-xl text-[#8b92b0]">
              See how much Slay Season will save you this year
            </p>
          </div>

          <div className="glass-morphism rounded-xl p-8 animate-on-scroll">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Your Current Situation</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    How much do you spend on analytics tools per month?
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-[#8b92b0]" />
                    <input
                      type="number"
                      value={roiInputs.analyticsSpend}
                      onChange={(e) => setRoiInputs(prev => ({...prev, analyticsSpend: parseInt(e.target.value) || 0}))}
                      className="w-full pl-10 pr-4 py-3 bg-[#0a0b0f] border border-white/20 rounded-lg text-white"
                      placeholder="300"
                    />
                  </div>
                  <p className="text-xs text-[#8b92b0] mt-1">Triple Whale, BeProfit, Northbeam, etc.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Hours per week on analytics/reporting
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5 text-[#8b92b0]" />
                    <input
                      type="number"
                      value={roiInputs.timeSpent}
                      onChange={(e) => setRoiInputs(prev => ({...prev, timeSpent: parseInt(e.target.value) || 0}))}
                      className="w-full pl-10 pr-4 py-3 bg-[#0a0b0f] border border-white/20 rounded-lg text-white"
                      placeholder="8"
                    />
                  </div>
                  <p className="text-xs text-[#8b92b0] mt-1">Spreadsheets, data collection, reporting</p>
                </div>
              </div>

              {/* Results */}
              <div className="bg-[#0a0b0f] border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-6">Annual Savings with Slay Season</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b92b0]">Time savings (${roiInputs.timeSpent}hr/wk × $75/hr)</span>
                    <span className="font-bold text-[#10b981]">${roi.timeSavings.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b92b0]">Better decisions (10x ROI improvement)</span>
                    <span className="font-bold text-[#10b981]">${roi.profitIncrease.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b92b0]">Slay Season cost (Growth plan)</span>
                    <span className="font-bold text-[#f87171]">-${(currentPricing.growth * (pricingBilling === 'monthly' ? 12 : 1)).toLocaleString()}</span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white">Net Annual Savings</span>
                      <span className="font-bold text-[#10b981] text-2xl">${roi.netROI.toLocaleString()}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-[#8b92b0]">That's a </span>
                      <span className="font-bold text-[#10b981] text-lg">{roi.roiMultiple}x</span>
                      <span className="text-sm text-[#8b92b0]"> return on investment</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className="w-full mt-6 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
                >
                  Start Saving Money →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* We'll Set It Up For You */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-r from-[#3b82f6]/10 to-[#8b5cf6]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/40 animate-on-scroll">
            <HeadphonesIcon className="w-5 h-5 text-[#f59e0b]" />
            <span className="text-sm font-semibold text-[#f59e0b]">KILLER DIFFERENTIATOR</span>
          </div>

          <div className="animate-on-scroll">
            <h2 className="text-4xl sm:text-6xl font-bold mb-6">
              We'll Set It Up
              <br />
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                For You
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-[#8b92b0] mb-8 max-w-4xl mx-auto leading-relaxed">
              Don't want to deal with setup? No problem.
              <br />
              <strong className="text-[#f0f2f8]">Send us your login details and we'll have your dashboard ready in 30 minutes.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12 animate-on-scroll">
            <div className="glass-morphism rounded-xl p-8">
              <div className="w-16 h-16 bg-[#3b82f6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Send Us Your Details</h3>
              <p className="text-[#8b92b0] leading-relaxed">
                Email us your platform credentials (secure encrypted transfer). Takes 2 minutes.
              </p>
            </div>

            <div className="glass-morphism rounded-xl p-8">
              <div className="w-16 h-16 bg-[#3b82f6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">We Connect Everything</h3>
              <p className="text-[#8b92b0] leading-relaxed">
                Our team connects all platforms, configures your dashboard, and validates your data.
              </p>
            </div>

            <div className="glass-morphism rounded-xl p-8">
              <div className="w-16 h-16 bg-[#3b82f6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dashboard Ready</h3>
              <p className="text-[#8b92b0] leading-relaxed">
                Get notified when complete. Log in and start making data-driven decisions immediately.
              </p>
            </div>
          </div>

          <div className="glass-morphism border border-[#10b981]/30 rounded-xl p-8 mb-8 animate-on-scroll">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-[#10b981]" />
              <span className="font-bold text-[#10b981]">BANK-LEVEL SECURITY</span>
            </div>
            <p className="text-[#8b92b0] mb-4 leading-relaxed">
              Military-grade encryption, SOC 2 Type II certified. We delete all credentials after setup. 
              Your data never leaves secure servers.
            </p>
            <p className="text-sm text-[#8b92b0]">
              Available for Growth and Pro plans. Setup usually completed within 24 hours.
            </p>
          </div>

          <button
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 animate-on-scroll"
          >
            Sign Up & We'll Set It Up →
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-on-scroll">
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
                className="relative inline-flex h-8 w-14 items-center rounded-full glass-morphism border border-white/10 transition-colors"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] transition-transform ${
                    pricingBilling === 'annual' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${pricingBilling === 'annual' ? 'text-white' : 'text-[#8b92b0]'}`}>
                  Annual
                </span>
                <span className="bg-[#10b981]/20 text-[#10b981] text-xs font-bold px-3 py-1 rounded-full">
                  SAVE 20%
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-on-scroll">
            {/* Starter */}
            <div className="glass-morphism rounded-xl p-8 border border-white/10">
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
                  <p className="text-xs text-[#10b981] mt-2">
                    Save ${Math.round((pricing.monthly.starter * 12 - pricing.annual.starter))} per year
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 rounded-lg font-bold transition-all mb-8 border-2 border-[#3b82f6]/30 text-white hover:bg-[#3b82f6]/10 transform hover:scale-105"
              >
                Start Free Trial
              </button>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Up to $500K annual revenue</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Shopify + 2 ad platforms</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Real-time profit tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Basic forecasting</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Email support</span>
                </li>
              </ul>
            </div>

            {/* Growth - Most Popular */}
            <div className="glass-morphism rounded-xl p-8 border border-[#3b82f6]/50 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white px-6 py-2 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>
              
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
                  <p className="text-xs text-[#10b981] mt-2">
                    Save ${Math.round((pricing.monthly.growth * 12 - pricing.annual.growth))} per year
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 rounded-lg font-bold transition-all mb-8 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white transform hover:scale-105 shadow-xl"
              >
                Start Free Trial
              </button>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Up to $3M annual revenue</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">All integrations included</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">AI forecasting & optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Setup concierge service</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Priority support + Slack</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">API access & exports</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="glass-morphism rounded-xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-[#8b92b0] mb-6">For large brands & agencies</p>
              
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
                  <p className="text-xs text-[#10b981] mt-2">
                    Save ${Math.round((pricing.monthly.pro * 12 - pricing.annual.pro))} per year
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full py-3 rounded-lg font-bold transition-all mb-8 border-2 border-[#3b82f6]/30 text-white hover:bg-[#3b82f6]/10 transform hover:scale-105"
              >
                Start Free Trial
              </button>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Unlimited revenue</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Multi-store dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">White-label options</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <span className="text-[#f0f2f8]">Full API & webhooks</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12 animate-on-scroll">
            <div className="flex justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-[#10b981]">
                <Check className="w-5 h-5" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-[#10b981]">
                <Shield className="w-5 h-5" />
                <span>Money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-[#10b981]">
                <Lock className="w-5 h-5" />
                <span>SSL & GDPR compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-br from-[#0a0b0f] to-[#1a1b23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              What DTC Founders Say
            </h2>
            <p className="text-xl text-[#8b92b0]">Real results from real businesses</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                title: "Founder",
                company: "Glow Beauty Co",
                revenue: "$2.8M ARR",
                rating: 5,
                quote: "Slay Season helped us identify that 40% of our Meta spend was unprofitable. We reallocated budget and increased profit by $30K/month within 2 weeks."
              },
              {
                name: "Marcus Williams", 
                title: "CEO",
                company: "Peak Supplements",
                revenue: "$1.2M ARR",
                rating: 5,
                quote: "I was spending 12 hours/week on reporting. Now it takes 30 minutes. The AI forecasting predicted our Black Friday results within 3%. Incredible accuracy."
              },
              {
                name: "Jennifer Patel",
                title: "Co-Founder", 
                company: "Sustainable Living Co",
                revenue: "$850K ARR",
                rating: 5,
                quote: "Switched from Triple Whale. Slay Season is half the price with 10x better insights. The setup concierge had us running in 4 hours. Game changer."
              },
              {
                name: "David Rodriguez",
                title: "Marketing Director",
                company: "Outdoor Gear Pro", 
                revenue: "$4.1M ARR",
                rating: 5,
                quote: "The multi-channel attribution is insane. We discovered Google Ads was driving 60% more revenue than Meta reported. Completely changed our strategy."
              },
              {
                name: "Lisa Thompson",
                title: "Founder",
                company: "Pet Paradise", 
                revenue: "$650K ARR", 
                rating: 5,
                quote: "True profit tracking saved our business. We thought we were profitable but losing $40K/month. Fixed in 3 weeks with Slay Season's recommendations."
              },
              {
                name: "Alex Chen",
                title: "CEO", 
                company: "TechWear Studios",
                revenue: "$3.5M ARR",
                rating: 5,
                quote: "The budget optimizer increased our ROAS from 3.2x to 4.8x in one month. ROI on Slay Season was 12x in year one. Absolutely essential tool."
              }
            ].map((testimonial, index) => (
              <div key={index} className="glass-morphism rounded-xl p-6 animate-on-scroll">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#f59e0b] fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-[#f0f2f8] mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-[#8b92b0] text-sm">{testimonial.title}, {testimonial.company}</div>
                  </div>
                  <div className="text-[#10b981] text-sm font-semibold">
                    {testimonial.revenue}
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
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-[#8b92b0]">Everything you need to know</p>
          </div>

          <div className="space-y-4 animate-on-scroll">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-morphism rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white pr-4">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-[#8b92b0] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8b92b0] flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-[#8b92b0] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-b border-white/5 bg-gradient-to-r from-[#3b82f6]/10 via-[#8b5cf6]/10 to-[#10b981]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-on-scroll">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-[#f87171]/20 border border-[#f87171]/40">
              <TrendingUp className="w-5 h-5 text-[#f87171]" />
              <span className="text-sm font-semibold text-[#f87171]">URGENCY</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-bold mb-6">
              Your Competition is Already
              <br />
              <span className="bg-gradient-to-r from-[#f87171] to-[#f59e0b] bg-clip-text text-transparent">
                Making Better Decisions
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-[#8b92b0] mb-8 max-w-4xl mx-auto leading-relaxed">
              While you're stuck in spreadsheet hell, your competitors are using Slay Season to scale profitably.
              <br />
              <strong className="text-[#f0f2f8]">Don't get left behind.</strong>
            </p>

            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white px-12 py-6 rounded-xl font-bold text-xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 mb-8"
            >
              Start Your Free Trial Now →
            </button>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-[#8b92b0]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#10b981]" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10b981]" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10b981]" />
                <span>Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#0a0b0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                  Slay Season
                </span>
              </div>
              <p className="text-[#8b92b0] mb-6 leading-relaxed max-w-md">
                The only ecommerce analytics platform that shows true profit, not vanity metrics. 
                Built by operators, for operators.
              </p>
              <p className="text-[#10b981] font-semibold">
                Made by ecommerce operators, for ecommerce operators.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-[#8b92b0]">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Free Trial</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-[#8b92b0]">
                <li><button onClick={() => scrollToSection('founder-story')} className="hover:text-white transition-colors">Our Story</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#8b92b0] text-sm">
              © 2024 Slay Season. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-[#8b92b0] hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="/terms" className="text-[#8b92b0] hover:text-white transition-colors text-sm">Terms of Service</a>
              <div className="flex items-center gap-4">
                <a href="#" className="w-8 h-8 glass-morphism rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <span className="text-sm">𝕏</span>
                </a>
                <a href="#" className="w-8 h-8 glass-morphism rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <span className="text-sm">in</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
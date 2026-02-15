import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Sparkles,
  Play,
  X,
  HeadphonesIcon,
  Award,
  Menu,
  Layers,
  MessageSquare,
  Lock,
  Eye,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Rocket,
  ChevronRight,
  XIcon
} from 'lucide-react';

/* ───── Animated counter hook ───── */
const useCountUp = (end, duration = 2000, start = 0, suffix = '') => {
  const [value, setValue] = useState(start);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const startTime = performance.now();
          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return { value, ref };
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingBilling, setPricingBilling] = useState('monthly');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const brands = useCountUp(847, 2200);
  const tracked = useCountUp(312, 2400);
  const accuracy = useCountUp(94, 1800);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ss-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.ss-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  const pricing = {
    monthly: { starter: 49, growth: 149, pro: 399 },
    annual: { starter: 39, growth: 119, pro: 319 },
  };
  const p = pricing[pricingBilling];

  const faqs = [
    { q: 'How long does setup take?', a: '5 minutes. One-click OAuth for Shopify, Meta, Google, and Klaviyo. No API keys, no developer needed. Or choose our concierge service and we set everything up for you.' },
    { q: 'How do you compare to Triple Whale?', a: 'Triple Whale starts at $129/mo and goes up to $2,790/mo. Their UI is cluttered and focuses on vanity metrics. Slay Season starts at $49/mo with true profit tracking, AI forecasting, and a modern interface built for clarity—not complexity.' },
    { q: 'What if I\'m not technical?', a: 'Perfect. Slay Season was built for business owners, not data scientists. Everything is point-and-click. Plus, Growth and Pro plans include concierge onboarding where our team sets up your entire dashboard.' },
    { q: 'How accurate is your profit tracking?', a: 'We factor in COGS, ad spend, shipping, payment processing fees, refunds, discounts, chargebacks, and fixed costs. Most customers report 95%+ accuracy vs. their accountant\'s numbers.' },
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click from your dashboard. 14-day free trial requires no credit card. After that, we offer a 30-day money-back guarantee, no questions asked.' },
    { q: 'What platforms do you integrate with?', a: 'Shopify (required), Meta Ads, Google Ads, GA4, Klaviyo, TikTok Ads, Snapchat Ads, Pinterest Ads, and more. We add new integrations monthly based on user requests.' },
    { q: 'Is my data secure?', a: 'Bank-level security. All data encrypted at rest (AES-256) and in transit (TLS 1.3). SOC 2 Type II compliant. GDPR ready. We never sell or share your data.' },
    { q: 'What support do you get?', a: 'Starter: email support (24hr response). Growth: priority Slack channel + setup concierge. Pro: dedicated account manager, quarterly business reviews, and custom reporting.' },
  ];

  return (
    <div className="w-full bg-[#050608] text-[#e8eaf0] overflow-hidden antialiased">
      <style>{`
        /* ── Base ── */
        .ss-reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .ss-visible { opacity: 1; transform: translateY(0); }
        .ss-delay-1 { transition-delay: .1s; }
        .ss-delay-2 { transition-delay: .2s; }
        .ss-delay-3 { transition-delay: .3s; }
        .ss-delay-4 { transition-delay: .4s; }

        /* ── Glass ── */
        .glass { backdrop-filter: blur(20px) saturate(180%); background: rgba(14,17,28,.72); border: 1px solid rgba(255,255,255,.06); }
        .glass-strong { backdrop-filter: blur(24px) saturate(200%); background: rgba(14,17,28,.88); border: 1px solid rgba(255,255,255,.08); }

        /* ── Gradient border ── */
        .gradient-border { position: relative; }
        .gradient-border::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(99,102,241,.4), rgba(168,85,247,.4), rgba(16,185,129,.2)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }

        /* ── Glow ── */
        .glow-blue { box-shadow: 0 0 60px -12px rgba(99,102,241,.25), 0 0 120px -40px rgba(99,102,241,.15); }
        .glow-sm { box-shadow: 0 0 30px -8px rgba(99,102,241,.2); }

        /* ── Animated mesh bg ── */
        .mesh-bg { background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,.12), transparent), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168,85,247,.08), transparent), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(16,185,129,.06), transparent); }

        /* ── Shimmer ── */
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .shimmer { background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,.04) 50%, transparent 70%); background-size: 200% 100%; animation: shimmer 3s ease-in-out infinite; }

        /* ── Pulse ring ── */
        @keyframes pulse-ring { 0% { transform: scale(.95); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
        .pulse-ring::after { content: ''; position: absolute; inset: -4px; border-radius: inherit; border: 2px solid rgba(16,185,129,.4); animation: pulse-ring 2s ease-out infinite; }

        /* ── Float ── */
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .float { animation: float 4s ease-in-out infinite; }
        .float-delay { animation: float 4s ease-in-out 1s infinite; }

        /* ── CTA btn ── */
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); position: relative; overflow: hidden; transition: all .3s ease; }
        .btn-primary:hover { box-shadow: 0 8px 40px -8px rgba(99,102,241,.45); transform: translateY(-1px); }
        .btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #818cf8, #a78bfa); opacity: 0; transition: opacity .3s; }
        .btn-primary:hover::after { opacity: 1; }
        .btn-primary > * { position: relative; z-index: 1; }

        /* ── Metric card hover ── */
        .metric-card { transition: all .3s ease; }
        .metric-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px -12px rgba(0,0,0,.5); }

        /* ── Pricing popular ── */
        .pricing-popular { background: linear-gradient(135deg, rgba(99,102,241,.08), rgba(168,85,247,.08)); border: 1px solid rgba(99,102,241,.3); }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050608; }
        ::-webkit-scrollbar-thumb { background: #1e2030; border-radius: 3px; }

        /* ── Selection ── */
        ::selection { background: rgba(99,102,241,.3); }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'glass-strong shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Slay Season</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {[['Features', 'features'], ['Pricing', 'pricing'], ['How It Works', 'how-it-works'], ['FAQ', 'faq']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-[#8b92b0] hover:text-white transition-colors duration-200">{label}</button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-[#8b92b0] hover:text-white transition-colors px-4 py-2">Log in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-white px-5 py-2 rounded-lg text-sm font-semibold">
              <span className="flex items-center gap-1.5">Start Free Trial <ArrowRight className="w-3.5 h-3.5" /></span>
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/5 animate-in">
            <div className="px-4 py-5 space-y-3">
              {[['Features', 'features'], ['Pricing', 'pricing'], ['How It Works', 'how-it-works'], ['FAQ', 'faq']].map(([label, id]) => (
                <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-[#8b92b0] hover:text-white py-2">{label}</button>
              ))}
              <hr className="border-white/5" />
              <button onClick={() => navigate('/login')} className="block w-full text-left text-[#8b92b0] hover:text-white py-2">Log in</button>
              <button onClick={() => navigate('/signup')} className="w-full btn-primary text-white py-2.5 rounded-lg font-semibold text-sm">
                <span>Start Free Trial</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100vh] flex items-center pt-16 mesh-bg">
        {/* Ambient orbs */}
        <div className="absolute top-20 left-[15%] w-[500px] h-[500px] bg-indigo-600/[.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] bg-purple-600/[.06] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Social proof pill */}
          <div className="ss-reveal inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full glass gradient-border text-sm">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium" ref={brands.ref}>{brands.value}+ brands</span>
            </span>
            <span className="w-px h-4 bg-white/10" />
            <span className="text-[#8b92b0]" ref={tracked.ref}>${tracked.value}M+ revenue tracked</span>
            <span className="w-px h-4 bg-white/10 hidden sm:block" />
            <span className="text-[#8b92b0] hidden sm:inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              4.9/5 on Shopify
            </span>
          </div>

          {/* Headline */}
          <h1 className="ss-reveal ss-delay-1 text-[2.75rem] sm:text-6xl lg:text-[5rem] font-extrabold leading-[1.05] tracking-tight mb-6">
            Know Your
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              True Profit
            </span>
            <br />
            In Real Time
          </h1>

          <p className="ss-reveal ss-delay-2 text-lg sm:text-xl text-[#8b92b0] max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop guessing. Slay Season unifies Shopify, Meta, Google & Klaviyo into one dashboard with
            <strong className="text-white"> true profit tracking</strong>,{' '}
            <strong className="text-white">AI forecasting</strong>, and{' '}
            <strong className="text-white">budget optimization</strong> — in 5 minutes.
          </p>

          {/* CTA row */}
          <div className="ss-reveal ss-delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary w-full sm:w-auto text-white px-8 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group"
            >
              <span className="flex items-center gap-2">
                Start Free Trial — No Card Required
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => scrollTo('demo')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-base glass hover:bg-white/[.04] transition-all flex items-center justify-center gap-2 text-[#c4c9d8]"
            >
              <Play className="w-4 h-4" />
              Watch 2-Min Demo
            </button>
          </div>

          {/* Trust line */}
          <div className="ss-reveal ss-delay-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#6b7194]">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />14-day free trial</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-500" />5-min setup</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-500" />SOC 2 compliant</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" />Cancel anytime</span>
          </div>

          {/* Dashboard mockup */}
          <div className="ss-reveal mt-16 max-w-5xl mx-auto">
            <div className="gradient-border rounded-2xl glow-blue">
              <div className="glass rounded-2xl p-1">
                <div className="bg-[#0a0c14] rounded-xl overflow-hidden">
                  {/* Title bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-[#4a4f6a] bg-[#12141f] px-4 py-1 rounded-md">dashboard.slayseason.com</span>
                    </div>
                  </div>
                  {/* Metrics row */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'True Profit', value: '$127,340', change: '+18.3%', color: 'emerald' },
                        { label: 'Revenue', value: '$423,891', change: '+12.7%', color: 'indigo' },
                        { label: 'True ROAS', value: '4.7x', change: '+0.8x', color: 'purple' },
                        { label: 'AI Forecast', value: '$1.2M', change: '90-day', color: 'amber' },
                      ].map((m, i) => (
                        <div key={i} className={`metric-card bg-${m.color === 'emerald' ? '[#0d1f17]' : m.color === 'indigo' ? '[#0d0f1f]' : m.color === 'purple' ? '[#150d1f]' : '[#1f1a0d]'} rounded-lg p-4 border border-white/[.04]`}>
                          <p className="text-[10px] uppercase tracking-wider text-[#6b7194] mb-1">{m.label}</p>
                          <p className={`text-xl font-bold ${m.color === 'emerald' ? 'text-emerald-400' : m.color === 'indigo' ? 'text-indigo-400' : m.color === 'purple' ? 'text-purple-400' : 'text-amber-400'}`}>{m.value}</p>
                          <p className="text-[10px] text-emerald-500 mt-0.5">↑ {m.change}</p>
                        </div>
                      ))}
                    </div>
                    {/* Chart placeholder */}
                    <div className="bg-[#0a0c14] border border-white/[.04] rounded-lg p-4 h-44 flex items-end gap-1">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const h = 20 + Math.sin(i * 0.5) * 15 + (i / 28) * 50 + Math.random() * 8;
                        return (
                          <div key={i} className="flex-1 rounded-t transition-all" style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, rgba(99,102,241,${0.3 + (i / 28) * 0.5}), rgba(139,92,246,${0.2 + (i / 28) * 0.4}))`,
                          }} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LOGOS / INTEGRATIONS ═══ */}
      <section className="py-14 border-y border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-[.2em] text-[#4a4f6a] mb-8">Integrates with your stack in one click</p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10">
            {[
              { name: 'Shopify', color: '#95bf47', letter: 'S' },
              { name: 'Meta Ads', color: '#1877f2', letter: 'M' },
              { name: 'Google Ads', color: '#4285f4', letter: 'G' },
              { name: 'Klaviyo', color: '#ff6900', letter: 'K' },
              { name: 'TikTok Ads', color: '#ee1d52', letter: 'T' },
              { name: 'GA4', color: '#e37400', letter: 'A' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[#6b7194] hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity" style={{ background: p.color }}>{p.letter}</div>
                <span className="text-sm font-medium hidden sm:inline">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/[.03] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 ss-reveal">
            <p className="text-xs uppercase tracking-[.2em] text-red-400/80 mb-3 font-medium">Sound familiar?</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              You're Flying <span className="text-red-400">Blind</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock className="w-5 h-5" />,
                pain: '"I spend 15 hours every week updating spreadsheets across 6 platforms. By the time I finish, the data is outdated."',
                who: 'Sarah M. — Beauty Brand, $2M ARR',
              },
              {
                icon: <Eye className="w-5 h-5" />,
                pain: '"Meta shows 4.2x ROAS, Google shows 6.1x. Revenue is up. But my bank balance is shrinking. Which numbers do I trust?"',
                who: 'Marcus T. — Supplements, $500K ARR',
              },
              {
                icon: <Target className="w-5 h-5" />,
                pain: '"iOS 14 broke everything. I\'m wasting thousands on ads that look good in Meta but don\'t drive real profit."',
                who: 'Jennifer K. — Fashion Brand, $3M ARR',
              },
            ].map((item, i) => (
              <div key={i} className={`ss-reveal ss-delay-${i + 1} glass rounded-xl p-7 border border-red-500/[.08] hover:border-red-500/20 transition-colors`}>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 mb-5">{item.icon}</div>
                <p className="text-[#c4c9d8] italic leading-relaxed mb-5 text-[15px]">{item.pain}</p>
                <p className="text-xs text-[#6b7194]">— {item.who}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOLUTION / BEFORE-AFTER ═══ */}
      <section className="py-24 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 ss-reveal">
            <p className="text-xs uppercase tracking-[.2em] text-emerald-400/80 mb-3 font-medium">The fix</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              One Dashboard. <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Zero Guesswork.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 ss-reveal">
            {/* Before */}
            <div className="glass rounded-xl p-8 border border-red-500/[.08]">
              <h3 className="text-lg font-bold text-red-400 mb-6 flex items-center gap-2"><X className="w-5 h-5" /> Without Slay Season</h3>
              <div className="space-y-4">
                {['15+ hours/week on manual spreadsheets', 'Data scattered across 6+ platforms', 'Vanity metrics hiding real costs', 'Flying blind on ad spend decisions', 'No idea what\'s actually profitable'].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-[#8b92b0]">
                    <X className="w-4 h-4 text-red-400/60 flex-shrink-0" /><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* After */}
            <div className="glass rounded-xl p-8 border border-emerald-500/[.15] bg-emerald-500/[.02]">
              <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> With Slay Season</h3>
              <div className="space-y-4">
                {['5-minute daily check-ins replace hours of work', 'All channels unified in one real-time view', 'True profit after every cost', 'AI tells you exactly where to allocate budget', 'Know which campaigns, products & channels profit'].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-[#c4c9d8]">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outcome metrics */}
          <div className="grid sm:grid-cols-3 gap-6 mt-12 ss-reveal">
            {[
              { icon: <Clock className="w-5 h-5" />, metric: '10+ hrs/week', desc: 'Time saved on reporting', color: 'emerald' },
              { icon: <TrendingUp className="w-5 h-5" />, metric: '15–30%', desc: 'Average profit increase', color: 'indigo' },
              { icon: <Brain className="w-5 h-5" />, metric: '94%', desc: 'Forecast accuracy', color: 'purple' },
            ].map((o, i) => (
              <div key={i} className={`ss-delay-${i + 1} text-center glass rounded-xl p-6 gradient-border`}>
                <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${o.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : o.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>{o.icon}</div>
                <p className="text-2xl font-bold text-white">{o.metric}</p>
                <p className="text-sm text-[#6b7194] mt-1">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-24 border-t border-white/[.04] mesh-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 ss-reveal">
            <p className="text-xs uppercase tracking-[.2em] text-indigo-400/80 mb-3 font-medium">Features</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Everything You Need to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Scale Profitably</span>
            </h2>
          </div>

          {/* Feature 1 – Profit Tracking */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24 ss-reveal">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" /> Core Feature
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">True Profit Tracking</h3>
              <p className="text-[#8b92b0] mb-6 leading-relaxed">
                See your <em>actual</em> profit — not revenue vanity metrics. We automatically factor in COGS, ad spend, shipping, payment fees, refunds, and fixed costs. Know exactly what hits your bank account.
              </p>
              <ul className="space-y-3">
                {['Real-time margins by product, channel & campaign', 'Automatically accounts for every cost line', 'Identifies your most & least profitable products'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[#c4c9d8] text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-xl p-5 gradient-border">
              <p className="text-xs uppercase tracking-wider text-[#6b7194] mb-4 text-center">Profit Waterfall — This Month</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Gross Revenue', value: '$84,250', color: 'text-white' },
                  { label: 'COGS', value: '-$33,700', color: 'text-red-400' },
                  { label: 'Ad Spend', value: '-$16,850', color: 'text-red-400' },
                  { label: 'Shipping & Fees', value: '-$8,425', color: 'text-red-400' },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 px-4 bg-white/[.02] rounded-lg">
                    <span className="text-sm text-[#8b92b0]">{r.label}</span>
                    <span className={`font-semibold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
                <div className="border-t border-white/5 pt-2.5">
                  <div className="flex justify-between items-center py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <span className="font-bold text-emerald-400">True Profit</span>
                    <span className="font-bold text-emerald-400 text-xl">$25,275</span>
                  </div>
                  <p className="text-center text-xs text-[#6b7194] mt-2">30% margin — 2x industry average</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 – AI Forecasting */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24 ss-reveal">
            <div className="order-2 lg:order-1 glass rounded-xl p-5 gradient-border">
              <p className="text-xs uppercase tracking-wider text-[#6b7194] mb-4 text-center">AI Revenue Forecast — Next 90 Days</p>
              <div className="h-48 flex items-end gap-[3px] mb-4 px-2">
                {Array.from({ length: 24 }).map((_, i) => {
                  const base = 30 + (i / 24) * 45;
                  const actual = i < 16;
                  return (
                    <div key={i} className="flex-1 rounded-t-sm transition-all" style={{
                      height: `${base + Math.sin(i * 0.6) * 10}%`,
                      background: actual
                        ? `linear-gradient(to top, rgba(99,102,241,.6), rgba(99,102,241,.3))`
                        : `linear-gradient(to top, rgba(168,85,247,.4), rgba(168,85,247,.15))`,
                      opacity: actual ? 1 : 0.7,
                      borderTop: actual ? 'none' : '2px dashed rgba(168,85,247,.4)',
                    }} />
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Conservative', value: '$89K', color: 'text-[#8b92b0]' },
                  { label: 'Expected', value: '$127K', color: 'text-emerald-400' },
                  { label: 'Optimistic', value: '$165K', color: 'text-indigo-400' },
                ].map((f, i) => (
                  <div key={i} className="bg-white/[.02] rounded-lg py-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#6b7194]">{f.label}</p>
                    <p className={`font-bold ${f.color}`}>{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400">
                <Brain className="w-3.5 h-3.5" /> AI-Powered
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Revenue Forecasting</h3>
              <p className="text-[#8b92b0] mb-6 leading-relaxed">
                Predict revenue, profit, and cash flow with 85%+ accuracy. Our AI learns from your historical data, seasonality, and market trends to give you confidence in planning inventory, budgets, and hiring.
              </p>
              <ul className="space-y-3">
                {['90-day rolling forecasts with confidence intervals', 'Seasonal trend detection & anomaly alerts', 'Cash flow predictions to avoid surprises'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[#c4c9d8] text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 ss-reveal">
            {[
              { icon: <Target className="w-5 h-5" />, title: 'Budget Optimizer', desc: 'AI recommends optimal spend allocation across channels. Average +22% ROAS improvement.', tag: 'AI-Powered', color: 'indigo' },
              { icon: <Layers className="w-5 h-5" />, title: 'Multi-Channel Attribution', desc: 'True cross-channel attribution that works post-iOS 14. See which touchpoints actually drive revenue.', tag: 'Post-iOS 14', color: 'purple' },
              { icon: <MessageSquare className="w-5 h-5" />, title: 'AI Chat Assistant', desc: 'Ask questions about your data in plain English. "What was my best-performing product last month?"', tag: 'Natural Language', color: 'emerald' },
              { icon: <Cpu className="w-5 h-5" />, title: 'Custom Reports', desc: 'Build any report with our visual editor. Drag-and-drop. No code required.', tag: 'Visual Editor', color: 'amber' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'AI Insights', desc: 'Proactive alerts when something changes. "Your CAC increased 23% — here\'s why."', tag: 'Proactive', color: 'indigo' },
              { icon: <Shield className="w-5 h-5" />, title: 'Enterprise Security', desc: 'SOC 2 Type II, AES-256 encryption, GDPR compliant. Your data is locked down.', tag: 'SOC 2', color: 'emerald' },
            ].map((f, i) => (
              <div key={i} className={`ss-delay-${(i % 3) + 1} glass rounded-xl p-6 hover:bg-white/[.02] transition-colors group`}>
                <div className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center ${f.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : f.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : f.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{f.icon}</div>
                <h4 className="font-bold text-white mb-2">{f.title}</h4>
                <p className="text-sm text-[#8b92b0] leading-relaxed mb-3">{f.desc}</p>
                <span className={`text-[10px] uppercase tracking-wider font-medium ${f.color === 'indigo' ? 'text-indigo-400' : f.color === 'purple' ? 'text-purple-400' : f.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-24 border-t border-white/[.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 ss-reveal">
            <p className="text-xs uppercase tracking-[.2em] text-indigo-400/80 mb-3 font-medium">How it works</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Live in <span className="text-indigo-400">5 Minutes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 ss-reveal">
            {[
              { step: '01', title: 'Connect Your Store', desc: 'One-click OAuth for Shopify and your ad platforms. No API keys. No developers.', time: '2 minutes', icon: <Zap className="w-5 h-5" /> },
              { step: '02', title: 'See Real Numbers', desc: 'Unified dashboard with true profit, ROAS, and performance across every channel — instantly.', time: 'Instant', icon: <BarChart3 className="w-5 h-5" /> },
              { step: '03', title: 'Scale Profitably', desc: 'Use AI insights, forecasting, and budget optimization to make confident decisions daily.', time: 'Ongoing', icon: <Rocket className="w-5 h-5" /> },
            ].map((s, i) => (
              <div key={i} className={`ss-delay-${i + 1} relative glass rounded-xl p-7 group hover:bg-white/[.02] transition-all`}>
                <div className="text-[64px] font-black text-white/[.03] absolute top-4 right-5 leading-none">{s.step}</div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5">{s.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-[#8b92b0] leading-relaxed mb-4">{s.desc}</p>
                <span className="text-xs text-indigo-400 font-medium">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONCIERGE ═══ */}
      <section className="py-24 border-t border-white/[.04] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/[.08] via-transparent to-purple-950/[.06] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center ss-reveal">
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
              <HeadphonesIcon className="w-3.5 h-3.5" /> White-Glove Onboarding
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">
              We'll Set It Up <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">For You</span>
            </h2>
            <p className="text-lg text-[#8b92b0] max-w-2xl mx-auto mb-12 leading-relaxed">
              Don't want to deal with setup? Our team connects your platforms, configures your dashboard,
              validates your data, and has everything ready — usually within 24 hours.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mb-10 ss-reveal">
            {[
              { icon: '📧', title: 'Share Access', desc: 'Securely share your platform credentials via encrypted transfer.' },
              { icon: '⚙️', title: 'We Configure', desc: 'Our team connects everything, sets up tracking, and validates accuracy.' },
              { icon: '✅', title: 'You\'re Live', desc: 'Get notified when your dashboard is ready. Start making decisions.' },
            ].map((s, i) => (
              <div key={i} className={`ss-delay-${i + 1} glass rounded-xl p-6 text-center`}>
                <span className="text-3xl mb-3 block">{s.icon}</span>
                <h4 className="font-bold text-white mb-2">{s.title}</h4>
                <p className="text-sm text-[#8b92b0]">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="ss-reveal glass rounded-xl p-5 border border-emerald-500/10 flex items-center justify-center gap-3 text-sm text-[#8b92b0]">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Bank-level encryption · SOC 2 compliant · Credentials deleted after setup · Available on Growth & Pro plans</span>
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="py-24 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 ss-reveal">
            <p className="text-xs uppercase tracking-[.2em] text-amber-400/80 mb-3 font-medium">Testimonials</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Trusted by <span className="text-indigo-400">800+</span> DTC Brands
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 ss-reveal">
            {[
              { name: 'Sarah Chen', role: 'Founder, Glow Beauty Co', rev: '$2.8M ARR', quote: 'Identified 40% of our Meta spend was unprofitable. Reallocated budget and increased profit by $30K/month in 2 weeks.' },
              { name: 'Marcus Williams', role: 'CEO, Peak Supplements', rev: '$1.2M ARR', quote: 'Went from 12 hours/week on reporting to 30 minutes. AI forecasting predicted our Black Friday results within 3%.' },
              { name: 'Jennifer Patel', role: 'Co-Founder, Sustainable Living Co', rev: '$850K ARR', quote: 'Switched from Triple Whale. Half the price, 10x better insights. Setup concierge had us running in 4 hours.' },
              { name: 'David Rodriguez', role: 'Marketing Dir, Outdoor Gear Pro', rev: '$4.1M ARR', quote: 'Discovered Google Ads was driving 60% more revenue than Meta reported. Completely changed our strategy.' },
              { name: 'Lisa Thompson', role: 'Founder, Pet Paradise', rev: '$650K ARR', quote: 'We thought we were profitable — actually losing $40K/month. Fixed in 3 weeks with Slay Season\'s recommendations.' },
              { name: 'Alex Park', role: 'CEO, TechWear Studios', rev: '$3.5M ARR', quote: 'Budget optimizer increased ROAS from 3.2x to 4.8x in one month. 12x ROI on Slay Season in year one.' },
            ].map((t, i) => (
              <div key={i} className={`ss-delay-${(i % 3) + 1} glass rounded-xl p-6 hover:bg-white/[.02] transition-colors`}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-[#c4c9d8] text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-[#6b7194]">{t.role}</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">{t.rev}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 ss-reveal">
            {[
              { icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, text: '4.9/5 Shopify App Store' },
              { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'SOC 2 Type II Certified' },
              { icon: <Users className="w-4 h-4 text-indigo-400" />, text: '847+ Active Brands' },
              { icon: <Lock className="w-4 h-4 text-purple-400" />, text: 'GDPR Compliant' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#6b7194]">
                {b.icon}<span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section className="py-24 border-t border-white/[.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 ss-reveal">
            <p className="text-xs uppercase tracking-[.2em] text-indigo-400/80 mb-3 font-medium">Comparison</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              How We Stack Up
            </h2>
          </div>

          <div className="overflow-x-auto ss-reveal -mx-4 px-4">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/[.06]">
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6b7194]">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-indigo-400 bg-indigo-500/[.05] rounded-t-lg">Slay Season</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#6b7194]">Triple Whale</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#6b7194]">Northbeam</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-[#6b7194]">Polar</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: 'Starting Price', ss: '$49/mo', tw: '$129/mo', nb: '$999/mo', po: '$200/mo', ssHighlight: true },
                  { feature: 'True Profit Tracking', ss: true, tw: false, nb: false, po: 'Limited' },
                  { feature: 'AI Forecasting', ss: true, tw: false, nb: 'Basic', po: false },
                  { feature: 'Budget Optimizer', ss: true, tw: 'Basic', nb: 'Basic', po: false },
                  { feature: 'Concierge Setup', ss: true, tw: false, nb: 'Enterprise', po: false },
                  { feature: 'Setup Time', ss: '5 min', tw: '30+ min', nb: 'Hours', po: '15 min', ssHighlight: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/[.04]">
                    <td className="py-3.5 px-4 font-medium text-[#c4c9d8]">{row.feature}</td>
                    <td className="text-center py-3.5 px-4 bg-indigo-500/[.03]">
                      {typeof row.ss === 'boolean' ? (
                        row.ss ? <Check className="w-4.5 h-4.5 mx-auto text-emerald-400" /> : <X className="w-4.5 h-4.5 mx-auto text-red-400/40" />
                      ) : <span className={`font-semibold ${row.ssHighlight ? 'text-emerald-400' : 'text-white'}`}>{row.ss}</span>}
                    </td>
                    {[row.tw, row.nb, row.po].map((val, j) => (
                      <td key={j} className="text-center py-3.5 px-4">
                        {typeof val === 'boolean' ? (
                          val ? <Check className="w-4.5 h-4.5 mx-auto text-emerald-400" /> : <X className="w-4.5 h-4.5 mx-auto text-red-400/40" />
                        ) : <span className="text-[#6b7194]">{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-24 border-t border-white/[.04] mesh-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 ss-reveal">
            <p className="text-xs uppercase tracking-[.2em] text-indigo-400/80 mb-3 font-medium">Pricing</p>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#8b92b0] mb-8">14-day free trial. No credit card required. Cancel anytime.</p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 glass rounded-full px-1.5 py-1.5">
              <button
                onClick={() => setPricingBilling('monthly')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${pricingBilling === 'monthly' ? 'bg-indigo-500/20 text-white' : 'text-[#6b7194]'}`}
              >Monthly</button>
              <button
                onClick={() => setPricingBilling('annual')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${pricingBilling === 'annual' ? 'bg-indigo-500/20 text-white' : 'text-[#6b7194]'}`}
              >Annual <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">-20%</span></button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto ss-reveal">
            {/* Starter */}
            <div className="glass rounded-xl p-7">
              <h3 className="text-lg font-bold text-white mb-1">Starter</h3>
              <p className="text-sm text-[#6b7194] mb-5">For brands getting started</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">${p.starter}</span>
                <span className="text-[#6b7194] text-sm">/mo</span>
                {pricingBilling === 'annual' && <p className="text-xs text-emerald-400 mt-1">Billed annually · Save ${(49 - 39) * 12}/yr</p>}
              </div>
              <button onClick={() => navigate('/signup')} className="w-full py-2.5 rounded-lg text-sm font-semibold border border-white/10 text-white hover:bg-white/[.04] transition-all mb-6">Start Free Trial</button>
              <ul className="space-y-3 text-sm">
                {['Up to $500K annual revenue', 'Shopify + 2 ad platforms', 'Real-time profit tracking', 'Basic forecasting', 'Email support (24hr)'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[#8b92b0]"><Check className="w-4 h-4 text-emerald-400/60 flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
            </div>

            {/* Growth */}
            <div className="pricing-popular rounded-xl p-7 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-indigo-500/20">Most Popular</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Growth</h3>
              <p className="text-sm text-[#6b7194] mb-5">For scaling brands</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">${p.growth}</span>
                <span className="text-[#6b7194] text-sm">/mo</span>
                {pricingBilling === 'annual' && <p className="text-xs text-emerald-400 mt-1">Billed annually · Save ${(149 - 119) * 12}/yr</p>}
              </div>
              <button onClick={() => navigate('/signup')} className="w-full btn-primary py-2.5 rounded-lg text-sm font-semibold text-white mb-6">
                <span>Start Free Trial</span>
              </button>
              <ul className="space-y-3 text-sm">
                {['Up to $3M annual revenue', 'All integrations included', 'AI forecasting & budget optimizer', 'Concierge setup service', 'Priority Slack support', 'API access & data exports'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[#c4c9d8]"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="glass rounded-xl p-7">
              <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
              <p className="text-sm text-[#6b7194] mb-5">For large brands & agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">${p.pro}</span>
                <span className="text-[#6b7194] text-sm">/mo</span>
                {pricingBilling === 'annual' && <p className="text-xs text-emerald-400 mt-1">Billed annually · Save ${(399 - 319) * 12}/yr</p>}
              </div>
              <button onClick={() => navigate('/signup')} className="w-full py-2.5 rounded-lg text-sm font-semibold border border-white/10 text-white hover:bg-white/[.04] transition-all mb-6">Start Free Trial</button>
              <ul className="space-y-3 text-sm">
                {['Unlimited revenue', 'Multi-store dashboard', 'Custom integrations', 'Dedicated account manager', 'White-label options', 'Full API & webhooks'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[#8b92b0]"><Check className="w-4 h-4 text-emerald-400/60 flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trust badges under pricing */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-[#6b7194] ss-reveal">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" />14-day free trial</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-400" />No credit card required</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" />30-day money-back guarantee</span>
          </div>
        </div>
      </section>

      {/* ═══ FOUNDER STORY ═══ */}
      <section id="founder-story" className="py-24 border-t border-white/[.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-center ss-reveal">
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                <Award className="w-3.5 h-3.5" /> Built by Operators
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                We Built the Tool We Wished Existed
              </h2>
              <div className="space-y-4 text-[#8b92b0] leading-relaxed">
                <p>
                  <strong className="text-white">After a decade in ecommerce</strong> — running brands, managing ad spend, and helping hundreds of Shopify merchants scale — we were exhausted by the same problem every single day: <em>where's the real profit?</em>
                </p>
                <p>
                  We tried Triple Whale, Northbeam, BeProfit, spreadsheets, custom dashboards. Nothing gave us what we needed: a simple, accurate view of true profit across all channels.
                </p>
                <p className="text-white font-medium">
                  So we built Slay Season. The dashboard we wished we had for our own businesses.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="glass rounded-xl p-6 gradient-border">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">L</div>
                  <div>
                    <p className="font-bold text-white">Leo Martinez</p>
                    <p className="text-xs text-[#6b7194]">Co-Founder & CEO</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { val: '10+', label: 'Years in DTC' },
                    { val: '500+', label: 'Brands Helped' },
                    { val: '$50M+', label: 'Revenue Managed' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/[.02] rounded-lg py-3">
                      <p className="text-lg font-bold text-white">{s.val}</p>
                      <p className="text-[10px] text-[#6b7194] uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-24 border-t border-white/[.04]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 ss-reveal">
            <p className="text-xs uppercase tracking-[.2em] text-indigo-400/80 mb-3 font-medium">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Common Questions</h2>
          </div>

          <div className="space-y-2 ss-reveal">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-white/[.02] transition-colors"
                >
                  <span className="font-medium text-[#e8eaf0] text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#6b7194] flex-shrink-0 transition-transform ${expandedFAQ === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedFAQ === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-[#8b92b0] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-24 border-t border-white/[.04] relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/[.06] rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="ss-reveal">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">
              Ready to See Your <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">True Profit</span>?
            </h2>
            <p className="text-lg text-[#8b92b0] mb-8 max-w-xl mx-auto leading-relaxed">
              Join 800+ DTC brands who replaced spreadsheets, guesswork, and overpriced tools with Slay Season.
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
            <p className="text-xs text-[#4a4f6a] mt-4">No credit card · 5-min setup · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-14 border-t border-white/[.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">Slay Season</span>
              </div>
              <p className="text-sm text-[#6b7194] leading-relaxed">True profit analytics for DTC brands. Built by operators, for operators.</p>
            </div>
            {[
              { title: 'Product', links: [['Features', () => scrollTo('features')], ['Pricing', () => scrollTo('pricing')], ['Free Trial', () => navigate('/signup')], ['Integrations', null]] },
              { title: 'Company', links: [['Our Story', () => scrollTo('founder-story')], ['Blog', null], ['Contact', null], ['Careers', null]] },
              { title: 'Legal', links: [['Privacy Policy', () => navigate('/privacy')], ['Terms of Service', () => navigate('/terms')], ['Security', null], ['GDPR', null]] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(([label, action], j) => (
                    <li key={j}>
                      <button onClick={action || (() => {})} className="text-sm text-[#6b7194] hover:text-white transition-colors">{label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#4a4f6a]">© 2025 Slay Season. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['𝕏', 'in'].map((s, i) => (
                <a key={i} href="#" className="w-7 h-7 glass rounded-md flex items-center justify-center text-xs text-[#6b7194] hover:text-white transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
